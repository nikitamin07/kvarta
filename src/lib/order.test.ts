import { describe, expect, it } from "vitest";
import { plural } from "./format";
import { clampQty, deliveryNote, dropSub, lineLabel, priceOrder, putSub, subsLabel } from "./order";

describe("priceOrder", () => {
  it("считает сумму по ценам каталога в порядке каталога", () => {
    const { lines, total } = priceOrder([
      { id: "drip", qty: 1 },
      { id: "eth", qty: 2 },
    ]);
    expect(lines.map((l) => [l.product.id, l.qty, l.sum])).toEqual([
      ["eth", 2, 64],
      ["drip", 1, 18],
    ]);
    expect(total).toBe(82);
  });

  it("складывает повторы одной позиции и пропускает нули", () => {
    const { lines, total } = priceOrder([
      { id: "col", qty: 1 },
      { id: "col", qty: 2 },
      { id: "bra", qty: 0 },
    ]);
    expect(lines).toHaveLength(1);
    expect(total).toBe(87);
  });

  it("пустой заказ стоит ноль", () => {
    expect(priceOrder([])).toEqual({ lines: [], total: 0 });
  });
});

describe("clampQty", () => {
  it("держит количество от 0 до 9", () => {
    expect([clampQty(-1), clampQty(3), clampQty(10)]).toEqual([0, 3, 9]);
  });
});

describe("deliveryNote", () => {
  it("подсказывает, сколько осталось до бесплатной доставки", () => {
    expect(deliveryNote(0)).toBe("Доставка бесплатно от 50 BYN");
    expect(deliveryNote(29)).toBe("До бесплатной доставки ещё 21 BYN");
    expect(deliveryNote(50)).toBe("Доставка бесплатно");
    expect(deliveryNote(64)).toBe("Доставка бесплатно");
  });
});

describe("lineLabel", () => {
  it("пишет количество только от двух пачек", () => {
    const { lines } = priceOrder([
      { id: "col", qty: 1 },
      { id: "eth", qty: 3 },
    ]);
    expect(lines.map(lineLabel)).toEqual(["Эфиопия × 3", "Колумбия"]);
  });
});

describe("plural", () => {
  it.each([
    [1, "день"],
    [2, "дня"],
    [5, "дней"],
    [11, "дней"],
    [12, "дней"],
    [21, "день"],
    [22, "дня"],
    [111, "дней"],
  ])("%i %s", (n, word) => {
    expect(plural(n, "день", "дня", "дней")).toBe(word);
  });
});

describe("пара подписки", () => {
  it("putSub добавляет пачку, третья вытесняет первую", () => {
    expect(putSub([], "eth")).toEqual(["eth"]);
    expect(putSub(["eth"], "eth")).toEqual(["eth", "eth"]);
    expect(putSub(["eth", "col"], "bra")).toEqual(["col", "bra"]);
  });

  it("dropSub убирает пачку по месту, а не по сорту", () => {
    expect(dropSub(["eth", "eth"], 1)).toEqual(["eth"]);
    expect(dropSub(["eth", "col"], 0)).toEqual(["col"]);
    expect(dropSub(["eth"], 1)).toEqual(["eth"]);
  });

  it("subsLabel склеивает разные сорта и считает одинаковые", () => {
    expect(subsLabel(["eth", "col"])).toBe("Эфиопия + Колумбия");
    expect(subsLabel(["bra", "bra"])).toBe("Бразилия × 2");
    expect(subsLabel(["bra"])).toBe("Бразилия × 2");
    expect(subsLabel([])).toBe("");
  });
});
