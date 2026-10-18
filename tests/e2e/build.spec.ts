import { expect, expectNoA11yViolations, expectNoHorizontalScroll, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/#k-build");
});

test("заказ собирается мышью", async ({ page }) => {
  const receipt = page.getByRole("complementary", { name: "Ваш заказ" });
  await expect(receipt).toContainText("Пока пусто");

  await page.getByRole("button", { name: "Добавить Колумбия Уила" }).click();
  await page.getByRole("button", { name: "Добавить Дрип-пакеты" }).click();
  await page.getByRole("button", { name: "Добавить Дрип-пакеты" }).click();

  await expect(receipt.getByRole("listitem")).toHaveText([
    /Колумбия\s*29 BYN/,
    /Дрипы × 2\s*36 BYN/,
  ]);
  await expect(receipt).toContainText("Итого65 BYN");
  await expect(receipt).toContainText("Доставка бесплатно");
  await expect(receipt).toContainText(/жарим в четверг, \d+ [а-я]+/);
  await expectNoHorizontalScroll(page);
  await expectNoA11yViolations(page);
});

test("заказ собирается с клавиатуры", async ({ page }) => {
  const receipt = page.getByRole("complementary", { name: "Ваш заказ" });
  await page.getByRole("button", { name: "Убрать Эфиопия Иргачеффе" }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Добавить Эфиопия Иргачеффе" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Space");

  await expect(receipt.getByRole("listitem")).toHaveText([/Эфиопия × 2\s*64 BYN/]);
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Убрать Эфиопия Иргачеффе" })).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(receipt.getByRole("listitem")).toHaveText([/Эфиопия\s*32 BYN/]);
  await expect(receipt).toContainText("До бесплатной доставки ещё 18 BYN");
});
