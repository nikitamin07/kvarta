import { formatDay, minskNow, roastWeek } from "@/lib/schedule";
import { expect, expectNoA11yViolations, test } from "./fixtures";

test("штамп показывает ближайшую обжарку по времени Минска", async ({ page }) => {
  await page.goto("/");
  const roast = formatDay(roastWeek(minskNow(new Date())).roast);
  const stamp = page.getByRole("img", { name: `Ближайшая обжарка ${roast}` });
  await expect(stamp).toBeVisible();
  await expect(stamp).toContainText(roast.split(" ")[0]);
});

test("фото hero и письма загружаются", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("heading", { name: "Почему мы жарим сами" }).scrollIntoViewIfNeeded();
  for (const alt of [
    "Свежеобжаренное зерно в ладони",
    "Пуровер на стойке в мастерской",
    "Холдеры, молотый кофе и зерно на деревянной доске",
  ]) {
    const img = page.getByRole("img", { name: alt });
    await expect(img).toBeVisible();
    await expect
      .poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth))
      .toBeGreaterThan(0);
  }
  await expectNoA11yViolations(page);
});

test("кнопки hero ведут к сборке заказа", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Собрать заказ" }).click();
  await expect(page.getByRole("heading", { name: "Соберите заказ" })).toBeInViewport();
});

test.describe("анимация при прокрутке", () => {
  test.skip(({ isMobile }) => isMobile, "на мобильном фото не разлетаются");

  const shift = (page: import("@playwright/test").Page) =>
    page
      .getByRole("img", { name: "Свежеобжаренное зерно в ладони" })
      .evaluate((el) => getComputedStyle(el.closest("figure")!).translate);

  test("фото разлетаются при прокрутке", async ({ page }) => {
    await page.goto("/");
    const before = await shift(page);
    await page.mouse.wheel(0, 400);
    await page.waitForFunction(() => scrollY > 300);
    await expect.poll(() => shift(page)).not.toBe(before);
  });

  test("при reduced motion фото стоят на месте", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/");
    await page.mouse.wheel(0, 400);
    await page.waitForFunction(() => scrollY > 300);
    expect(await shift(page)).toBe("none");
  });
});

test("якорные ссылки прокручивают плавно", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Собрать заказ" }).click();
  await page.waitForTimeout(80);
  const mid = await page.evaluate(() => scrollY);
  const target = await page
    .locator("#k-build")
    .evaluate(
      (el) =>
        el.getBoundingClientRect().top +
        scrollY -
        parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop),
    );
  expect(mid).toBeGreaterThan(0);
  expect(mid).toBeLessThan(target - 5);
  await expect(page.getByRole("heading", { name: "Соберите заказ" })).toBeInViewport();
});
