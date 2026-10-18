import { describe, expect, it } from "vitest";
import { buildCsp } from "./csp";

const directive = (csp: string, name: string) =>
  csp.split("; ").find((d) => d.startsWith(`${name} `)) ?? "";

describe("buildCsp", () => {
  it("на проде скрипты только с nonce, без unsafe", () => {
    const script = directive(buildCsp("abc", false), "script-src");
    expect(script).toContain("'nonce-abc'");
    expect(script).toContain("'strict-dynamic'");
    expect(script).not.toContain("unsafe");
  });

  it("на проде теги style только с nonce", () => {
    expect(directive(buildCsp("abc", false), "style-src")).toBe("style-src 'self' 'nonce-abc'");
  });

  it("запрещает встраивание во фреймы и плагины", () => {
    const csp = buildCsp("abc", false);
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("object-src 'none'");
  });

  it("в разработке разрешает eval для отладки react", () => {
    expect(directive(buildCsp("abc", true), "script-src")).toContain("'unsafe-eval'");
  });
});
