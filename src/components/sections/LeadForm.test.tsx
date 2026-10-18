// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { OrderProvider } from "@/context/OrderProvider";
import { LeadForm } from "./LeadForm";

const fetchMock = vi.fn<typeof fetch>();

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

const click = (name: string | RegExp) => fireEvent.click(screen.getByRole("button", { name }));
const type = (label: string, value: string) =>
  fireEvent.change(screen.getByLabelText(label), { target: { value } });
const notice = () => screen.getAllByRole("status").find((el) => el.tagName === "P")!;
const reply = (status: number, body: string) =>
  fetchMock.mockResolvedValueOnce(new Response(body, { status }));

function setup() {
  render(
    <OrderProvider>
      <LeadForm />
    </OrderProvider>,
  );
}

function toStep2() {
  click("Добавить Колумбия Уила");
  click("Дальше");
}

async function send() {
  await act(async () => {
    click("Отправить заявку");
  });
}

function fillContacts(phone = "+375 29 123-45-67") {
  type("Ваше имя", "Аня");
  type("Телефон", phone);
}

describe("шаг 1", () => {
  it("не пускает дальше без пачки и убирает ошибку, когда пачка есть", () => {
    setup();
    click("Дальше");
    expect(screen.getByRole("alert").textContent).toBe("Добавьте хотя бы одну пачку плюсом");
    expect(screen.getByText("Шаг 1 из 2")).toBeTruthy();

    click("Добавить Эфиопия Иргачеффе");
    expect(screen.queryByRole("alert")).toBeNull();
    click("Дальше");
    expect(screen.getByText("Шаг 2 из 2")).toBeTruthy();
    expect(screen.getByText("Заказ: Эфиопия, 32 BYN")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Ваше имя"));
  });

  it("подписка даёт отметить не больше двух сортов", () => {
    setup();
    click("Подписка");
    click("Дальше");
    expect(screen.getByRole("alert").textContent).toBe("Отметьте хотя бы один сорт");

    fireEvent.click(screen.getByRole("checkbox", { name: /Эфиопия/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /Колумбия/ }));
    expect(screen.getByRole("checkbox", { name: /Бразилия/ })).toHaveProperty("disabled", true);
    click("Дальше");
    expect(screen.getByText("Подписка: Эфиопия + Колумбия")).toBeTruthy();
  });

  it("один сорт подписки это две пачки его", () => {
    setup();
    click("Подписка");
    fireEvent.click(screen.getByRole("checkbox", { name: /Бразилия/ }));
    click("Дальше");
    expect(screen.getByText("Подписка: Бразилия × 2")).toBeTruthy();
  });

  it("вопрос нужен текстом", () => {
    setup();
    click("Вопрос");
    click("Дальше");
    expect(screen.getByRole("alert").textContent).toMatch(/Напишите вопрос/);
    type("Ваш вопрос", "Какой помол под турку?");
    click("Дальше");
    expect(screen.getByText("Вопрос: Какой помол под турку?")).toBeTruthy();
  });

  it("назад возвращает фокус на выбранный вариант", () => {
    setup();
    toStep2();
    click("Назад");
    expect(screen.getByText("Шаг 1 из 2")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Разовый заказ" }));
  });
});

describe("отправка", () => {
  it("не отправляет неверный номер и показывает подсказку", async () => {
    setup();
    toStep2();
    type("Телефон", "+7 999 123-45-67");
    await send();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(screen.getByText(/Напишите, как к вам обращаться/)).toBeTruthy();
    expect(screen.getByText(/Этот номер не подходит/)).toBeTruthy();
    expect(screen.getByLabelText("Телефон").getAttribute("aria-invalid")).toBe("true");
  });

  it("шлёт заказ с источником и ловушкой и благодарит", async () => {
    history.replaceState(null, "", "/?utm_source=instagram&yclid=7");
    setup();
    toStep2();
    fillContacts("8 029 123 45 67");
    reply(200, '{"ok":true,"duplicate":false}');
    await send();

    const body = JSON.parse(String(fetchMock.mock.calls[0][1]?.body));
    expect(body).toMatchObject({
      name: "Аня",
      interest: "order",
      items: [{ id: "col", qty: 1 }],
      subs: [],
      website: "",
      source: {
        utm_source: "instagram",
        click_id: "7",
        landing_page: "/?utm_source=instagram&yclid=7",
      },
    });
    expect(typeof body.startedAt).toBe("number");
    expect(notice().textContent).toBe("Спасибо, заявка у нас. Перезвоним на +375 29 123-45-67.");
    expect(screen.getByRole("button", { name: "Заявка отправлена" })).toHaveProperty(
      "disabled",
      true,
    );
    history.replaceState(null, "", "/");
  });

  it("на дубль говорит честно и даёт телефон", async () => {
    setup();
    toStep2();
    fillContacts();
    reply(200, '{"ok":true,"duplicate":true}');
    await send();
    const status = notice();
    expect(status.textContent).toMatch(/уже у нас, повторять не нужно/);
    expect(status.querySelector("a")?.getAttribute("href")).toBe("tel:+375290000000");
  });

  it("429 с телом не в json: видна ошибка, данные на месте, кнопка доступна", async () => {
    setup();
    toStep2();
    fillContacts();
    type("Комментарий", "помол под турку");
    reply(429, "Too Many Requests");
    await send();

    const alert = screen.getByRole("alert");
    expect(alert.textContent).toMatch(/Слишком много попыток/);
    expect(alert.querySelector("a")?.getAttribute("href")).toBe("tel:+375290000000");
    expect(screen.getByLabelText("Ваше имя")).toHaveProperty("value", "Аня");
    expect(screen.getByLabelText("Телефон")).toHaveProperty("value", "+375 29 123-45-67");
    expect(screen.getByLabelText("Комментарий")).toHaveProperty("value", "помол под турку");
    expect(screen.getByRole("button", { name: "Отправить заявку" })).toHaveProperty(
      "disabled",
      false,
    );
  });

  it("после сбоя сети можно отправить ещё раз", async () => {
    setup();
    toStep2();
    fillContacts();
    fetchMock.mockRejectedValueOnce(new TypeError("Failed to fetch"));
    await send();
    expect(screen.getByRole("alert").textContent).toMatch(/Не получилось отправить заявку/);

    reply(200, '{"ok":true,"duplicate":false}');
    await send();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(notice().textContent).toMatch(/Спасибо/);
  });

  it("показывает ошибку сервера под полем", async () => {
    setup();
    toStep2();
    fillContacts();
    reply(422, '{"message":"x","errors":{"phone":["Такого кода нет"]}}');
    await send();
    expect(screen.getByText("Такого кода нет")).toBeTruthy();
    expect(document.activeElement).toBe(screen.getByLabelText("Телефон"));
  });

  it("двойной клик даёт один запрос", async () => {
    setup();
    toStep2();
    fillContacts();
    let finish: (r: Response) => void = () => {};
    fetchMock.mockReturnValueOnce(new Promise((r) => (finish = r)));
    const submit = screen.getByRole("button", { name: "Отправить заявку" });
    fireEvent.click(submit);
    fireEvent.click(submit);
    expect(screen.getByRole("button", { name: "Отправляем…" })).toHaveProperty("disabled", true);
    await act(async () => finish(new Response('{"ok":true,"duplicate":false}')));
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
