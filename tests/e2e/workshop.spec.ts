import { expect, expectNoA11yViolations, expectNoHorizontalScroll, test } from "./fixtures";

test("мастерская показывает адрес, часы, статус и ссылки", async ({ page }) => {
  await page.goto("/#k-map");
  const map = page.locator("#k-map");
  await expect(map.getByRole("heading", { level: 2 })).toHaveText("Мастерская на Короля");
  await expect(map).toContainText("Минск, ул. Короля, 9");
  await expect(map.locator("[aria-current]")).toHaveCount(1);
  await expect(map).toContainText(/Сейчас (открыто|закрыто)/);
  await expect(map).toContainText(/(Закроемся|Откроемся) .+:00/);

  const address = encodeURIComponent("Минск, ул. Короля, 9");
  await expect(map.getByRole("link", { name: "Открыть в Яндекс Картах" })).toHaveAttribute(
    "href",
    `https://yandex.by/maps/?text=${address}`,
  );
  await expect(map.getByRole("link", { name: "Построить маршрут" })).toHaveAttribute(
    "href",
    `https://yandex.by/maps/?rtext=~${address}`,
  );
  await expect(map.getByRole("link", { name: "Позвонить" })).toHaveAttribute(
    "href",
    /^tel:\+375\d{9}$/,
  );
  await expectNoHorizontalScroll(page);
  await expectNoA11yViolations(page);
});

test("статус пересчитывается в браузере без перезагрузки", async ({ page }) => {
  // понедельник 19:59:30 по Минску
  await page.clock.install({ time: new Date("2026-10-19T16:59:30Z") });
  await page.goto("/#k-map");
  await page.waitForFunction(() => localStorage.getItem("kvarta-source"));
  await page.clock.runFor(31_000);
  const live = page.locator("#k-map");
  await expect(live).toContainText("Сейчас закрыто");
  await expect(live).toContainText("Откроемся завтра в 8:00");
});

test("ссылка шапки ведёт к мастерской", async ({ page }) => {
  await page.goto("/");
  const link = page.getByRole("banner").getByRole("link", { name: "Мы на карте" });
  test.skip(!(await link.isVisible()), "меню шапки на этой ширине скрыто");
  await link.click();
  await expect(page).toHaveURL(/#k-map$/);
  await expect(page.locator("#k-map h2")).toBeInViewport();
});
