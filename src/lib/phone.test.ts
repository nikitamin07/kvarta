import { describe, expect, it } from "vitest";
import { checkPhone, formatPhone } from "./phone";

describe("checkPhone", () => {
  it.each([
    "+375 29 123-45-67",
    "+375(29)1234567",
    "375291234567",
    "80291234567",
    "8 029 123 45 67",
    "29 123 45 67",
    " +375.29.123.45.67 ",
  ])("приводит %s к +375291234567", (input) => {
    expect(checkPhone(input)).toEqual({ ok: true, phone: "+375291234567" });
  });

  it.each(["25", "29", "33", "44", "17"])("принимает код %s", (code) => {
    expect(checkPhone(`+375${code}1234567`).ok).toBe(true);
  });

  it("пустой ввод", () => {
    expect(checkPhone("   ")).toEqual({ ok: false, error: "empty" });
  });

  it.each([
    "+375 29 123-45-6",
    "+375 29 123-45-678",
    "+7 912 345-67-89",
    "+48 291234567",
    "abc",
    "+375 29 123 45 67 доб 2",
    "1".repeat(40),
  ])("отклоняет %s как неверный формат", (input) => {
    expect(checkPhone(input)).toEqual({ ok: false, error: "format" });
  });

  it.each(["+375 30 123-45-67", "+375 16 212-34-56", "+375 99 123-45-67"])(
    "отклоняет %s из-за кода оператора",
    (input) => {
      expect(checkPhone(input)).toEqual({ ok: false, error: "operator" });
    },
  );
});

describe("formatPhone", () => {
  it("форматирует нормализованный номер", () => {
    expect(formatPhone("+375291234567")).toBe("+375 29 123-45-67");
  });
});
