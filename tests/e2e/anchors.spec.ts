import type { Page } from "@playwright/test";
import { expect, test } from "./fixtures";

const TARGETS = ["k-build", "k-sub", "k-map", "k-lead"];

// секция встаёт под шапку
async function expectAligned(page: Page, id: string) {
  const offset = () =>
    page.evaluate((id) => {
      const pad = getComputedStyle(document.documentElement).scrollPaddingTop;
      return document.getElementById(id)!.getBoundingClientRect().top - parseFloat(pad);
    }, id);
  await expect
    .poll(async () => Math.abs(await offset()), { message: `#${id} под шапкой`, timeout: 5_000 })
    .toBeLessThanOrEqual(1);
  await page.waitForTimeout(400);
  expect(Math.abs(await offset())).toBeLessThanOrEqual(2);
}

for (const id of TARGETS) {
  test(`прямой заход на #${id} ставит секцию под шапку`, async ({ page }) => {
    await page.goto(`/#${id}`);
    await page.waitForFunction(() => localStorage.getItem("kvarta-source"));
    await expectAligned(page, id);
  });

  test(`ссылка на #${id} прокручивает точно к секции`, async ({ page }) => {
    await page.goto("/");
    await page.waitForFunction(() => localStorage.getItem("kvarta-source"));
    await page.evaluate(() => document.fonts.ready);
    const link = page.locator(`a[href$="#${id}"]:visible`).first();
    test.skip(!(await link.count()), `на этой ширине нет видимой ссылки на #${id}`);
    await link.click();
    await expectAligned(page, id);
  });
}
