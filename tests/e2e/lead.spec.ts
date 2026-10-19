import { neon } from "@neondatabase/serverless";
import type { Page } from "@playwright/test";
import { expect, expectNoA11yViolations, test } from "./fixtures";

const DB_URL = process.env.DATABASE_URL_TEST;

function randomPhone() {
  return `+37529${String(Math.floor(Math.random() * 1e7)).padStart(7, "0")}`;
}

const form = (page: Page) => page.locator("#k-lead form");

async function orderToStep2(page: Page): Promise<number> {
  await page.goto("/");
  const opened = Date.now();
  await page.locator("#k-build").getByRole("button", { name: "Добавить Колумбия Уила" }).click();
  await page.getByRole("link", { name: "Перенести в заявку" }).click();
  await form(page).getByRole("button", { name: "Дальше" }).click();
  await expect(form(page).getByText("Заказ: Колумбия, 29 BYN")).toBeVisible();
  return opened;
}

test("заявка доходит до базы с источником первого захода", async ({ page }) => {
  test.skip(!DB_URL, "нет DATABASE_URL_TEST");
  const sql = neon(DB_URL!);
  const phone = randomPhone();
  try {
    await page.goto("/?utm_source=e2e&utm_campaign=step7");
    await page.waitForFunction(() => localStorage.getItem("kvarta-source")?.includes("step7"));
    const opened = await orderToStep2(page);
    await form(page).getByLabel("Ваше имя").fill("Тест e2e");
    await form(page).getByLabel("Телефон").fill(phone);

    await form(page)
      .getByRole("checkbox", { name: /согласие/ })
      .check();
    // быстрее 3 с это бот
    await page.waitForTimeout(Math.max(0, 4_000 - (Date.now() - opened)));
    await form(page).getByRole("button", { name: "Отправить заявку" }).click();

    await expect(form(page).getByText(/Спасибо, заявка у нас/)).toBeVisible();
    const rows =
      await sql`select utm_source, utm_campaign, total_byn from leads where phone = ${phone}`;
    expect(rows).toEqual([{ utm_source: "e2e", utm_campaign: "step7", total_byn: 29 }]);
  } finally {
    await sql`delete from leads where phone = ${phone}`;
    await sql`delete from lead_locks where phone = ${phone}`;
  }
});

test("на 429 от Vercel видна ошибка с телефоном, данные на месте", async ({
  page,
  consoleProblems,
}) => {
  await page.route("**/api/lead", (route) =>
    route.fulfill({ status: 429, body: "Too Many Requests" }),
  );
  await orderToStep2(page);
  await form(page).getByLabel("Ваше имя").fill("Аня");
  await form(page).getByLabel("Телефон").fill("+375 29 123-45-67");

  await form(page)
    .getByRole("checkbox", { name: /согласие/ })
    .check();
  await form(page).getByRole("button", { name: "Отправить заявку" }).click();

  const alert = form(page).getByRole("alert");
  await expect(alert).toContainText("Слишком много попыток");
  await expect(alert.getByRole("link")).toHaveAttribute("href", "tel:+375290000000");
  await expect(form(page).getByLabel("Ваше имя")).toHaveValue("Аня");
  await expect(form(page).getByRole("button", { name: "Отправить заявку" })).toBeEnabled();
  await expectNoA11yViolations(page);

  // браузер сам пишет намеренный 429
  const expected = consoleProblems.findIndex((p) => p.includes("status of 429"));
  expect(expected).toBeGreaterThanOrEqual(0);
  consoleProblems.splice(expected, 1);
});

test("двойной клик отправляет одну заявку", async ({ page }) => {
  let calls = 0;
  await page.route("**/api/lead", async (route) => {
    calls++;
    await new Promise((r) => setTimeout(r, 500));
    await route.fulfill({ json: { ok: true, duplicate: false } });
  });
  await orderToStep2(page);
  await form(page).getByLabel("Ваше имя").fill("Аня");
  await form(page).getByLabel("Телефон").fill("+375 29 123-45-67");

  await form(page)
    .getByRole("checkbox", { name: /согласие/ })
    .check();
  await form(page).getByRole("button", { name: "Отправить заявку" }).dblclick();

  await expect(form(page).getByRole("button", { name: "Заявка отправлена" })).toBeDisabled();
  expect(calls).toBe(1);
});

test("подписку можно оформить с клавиатуры", async ({ page }) => {
  let body: Record<string, unknown> = {};
  await page.route("**/api/lead", async (route) => {
    body = route.request().postDataJSON();
    await route.fulfill({ json: { ok: true, duplicate: false } });
  });
  await page.goto("/#k-lead");
  const f = form(page);
  await f.getByRole("button", { name: "Разовый заказ" }).focus();
  await page.keyboard.press("Tab");
  await expect(f.getByRole("button", { name: "Подписка" })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(f.getByRole("checkbox", { name: /Эфиопия/ })).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  await page.keyboard.press("Tab");
  await expect(f.getByRole("button", { name: "Дальше" })).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(f.getByLabel("Ваше имя")).toBeFocused();
  await expect(f.getByText("Подписка: Эфиопия + Бразилия")).toBeVisible();
  await page.keyboard.type("Аня");
  await page.keyboard.press("Tab");
  await page.keyboard.type("29 123 45 67");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await expect(f.getByRole("checkbox", { name: /согласие/ })).toBeFocused();
  await page.keyboard.press("Space");
  await page.keyboard.press("Tab");
  await expect(f.getByRole("link", { name: "политике конфиденциальности" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(f.getByRole("button", { name: "Отправить заявку" })).toBeFocused();
  await page.keyboard.press("Enter");

  await expect(
    f.getByText("Спасибо, заявка у нас. Перезвоним на +375 29 123-45-67."),
  ).toBeVisible();
  expect(body).toMatchObject({ interest: "subscription", subs: ["eth", "bra"], website: "" });
});

test("неактивный шаг не попадает в порядок табуляции", async ({ page }) => {
  await page.goto("/#k-lead");
  await form(page).getByRole("button", { name: "Дальше" }).focus();
  await page.keyboard.press("Tab");
  await expect(form(page).getByLabel("Ваше имя")).not.toBeFocused();
  await expect(form(page).getByLabel("Ваше имя")).toBeHidden();
});

test("блоки формы стоят в ряд и уезжают вбок", async ({ page }) => {
  await page.goto("/#k-lead");
  // форма ожила после гидратации
  await page.waitForFunction(() => localStorage.getItem("kvarta-source"));
  const f = form(page);
  const panel = (label: string) => f.locator("[data-pos]", { has: page.getByLabel(label) }).last();
  const shiftX = (loc: ReturnType<typeof panel>) =>
    loc.evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).m41);
  const order = f
    .locator("[data-pos]", {
      has: page.getByRole("button", { name: "Добавить Эфиопия Иргачеффе", includeHidden: true }),
    })
    .last();
  const question = panel("Ваш вопрос");

  expect(await shiftX(question)).toBeGreaterThan(0);
  await f.getByRole("button", { name: "Вопрос" }).click();
  await expect.poll(() => shiftX(order)).toBeLessThan(0);
  await expect.poll(() => shiftX(question)).toBe(0);

  await f.getByRole("button", { name: "Подписка" }).click();
  await expect.poll(() => shiftX(question)).toBeGreaterThan(0);

  await f.getByRole("button", { name: "Разовый заказ" }).click();
  await f.getByRole("button", { name: "Добавить Бразилия Серрадо" }).click();
  await f.getByRole("button", { name: "Дальше" }).click();
  await expect.poll(() => shiftX(panel("Ваше имя"))).toBe(0);
  await expect.poll(() => shiftX(f.locator("[data-pos]").first())).toBeLessThan(0);
});

// замер стартует от самого клика
const heights = (page: Page) =>
  page.evaluate(
    () =>
      new Promise<number[]>((resolve) => {
        const f = document.querySelector("#k-lead form")!;
        const h = [Math.round(f.getBoundingClientRect().height)];
        f.addEventListener(
          "click",
          async () => {
            for (let i = 0; i < 14; i++) {
              await new Promise((r) => setTimeout(r, 40));
              h.push(Math.round(f.getBoundingClientRect().height));
            }
            resolve(h);
          },
          { once: true, capture: true },
        );
      }),
  );

test("высота формы идёт к новой без провала", async ({ page }) => {
  await page.goto("/#k-lead");
  await page.waitForFunction(() => localStorage.getItem("kvarta-source"));
  const f = form(page);
  for (const [name, dir] of [
    ["Вопрос", -1],
    ["Подписка", 1],
    ["Дальше", 1],
  ] as const) {
    const sampled = heights(page);
    await f.getByRole("button", { name, exact: true }).click();
    const h = await sampled;
    const steps = h.slice(1).map((v, i) => (v - h[i]) * dir);
    expect(
      steps.every((d) => d >= -1),
      `${name} ${h.join(" ")}`,
    ).toBe(true);
    expect((h.at(-1)! - h[0]) * dir, `${name} ${h.join(" ")}`).toBeGreaterThan(0);
  }
});

test("при reduced motion высота формы не анимируется", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/#k-lead");
  await page.waitForFunction(() => localStorage.getItem("kvarta-source"));
  await form(page).getByRole("button", { name: "Вопрос" }).click();
  const inline = await form(page)
    .locator("[data-pos]")
    .nth(1)
    .evaluate((el) => (el.parentElement as HTMLElement).style.height);
  expect(inline).toBe("");
});
