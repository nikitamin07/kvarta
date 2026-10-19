import { addDays, formatDay, minskNow, roastWeek } from "@/lib/schedule";
import { expect, expectNoA11yViolations, test } from "./fixtures";

test("ползунок свежести работает с клавиатуры", async ({ page }) => {
  await page.goto("/");
  await page.waitForFunction(() => localStorage.getItem("kvarta-source"));
  const today = minskNow(new Date()).iso;
  const slider = page.getByRole("slider", { name: "Сколько дней назад обжарен кофе" });
  const verdict = page
    .getByRole("heading", { level: 3 })
    .filter({ hasText: /вкус|обжарки|полке|выдыхается/ });

  const region = page.getByRole("region", { name: "Свежесть решает вкус" });
  await expect(region.getByRole("heading", { level: 2 })).toHaveText("Свежесть решает вкус");
  await expect(region.getByText("Сколько дней назад обжарили ваш кофе?")).toBeVisible();
  await expect(slider).toHaveValue("45");
  await expect(verdict).toHaveText("Уже выдыхается");
  await expect(page.getByText(`обжарен ${formatDay(addDays(today, -45))}`)).toBeVisible();

  await slider.focus();
  await page.keyboard.press("Home");
  await expect(slider).toHaveAttribute("aria-valuetext", "1 день");
  await expect(verdict).toHaveText("Отдыхает после обжарки");
  await expect(page.getByRole("img", { name: /на 1 день после обжарки/ })).toBeVisible();

  await page.keyboard.press("End");
  await expect(slider).toHaveAttribute("aria-valuetext", "120 дней");
  await expect(verdict).toHaveText("Так часто бывает на полке");
  // гаснущие ноты часть рисунка, смысл в aria-label
  await expectNoA11yViolations(page, ['[role="img"][aria-label^="Вкусовые ноты"]']);
});

test("неделя показывает четверг обжарки и подпись по времени Минска", async ({ page }) => {
  await page.goto("/");
  const week = roastWeek(minskNow(new Date()));
  const days = page.getByRole("region", { name: "Неделя в мастерской" }).getByRole("listitem");
  await expect(days).toHaveCount(7);
  await expect(days.nth(3)).toContainText("жарим");
  await expect(days.nth(4)).toContainText("везём по Минску");
  await expect(page.getByText(week.note)).toBeVisible();
  const today = week.days.findIndex((d) => d.today);
  if (today >= 0) await expect(days.nth(today)).toHaveAttribute("aria-current", "date");
  else await expect(page.locator("[aria-current=date]")).toHaveCount(0);
});
