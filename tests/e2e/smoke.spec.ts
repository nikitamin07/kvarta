import { expect, expectNoA11yViolations, expectNoHorizontalScroll, test } from "./fixtures";

test("главная открывается без ошибок и нарушений доступности", async ({ page }) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  await expect(page.locator("main")).toHaveCount(1);
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expectNoHorizontalScroll(page);
  await expectNoA11yViolations(page);
});

test("ссылка к содержимому видна с клавиатуры и ведёт в main", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  const skip = page.getByRole("link", { name: "К содержимому" });
  await expect(skip).toBeFocused();
  await expect(skip).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.locator("main")).toBeFocused();
});

test("навигация шапки видна только на десктопе", async ({ page, isMobile }) => {
  await page.goto("/");
  const nav = page.getByRole("navigation", { name: "Разделы" });
  if (isMobile) await expect(nav).toBeHidden();
  else await expect(nav).toBeVisible();
  await expect(
    page.getByRole("banner").getByRole("link", { name: "Оставить заявку" }),
  ).toBeVisible();
});
