// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { OrderProvider, useOrder } from "@/context/OrderProvider";
import { SubActions, SubPicked } from "./SubCoupon";

beforeAll(() => {
  // в jsdom нет showModal
  HTMLDialogElement.prototype.showModal = function () {
    this.open = true;
  };
});

afterEach(cleanup);

function Probe() {
  const { interest, step } = useOrder();
  return <output aria-label="Интерес">{`${interest} ${step}`}</output>;
}

function setup() {
  render(
    <OrderProvider>
      <SubPicked />
      <SubActions />
      <Probe />
    </OrderProvider>,
  );
  fireEvent.click(screen.getByRole("button", { name: "Выбрать две пачки" }));
  const dialog = screen.getByRole("dialog", { name: "Соберите свою пару" });
  const put = (name: string) =>
    fireEvent.click(within(dialog).getByRole("button", { name: new RegExp(`^${name}`) }));
  return { dialog, put };
}

describe("подписка", () => {
  it("открывает модалку с пустыми слотами", () => {
    const { dialog } = setup();
    expect((dialog as HTMLDialogElement).open).toBe(true);
    expect(within(dialog).getByText("Осталось выбрать 2")).toBeTruthy();
    expect(within(dialog).getByRole("button", { name: "Готово" })).toHaveProperty("disabled", true);
    expect(screen.queryByRole("list", { name: "Выбранные пачки" })).toBeNull();
    expect(screen.queryByRole("link", { name: "Перейти к заявке" })).toBeNull();
  });

  it("собирает пару из двух одинаковых и показывает её в купоне", () => {
    const { dialog, put } = setup();
    put("Эфиопия Иргачеффе");
    expect(within(dialog).getByText("Осталось выбрать 1")).toBeTruthy();
    put("Эфиопия Иргачеффе");

    expect(within(dialog).getByText("Пара собрана: Эфиопия × 2")).toBeTruthy();
    expect(within(dialog).getByRole("button", { name: "Готово" })).toHaveProperty(
      "disabled",
      false,
    );
    const chips = screen.getByRole("list", { name: "Выбранные пачки" });
    expect(
      within(chips)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(["Эфиопия", "Эфиопия"]);
    expect(screen.getByRole("button", { name: "Изменить пачки" })).toBeTruthy();
  });

  it("отмечает сорта галочками, по одной на пачку", () => {
    const { dialog, put } = setup();
    const eth = within(dialog).getByRole("button", { name: /^Эфиопия Иргачеффе/ });
    expect(eth.dataset.count).toBe("0");
    put("Эфиопия Иргачеффе");
    expect(eth.dataset.count).toBe("1");
    put("Эфиопия Иргачеффе");
    expect(eth.dataset.count).toBe("2");
  });

  it("при полной паре остальные сорта недоступны, клик встряхивает подсказки", () => {
    const { dialog, put } = setup();
    const opt = (name: string) =>
      within(dialog).getByRole("button", { name: new RegExp(`^${name}`) });
    const shake = () => dialog.querySelector("[data-shake]")?.getAttribute("data-shake");
    put("Эфиопия Иргачеффе");
    put("Бразилия Серрадо");
    expect(opt("Колумбия Уила").getAttribute("aria-disabled")).toBe("true");
    expect(opt("Эфиопия Иргачеффе").getAttribute("aria-disabled")).toBe("false");
    expect(shake()).toBeUndefined();

    put("Колумбия Уила");
    expect(within(dialog).getByText("Пара собрана: Эфиопия + Бразилия")).toBeTruthy();
    const first = shake();
    expect(first).toBeTruthy();
    put("Эфиопия Иргачеффе");
    expect(within(dialog).getByText("Пара собрана: Эфиопия + Бразилия")).toBeTruthy();
    expect(shake()).not.toBe(first);

    fireEvent.click(within(dialog).getByRole("button", { name: /^Бразилия.*убрать$/ }));
    expect(within(dialog).getByText("Осталось выбрать 1")).toBeTruthy();
    expect(within(dialog).getByText("пока пустая")).toBeTruthy();
    expect(shake()).toBeUndefined();
    expect(opt("Колумбия Уила").getAttribute("aria-disabled")).toBe("false");
    expect(document.activeElement).toBe(opt("Эфиопия Иргачеффе"));
  });

  it("анимирует только изменённые слоты и забывает их при закрытии", () => {
    const { dialog, put } = setup();
    const anims = () =>
      Array.from(dialog.querySelectorAll("[data-anim]"), (el) => el.textContent?.slice(0, 8));
    put("Эфиопия Иргачеффе");
    expect(anims()).toEqual(["Эфиопия2"]);
    put("Бразилия Серрадо");
    expect(anims()).toEqual(["Бразилия"]);
    fireEvent.click(within(dialog).getByRole("button", { name: /^Эфиопия.*убрать$/ }));
    expect(anims()).toEqual(["Пачка 1п"]);

    fireEvent(dialog, new Event("close"));
    expect(anims()).toEqual([]);
  });

  it("убранная пачка оставляет слот пустым, соседняя не сдвигается", () => {
    const { dialog, put } = setup();
    put("Эфиопия Иргачеффе");
    put("Бразилия Серрадо");
    const row = within(dialog).getByRole("button", { name: /^Бразилия.*убрать$/ }).parentElement!;
    const slots = () => Array.from(row.children, (el) => el.textContent?.slice(0, 7));
    fireEvent.click(within(dialog).getByRole("button", { name: /^Эфиопия.*убрать$/ }));
    expect(slots()).toEqual(["Пачка 1", "Бразили"]);
    expect(screen.getByRole("list", { name: "Выбранные пачки" }).textContent).toBe("Бразилия");

    put("Колумбия Уила");
    expect(slots()).toEqual(["Колумби", "Бразили"]);
    expect(within(dialog).getByText("Пара собрана: Колумбия + Бразилия")).toBeTruthy();
  });

  it("ссылка ведёт в форму на подписку", () => {
    const { put } = setup();
    put("Колумбия Уила");
    put("Бразилия Серрадо");
    const link = screen.getByRole("link", { name: "Перейти к заявке" });
    expect(link.getAttribute("href")).toBe("#k-lead");
    fireEvent.click(link);
    expect(screen.getByRole("status", { name: "Интерес" }).textContent).toBe("subscription 1");
  });
});
