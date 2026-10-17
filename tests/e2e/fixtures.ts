import AxeBuilder from "@axe-core/playwright";
import { test as base, expect, type Page } from "@playwright/test";

export const test = base.extend<{ consoleProblems: string[] }>({
  consoleProblems: [
    async ({ page }, use) => {
      const problems: string[] = [];
      page.on("console", (m) => {
        if (m.type() === "error" || m.type() === "warning")
          problems.push(`${m.type()} ${m.text()}`);
      });
      page.on("pageerror", (e) => problems.push(`pageerror ${e.message}`));
      await use(problems);
      expect(problems, "консоль без ошибок и предупреждений").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

export async function expectNoA11yViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page }).analyze();
  const summary = violations.map((v) => `${v.id} ${v.help} (${v.nodes.length})`);
  expect(summary, "axe без нарушений").toEqual([]);
}

export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow, "нет горизонтальной прокрутки").toBeLessThanOrEqual(0);
}
