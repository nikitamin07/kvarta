// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { OrderProvider } from "@/context/OrderProvider";
import { BuildOrder } from "./BuildOrder";

afterEach(cleanup);

function setup() {
  render(
    <OrderProvider>
      <BuildOrder roastDay="22 октября" />
    </OrderProvider>,
  );
  const receipt = screen.getByRole("complementary", { name: "Ваш заказ" });
  const click = (label: string, times = 1) => {
    const button = screen.getByRole("button", { name: label });
    for (let i = 0; i < times; i++) fireEvent.click(button);
  };
  return { receipt, click };
}

describe("BuildOrder", () => {
  it("начинает с пустого чека", () => {
    const { receipt } = setup();
    expect(within(receipt).getByText(/Пока пусто/)).toBeTruthy();
    expect(within(receipt).getByText("здесь появится ваш заказ")).toBeTruthy();
    expect(within(receipt).getByText("0 BYN")).toBeTruthy();
    expect(within(receipt).getByText("Доставка бесплатно от 50 BYN")).toBeTruthy();
    expect(within(receipt).queryByRole("list")).toBeNull();
  });

  it("собирает позиции в чек по ценам каталога", () => {
    const { receipt, click } = setup();
    click("Добавить Колумбия Уила");
    expect(within(receipt).getByText("До бесплатной доставки ещё 21 BYN")).toBeTruthy();

    click("Добавить Эфиопия Иргачеффе", 2);
    const lines = within(receipt)
      .getAllByRole("listitem")
      .map((li) => li.textContent);
    expect(lines).toEqual(["Эфиопия × 264 BYN", "Колумбия29 BYN"]);
    expect(within(receipt).getByText("93 BYN")).toBeTruthy();
    expect(within(receipt).getByText("Доставка бесплатно")).toBeTruthy();
    expect(within(receipt).getByText("жарим в четверг, 22 октября")).toBeTruthy();
  });

  it("убирает позицию из чека на нуле", () => {
    const { receipt, click } = setup();
    click("Добавить Дрип-пакеты");
    click("Убрать Дрип-пакеты");
    expect(within(receipt).queryByRole("list")).toBeNull();
    expect(within(receipt).getByText(/Пока пусто/)).toBeTruthy();
  });

  it("держит количество от 0 до 9", () => {
    const { click } = setup();
    const card = screen.getByRole("heading", { name: "Бразилия Серрадо" }).closest("div")!;
    const count = () => within(card.parentElement!).getByRole("status").textContent;

    click("Убрать Бразилия Серрадо");
    expect(count()).toBe("0");
    click("Добавить Бразилия Серрадо", 12);
    expect(count()).toBe("9");
  });

  it("заполняет зёрна по десять рублей", () => {
    const { receipt, click } = setup();
    click("Добавить Колумбия Уила");
    const beans = receipt.querySelectorAll("[aria-hidden='true'] > span");
    const full = [...beans].filter((b) => b.className.includes("full"));
    expect([beans.length, full.length]).toEqual([5, 2]);
  });
});
