import { expect, it, vi } from "vitest";

vi.mock("@/lib/leads", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/leads")>()),
  insertLead: vi.fn().mockRejectedValue(new Error("connection refused at 10.0.0.1:5432")),
}));

const { POST } = await import("./route");

it("сбой базы это 500 с понятным текстом и без деталей", async () => {
  const spy = vi.spyOn(console, "error").mockImplementation(() => {});
  const res = await POST(
    new Request("http://localhost/api/lead", {
      method: "POST",
      body: JSON.stringify({
        website: "",
        startedAt: Date.now() - 10_000,
        consent: true,
        name: "Аня",
        phone: "+375291234567",
        interest: "question",
        question: "есть кения?",
      }),
    }),
  );
  expect(res.status).toBe(500);
  const body = await res.json();
  expect(body).toEqual({ message: expect.stringContaining("позвоните"), errors: {} });
  expect(JSON.stringify(body)).not.toContain("10.0.0.1");
  expect(spy).toHaveBeenCalled();
  spy.mockRestore();
});
