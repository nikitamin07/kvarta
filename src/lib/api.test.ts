import { afterEach, describe, expect, it, vi } from "vitest";
import { sendLead, type LeadBody } from "./api";

const BODY: LeadBody = {
  name: "Аня",
  phone: "+375291234567",
  interest: "question",
  items: [],
  subs: [],
  question: "Какой помол?",
  comment: "",
  source: null,
  website: "",
  startedAt: 0,
};

function reply(status: number, body: string) {
  vi.stubGlobal(
    "fetch",
    vi.fn(async () => new Response(body, { status })),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("sendLead", () => {
  it("шлёт json на /api/lead", async () => {
    reply(200, '{"ok":true,"duplicate":false}');
    expect(await sendLead(BODY)).toEqual({ kind: "sent" });
    const [url, init] = vi.mocked(fetch).mock.calls[0];
    expect(url).toBe("/api/lead");
    expect(JSON.parse(String(init?.body))).toEqual(BODY);
  });

  it("узнаёт дубль", async () => {
    reply(200, '{"ok":true,"duplicate":true}');
    expect(await sendLead(BODY)).toEqual({ kind: "duplicate" });
  });

  it("отдаёт ошибки полей на 422", async () => {
    reply(422, '{"message":"x","errors":{"phone":["нет"]}}');
    expect(await sendLead(BODY)).toEqual({ kind: "invalid", errors: { phone: ["нет"] } });
  });

  it("не падает на 422 с телом не в json", async () => {
    reply(422, "<html>");
    expect(await sendLead(BODY)).toEqual({ kind: "invalid", errors: {} });
  });

  it("429 от Vercel с телом не в json это лимит", async () => {
    reply(429, "Too Many Requests");
    expect(await sendLead(BODY)).toEqual({ kind: "rate-limited" });
  });

  it.each([
    [500, '{"message":"x","errors":{}}'],
    [502, "<html>Bad gateway</html>"],
    [200, "not json"],
    [200, '{"ok":false}'],
  ])("%i с телом %s это сбой", async (status, body) => {
    reply(status, body);
    expect(await sendLead(BODY)).toEqual({ kind: "failed" });
  });

  it("сбой сети это сбой", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));
    expect(await sendLead(BODY)).toEqual({ kind: "failed" });
  });
});
