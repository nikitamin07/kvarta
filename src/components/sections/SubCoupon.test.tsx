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

  it("третий сорт вытесняет первый, слот убирает свою пачку", () => {
    const { dialog, put } = setup();
    put("Эфиопия Иргачеффе");
    put("Бразилия Серрадо");
    put("Колумбия Уила");
    expect(within(dialog).getByText("Пара собрана: Бразилия + Колумбия")).toBeTruthy();

    fireEvent.click(within(dialog).getByRole("button", { name: /^Колумбия.*убрать$/ }));
    expect(within(dialog).getByText("Осталось выбрать 1")).toBeTruthy();
    expect(within(dialog).getByText("пока пустая")).toBeTruthy();
    expect(document.activeElement?.textContent).toMatch(/^Эфиопия Иргачеффе/);
  });

  it("анимирует только изменённые слоты и забывает их при закрытии", () => {
    const { dialog, put } = setup();
    const anims = () =>
      Array.from(dialog.querySelectorAll("[data-anim]"), (el) => el.textContent?.slice(0, 8));
    put("Эфиопия Иргачеффе");
    expect(anims()).toEqual(["Эфиопия2"]);
    put("Бразилия Серрадо");
    expect(anims()).toEqual(["Бразилия"]);
    put("Колумбия Уила");
    expect(anims()).toEqual(["Бразилия", "Колумбия"]);

    fireEvent(dialog, new Event("close"));
    expect(anims()).toEqual([]);
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
