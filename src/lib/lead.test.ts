import { describe, expect, it } from "vitest";
import { looksLikeBot, MIN_FILL_MS, validateLead } from "./lead";

const base = {
  name: "Аня",
  phone: "8 029 123-45-67",
  interest: "order",
  items: [{ id: "eth", qty: 1 }],
};

describe("validateLead", () => {
  it("принимает заказ и нормализует номер", () => {
    const r = validateLead({ ...base, comment: "  помол под турку  " });
    expect(r).toMatchObject({
      ok: true,
      data: {
        phone: "+375291234567",
        interest: "order",
        comment: "помол под турку",
        question: null,
      },
    });
  });

  it("склеивает повторы позиции", () => {
    const r = validateLead({
      ...base,
      items: [
        { id: "col", qty: 2 },
        { id: "col", qty: 1 },
      ],
    });
    expect(r.ok && r.data.items).toEqual([{ id: "col", qty: 3 }]);
  });

  it("собирает все ошибки сразу, по полям", () => {
    const r = validateLead({ name: " ", phone: "+375 30 123-45-67", interest: "order", items: [] });
    expect(r.ok).toBe(false);
    expect(!r.ok && Object.keys(r.errors).sort()).toEqual(["items", "name", "phone"]);
    expect(!r.ok && r.errors.phone?.[0]).toContain("Такого кода нет");
  });

  it.each([
    ["неизвестный сорт", [{ id: "kenya", qty: 1 }]],
    ["ноль штук", [{ id: "eth", qty: 0 }]],
    ["дробное количество", [{ id: "eth", qty: 1.5 }]],
    [
      "больше девяти",
      [
        { id: "eth", qty: 6 },
        { id: "eth", qty: 4 },
      ],
    ],
    ["не массив", "eth"],
  ])("отклоняет заказ: %s", (_, items) => {
    const r = validateLead({ ...base, items });
    expect(!r.ok && r.errors.items).toHaveLength(1);
  });

  it("подписка: один или два сорта, без дрип-пакетов", () => {
    const sub = { ...base, interest: "subscription", items: undefined };
    expect(validateLead({ ...sub, subs: ["eth"] }).ok).toBe(true);
    expect(validateLead({ ...sub, subs: ["eth", "eth"] }).ok).toBe(true);
    expect(validateLead({ ...sub, subs: [] }).ok).toBe(false);
    expect(validateLead({ ...sub, subs: ["eth", "col", "bra"] }).ok).toBe(false);
    expect(validateLead({ ...sub, subs: ["drip"] }).ok).toBe(false);
  });

  it("вопрос обязателен для интереса вопрос и пропадает у заказа", () => {
    const q = { ...base, interest: "question" };
    expect(!validateLead(q).ok && validateLead(q)).toMatchObject({
      errors: { question: [expect.any(String)] },
    });
    expect(validateLead({ ...q, question: "какой помол?" })).toMatchObject({
      ok: true,
      data: { items: [] },
    });
    expect(validateLead({ ...base, question: "лишнее" })).toMatchObject({
      data: { question: null },
    });
  });

  it("неизвестный интерес и длинные поля", () => {
    expect(validateLead({ ...base, interest: "admin" })).toMatchObject({
      errors: { interest: [expect.any(String)] },
    });
    const long = "я".repeat(1001);
    expect(validateLead({ ...base, name: "я".repeat(61), comment: long })).toMatchObject({
      errors: { name: [expect.any(String)], comment: [expect.any(String)] },
    });
  });

  it("чистит источник: только известные ключи, строки, обрезка по длине", () => {
    const r = validateLead({
      ...base,
      source: { utm_source: " yandex ", utm_medium: 5, evil: "x", referrer: "r".repeat(600) },
    });
    expect(r.ok && r.data.source).toMatchObject({
      utm_source: "yandex",
      utm_medium: null,
      utm_term: null,
    });
    expect(r.ok && r.data.source.referrer).toHaveLength(500);
    expect(r.ok && "evil" in r.data.source).toBe(false);
  });

  it("не падает на мусоре вместо тела", () => {
    for (const body of [null, 42, "строка", []]) expect(validateLead(body).ok).toBe(false);
  });
});

describe("looksLikeBot", () => {
  const now = 1_000_000;
  it("человек: ловушка пустая, форма заполнялась дольше 3 секунд", () => {
    expect(looksLikeBot({ website: "", startedAt: now - MIN_FILL_MS }, now)).toBe(false);
  });

  it.each([
    ["ловушка заполнена", { website: "http://spam", startedAt: 0 }],
    ["нет поля ловушки", { startedAt: 0 }],
    ["слишком быстро", { website: "", startedAt: now - 500 }],
    ["нет времени", { website: "" }],
    ["время строкой", { website: "", startedAt: "0" }],
  ])("бот: %s", (_, body) => {
    expect(looksLikeBot(body, now)).toBe(true);
  });
});
