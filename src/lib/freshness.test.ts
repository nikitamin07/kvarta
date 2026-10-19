import { describe, expect, it } from "vitest";
import { cloudOf, stageOf, verdictOf } from "./freshness";

describe("stageOf и verdictOf", () => {
  it.each([
    [1, "аромат ещё раскрывается", "rest"],
    [3, "аромат ещё раскрывается", "rest"],
    [4, "всё на месте", "peak"],
    [30, "всё на месте", "peak"],
    [31, "ноты улетучиваются", "fading"],
    [60, "ноты улетучиваются", "fading"],
    [61, "остались только полка и картон", "shelf"],
    [120, "остались только полка и картон", "shelf"],
  ])("%i день", (age, stage, tone) => {
    expect(stageOf(age)).toBe(stage);
    expect(verdictOf(age).tone).toBe(tone);
  });

  it("тексты вердиктов из прототипа", () => {
    expect(verdictOf(45).title).toBe("Уже выдыхается");
    expect(verdictOf(10).text).toMatch(/^Аромат и сладость на максимуме/);
  });
});

describe("cloudOf", () => {
  const good = (age: number) => cloudOf(age).words.filter((w) => !w.bad);
  const bad = (age: number) => cloudOf(age).words.filter((w) => w.bad);

  it("свежий кофе: хорошие ноты видны, плохих нет", () => {
    expect(good(1).every((w) => w.opacity === 1)).toBe(true);
    expect(bad(1).every((w) => w.opacity === 0)).toBe(true);
  });

  it("старый кофе: хорошие почти погасли, плохие видны", () => {
    expect(good(120)[0].opacity).toBeCloseTo(0.08);
    expect(bad(120).every((w) => w.opacity === 1)).toBe(true);
    expect(cloudOf(120).gloss).toBe(0.1);
  });

  it("хорошие ноты сначала отходят от центра, потом стягиваются", () => {
    const [bergamot] = good(1);
    expect([bergamot.x, bergamot.y]).toEqual([18, 16]);
    expect(bergamot.dx).toBeCloseTo((50 - 18) * 0.22);
    expect(good(120)[0].dx).toBeCloseTo((50 - 18) * -0.18);
  });

  it("плохие ноты стоят на месте", () => {
    expect(bad(90).every((w) => w.dx === 0 && w.dy === 0)).toBe(true);
  });
});
