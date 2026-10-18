import { expect, test } from "./fixtures";

test("главная отдаёт CSP с новым nonce на каждый запрос", async ({ page, request }) => {
  const first = await request.get("/");
  const second = await request.get("/");
  const nonceOf = (csp: string | undefined) => /'nonce-([^']+)'/.exec(csp ?? "")?.[1];

  const nonce = nonceOf(first.headers()["content-security-policy"]);
  expect(nonce).toBeTruthy();
  expect(nonceOf(second.headers()["content-security-policy"])).not.toBe(nonce);

  await page.goto("/");
  const scripts = await page
    .locator("script")
    .evaluateAll((els) =>
      els.map((el) => ({ src: el.getAttribute("src"), nonce: (el as HTMLScriptElement).nonce })),
    );
  expect(scripts.length).toBeGreaterThan(0);
  expect(scripts.filter((s) => !s.nonce)).toEqual([]);
});

test("заголовки безопасности на месте", async ({ request }) => {
  const headers = (await request.get("/")).headers();
  expect(headers["x-content-type-options"]).toBe("nosniff");
  expect(headers["x-frame-options"]).toBe("DENY");
  expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
  expect(headers["strict-transport-security"]).toContain("max-age=");
  expect(headers["permissions-policy"]).toContain("camera=()");
  expect(headers["x-powered-by"]).toBeUndefined();
});
