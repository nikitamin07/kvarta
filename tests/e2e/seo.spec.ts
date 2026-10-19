import { SITE_DESCRIPTION, SITE_TITLE } from "../../src/lib/site";
import { expect, test } from "./fixtures";

const meta = (name: string) => `meta[name="${name}"], meta[property="${name}"]`;

test("главная отдаёт мета, canonical и open graph", async ({ page }) => {
  await page.goto("/");
  const head = page.locator("head");
  const content = (name: string) => head.locator(meta(name)).first().getAttribute("content");

  await expect(page).toHaveTitle(SITE_TITLE);
  await expect(page.locator("html")).toHaveAttribute("lang", "ru");
  expect(await content("description")).toBe(SITE_DESCRIPTION);
  expect(await content("robots")).toBe("noindex, nofollow");

  const canonical = await head.locator('link[rel="canonical"]').getAttribute("href");
  expect(canonical).toMatch(/^https?:\/\/[^/]+\/?$/);
  expect(await content("og:url")).toBe(canonical);
  expect(await content("og:title")).toBe(SITE_TITLE);
  expect(await content("og:description")).toBe(SITE_DESCRIPTION);
  expect(await content("og:type")).toBe("website");
  expect(await content("og:locale")).toBe("ru_RU");
  expect(await content("og:site_name")).toBe("Кварта");
  expect(await content("og:image:width")).toBe("1200");
  expect(await content("og:image:height")).toBe("630");
  expect(await content("og:image:alt")).toMatch(/^Кварта/);
  expect(await content("twitter:card")).toBe("summary_large_image");

  const image = new URL((await content("og:image"))!);
  expect(image.protocol).toMatch(/^https?:$/);
  const res = await page.request.get(image.pathname + image.search);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toBe("image/jpeg");

  await expect(page.locator("h1")).toHaveCount(1);
});

test("разметка JSON-LD описывает кофейню и товары", async ({ page }) => {
  await page.goto("/");
  const raw = await page.locator('script[type="application/ld+json"]').textContent();
  const types = (JSON.parse(raw!)["@graph"] as { "@type": string }[]).map((n) => n["@type"]);
  expect(types.filter((t) => t === "CafeOrCoffeeShop")).toHaveLength(1);
  expect(types.filter((t) => t === "Product")).toHaveLength(5);
});

test("пока индексация закрыта, robots и заголовки её запрещают", async ({ request }) => {
  const home = await request.get("/");
  expect(home.headers()["x-robots-tag"]).toBe("noindex, nofollow");

  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toMatch(/User-Agent: \*\s+Disallow: \/\s*$/);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  const xml = await sitemap.text();
  expect(xml).toMatch(/<loc>https?:\/\/[^<]+\/<\/loc>\s*<lastmod>\d{4}-\d{2}-\d{2}/);
  expect(xml).toMatch(/<loc>https?:\/\/[^<]+\/privacy<\/loc>/);
});
