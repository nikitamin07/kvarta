import { describe, expect, it } from "vitest";
import { pickSource, sourceOfVisit } from "./attribution";

const SITE = "https://kvarta.by";

describe("sourceOfVisit", () => {
  it("берёт метки, click id и внешний referrer", () => {
    const s = sourceOfVisit(
      `${SITE}/?utm_source=instagram&utm_medium=cpc&utm_campaign=autumn&yclid=42#k-build`,
      "https://l.instagram.com/",
    );
    expect(s).toEqual({
      utm_source: "instagram",
      utm_medium: "cpc",
      utm_campaign: "autumn",
      utm_content: null,
      utm_term: null,
      click_id: "42",
      landing_page: "/?utm_source=instagram&utm_medium=cpc&utm_campaign=autumn&yclid=42",
      referrer: "https://l.instagram.com/",
    });
  });

  it("берёт gclid, если нет yclid", () => {
    expect(sourceOfVisit(`${SITE}/?gclid=g1`, "").click_id).toBe("g1");
  });

  it("не считает свой сайт и мусор источником", () => {
    expect(sourceOfVisit(`${SITE}/`, `${SITE}/privacy`).referrer).toBeNull();
    expect(sourceOfVisit(`${SITE}/`, "not a url").referrer).toBeNull();
  });
});

describe("pickSource", () => {
  const ad = sourceOfVisit(`${SITE}/?utm_source=yandex`, "https://yandex.by/");
  const direct = sourceOfVisit(`${SITE}/`, "");

  it("повторный заход без меток не затирает рекламу", () => {
    expect(pickSource(ad, direct)).toBe(ad);
  });

  it("первый заход запоминается как есть", () => {
    expect(pickSource(null, direct)).toBe(direct);
  });

  it("новая реклама заменяет старый источник", () => {
    const insta = sourceOfVisit(`${SITE}/?utm_source=instagram`, "");
    expect(pickSource(ad, insta)).toBe(insta);
  });
});
