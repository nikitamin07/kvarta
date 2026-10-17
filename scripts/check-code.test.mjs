import { describe, expect, it } from "vitest";
import { checkFile } from "./check-code.mjs";

describe("checkFile", () => {
  it("пропускает чистый файл", () => {
    expect(checkFile("src/a.tsx", "const a = 1;\n")).toEqual([]);
  });

  it("ловит строку длиннее 120 символов", () => {
    const [problem] = checkFile("src/a.ts", "x".repeat(121));
    expect(problem).toContain("src/a.ts:1");
  });

  it("ловит цвет без токена в src", () => {
    expect(checkFile("src/a.module.css", ".a { color: #e0b47a; }")).toHaveLength(1);
    expect(checkFile("src/a.tsx", 'fill="rgb(0 0 0)"')).toHaveLength(1);
  });

  it("не путает якоря с цветами", () => {
    expect(checkFile("src/a.tsx", '<a href="#k-build">')).toEqual([]);
  });

  it("разрешает цвета в файле токенов и с пометкой", () => {
    expect(checkFile("src/app/globals.css", ":root { --bg: #131c18; }")).toEqual([]);
    expect(checkFile("src/a.tsx", "// цвет вне токенов для og\nconst c = '#131c18';")).toEqual([]);
  });

  it("ограничивает css 400 строками", () => {
    expect(checkFile("src/a.css", "a{}\n".repeat(401))).toHaveLength(1);
  });
});
