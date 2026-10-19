import { expect, expectNoA11yViolations, expectNoHorizontalScroll, test } from "./fixtures";

test("политика конфиденциальности открывается из подвала", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("contentinfo")
    .getByRole("link", { name: "Политика конфиденциальности" })
    .click();
  await expect(page).toHaveURL(/\/privacy$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Политика конфиденциальности");
  await expect(
    page.getByRole("heading", { level: 2, name: "8. Данные на устройстве пользователя" }),
  ).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute("href", /\/privacy$/);
  await expectNoHorizontalScroll(page);
  await expectNoA11yViolations(page);
});

test("из формы ссылка на политику открывается в новой вкладке", async ({ page }) => {
  await page.goto("/#k-lead");
  await page.waitForFunction(() => localStorage.getItem("kvarta-source"));
  const form = page.locator("#k-lead form");
  await form.getByRole("button", { name: "Вопрос" }).click();
  await form.getByLabel("Ваш вопрос").fill("Какой помол для турки?");
  await form.getByRole("button", { name: "Дальше" }).click();
  const link = form.getByRole("link", { name: "политике конфиденциальности" });
  await expect(link).toHaveAttribute("href", "/privacy");
  await expect(link).toHaveAttribute("target", "_blank");
});

test("несуществующий адрес отдаёт 404 с туркой и чашкой", async ({ page, consoleProblems }) => {
  const res = await page.goto("/takoy-stranicy-net");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Такой страницы нет");
  await expect(page.getByRole("img", { name: "Кофе наливают из турки в чашку" })).toBeVisible();
  await expectNoHorizontalScroll(page);
  await expectNoA11yViolations(page);
  // ответ 404 на сам документ ожидаем
  const own = consoleProblems.findIndex((p) => p.includes("status of 404"));
  if (own >= 0) consoleProblems.splice(own, 1);
  await page.getByRole("link", { name: "На главную" }).click();
  await expect(page).toHaveURL(/\/$/);
});

test("ссылки шапки работают и с других страниц", async ({ page }) => {
  await page.goto("/privacy");
  await page.getByRole("banner").getByRole("link", { name: "Оставить заявку" }).click();
  await expect(page).toHaveURL(/\/#k-lead$/);
  await expect(page.locator("#k-lead h2")).toBeInViewport();
});
