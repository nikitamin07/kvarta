import { expect, test } from "./fixtures";

test("POST /api/lead на сборке отвечает 422 по полям и не кэшируется", async ({ request }) => {
  const res = await request.post("/api/lead", {
    data: { website: "", startedAt: Date.now() - 10_000, name: "", phone: "1", interest: "order" },
  });
  expect(res.status()).toBe(422);
  expect(res.headers()["cache-control"]).toBe("no-store");
  expect(res.headers()["x-content-type-options"]).toBe("nosniff");
  const body = await res.json();
  expect(body.message).toBeTruthy();
  expect(Object.keys(body.errors).sort()).toEqual(["items", "name", "phone"]);
});

test("GET /api/lead не поддерживается", async ({ request }) => {
  expect((await request.get("/api/lead")).status()).toBe(405);
});
