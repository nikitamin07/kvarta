import { expect, expectNoA11yViolations, expectNoHorizontalScroll, test } from "./fixtures";

test("главная открывается без ошибок и нарушений доступности", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("main")).toHaveCount(1);
  await expectNoHorizontalScroll(page);
  await expectNoA11yViolations(page);
});
