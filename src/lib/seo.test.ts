import { describe, expect, it } from "vitest";
import { CATALOG, SUBSCRIPTION } from "./catalog";
import { shopJsonLd, toJsonLd } from "./seo";
import { robotsRules, SITE_DESCRIPTION, SITE_TITLE } from "./site";

type Node = Record<string, unknown> & { "@type": string };
const graph = shopJsonLd(["/a.jpg"])["@graph"] as Node[];
const byType = (t: string) => graph.filter((n) => n["@type"] === t);

describe("shopJsonLd", () => {
  it("описывает кофейню с адресом и часами из расписания", () => {
    const [shop] = byType("CafeOrCoffeeShop");
    expect(shop.openingHoursSpecification).toEqual([
      expect.objectContaining({
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        opens: "08:00",
        closes: "20:00",
      }),
      expect.objectContaining({
        dayOfWeek: ["Saturday", "Sunday"],
        opens: "10:00",
        closes: "18:00",
      }),
    ]);
    expect(shop.priceRange).toBe("18–54 BYN");
    expect(shop.image).toEqual([expect.stringMatching(/^https?:\/\/.+\/a\.jpg$/)]);
  });

  it("цены товаров берёт из каталога", () => {
    const prices = byType("Product").map((p) => (p.offers as { price: number }).price);
    expect(prices).toEqual([...CATALOG.map((p) => p.price), SUBSCRIPTION.price]);
  });

  it("все ссылки абсолютные", () => {
    const urls = JSON.stringify(graph).match(/"(url|@id|item)":"[^"]+"/g) ?? [];
    expect(urls.length).toBeGreaterThan(5);
    for (const u of urls) expect(u).toMatch(/":"https?:\/\//);
  });

  it("экранирует закрывающий тег", () => {
    expect(toJsonLd({ a: "</script>" })).toBe('{"a":"\u003c/script>"}');
  });
});

describe("метаданные и robots", () => {
  it("title до 60 знаков, description 120–160", () => {
    expect(SITE_TITLE.length).toBeLessThanOrEqual(60);
    expect(SITE_DESCRIPTION.length).toBeGreaterThanOrEqual(120);
    expect(SITE_DESCRIPTION.length).toBeLessThanOrEqual(160);
  });

  it("закрытый сайт запрещает всё, открытый даёт sitemap", () => {
    expect(robotsRules(false)).toEqual({ rules: { userAgent: "*", disallow: "/" } });
    const open = robotsRules(true);
    expect(open.rules).toEqual({ userAgent: "*", allow: "/", disallow: "/api/" });
    expect(open.sitemap).toMatch(/^https?:\/\/.+\/sitemap\.xml$/);
  });
});
