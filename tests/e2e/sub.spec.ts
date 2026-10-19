import { expect, expectNoA11yViolations, expectNoHorizontalScroll, test } from "./fixtures";

test.beforeEach(async ({ page }) => {
  await page.goto("/#k-sub");
  await page.waitForFunction(() => localStorage.getItem("kvarta-source"));
});

test("пара собирается мышью и уходит в форму", async ({ page }) => {
  const sub = page.locator("#k-sub");
  const dialog = page.getByRole("dialog", { name: "Соберите свою пару" });
  await sub.getByRole("button", { name: "Выбрать две пачки" }).click();
  await expect(dialog).toBeVisible();
  await expect(dialog.getByRole("button", { name: "Готово" })).toBeDisabled();

  const eth = dialog.getByRole("button", { name: /^Эфиопия Иргачеффе/ });
  await eth.click();
  await eth.click();
  await expect(dialog).toContainText("Пара собрана: Эфиопия × 2");
  await expectNoHorizontalScroll(page);
  await expectNoA11yViolations(page);

  await dialog.getByRole("button", { name: "Готово" }).click();
  await expect(dialog).toBeHidden();
  await expect(sub.getByRole("listitem")).toHaveText(["Эфиопия", "Эфиопия"]);
  await expect(sub.getByRole("button", { name: "Изменить пачки" })).toBeVisible();

  await sub.getByRole("link", { name: "Перейти к заявке" }).click();
  const form = page.locator("#k-lead form");
  await expect(form.getByRole("button", { name: "Подписка" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  await expect(form.getByRole("checkbox", { name: /Эфиопия Иргачеффе/ })).toBeChecked();
  await form.getByRole("button", { name: "Дальше" }).click();
  await expect(form.getByText("Подписка: Эфиопия × 2")).toBeVisible();
});

test("модалка работает с клавиатуры", async ({ page }) => {
  const open = page.locator("#k-sub").getByRole("button", { name: "Выбрать две пачки" });
  const dialog = page.getByRole("dialog", { name: "Соберите свою пару" });
  await open.focus();
  await page.keyboard.press("Enter");
  await expect(dialog.getByRole("button", { name: "Закрыть" })).toBeFocused();

  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(open).toBeFocused();

  await page.keyboard.press("Enter");
  await dialog.getByRole("button", { name: /^Колумбия Уила/ }).focus();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(dialog).toContainText("Пара собрана: Колумбия + Бразилия");
  await dialog.getByRole("button", { name: "Готово" }).focus();
  await page.keyboard.press("Enter");
  await expect(dialog).toBeHidden();
  await expect(
    page.locator("#k-sub").getByRole("button", { name: "Изменить пачки" }),
  ).toBeFocused();
});

test("слот убирает пачку, клик мимо закрывает", async ({ page }) => {
  const dialog = page.getByRole("dialog", { name: "Соберите свою пару" });
  await page.locator("#k-sub").getByRole("button", { name: "Выбрать две пачки" }).click();
  await dialog.getByRole("button", { name: /^Бразилия Серрадо/ }).click();
  await dialog.getByRole("button", { name: /^Бразилия.*убрать$/ }).click();
  await expect(dialog).toContainText("Осталось выбрать 2");

  await page.mouse.click(5, 5);
  await expect(dialog).toBeHidden();
});

test("ссылка из первого экрана ведёт к подписке", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: "Подписка за 54 BYN" }).click();
  await expect(page).toHaveURL(/#k-sub$/);
  await expect(page.locator("#k-sub h2")).toBeInViewport();
});
