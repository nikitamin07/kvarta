import { afterEach, describe, expect, it, vi } from "vitest";
import type { LeadRecord } from "./leads";
import { leadMessage, sendToTelegram } from "./telegram";

const lead: LeadRecord = {
  name: "<b>Аня</b> & Ко",
  phone: "+375291234567",
  interest: "order",
  items: [{ id: "eth", name: "Эфиопия Иргачеффе", qty: 2, price: 32, sum: 64 }],
  totalByn: 64,
  question: null,
  comment: "звонить после 18",
  source: {
    utm_source: "instagram",
    utm_medium: null,
    utm_campaign: "autumn",
    utm_content: null,
    utm_term: null,
    click_id: null,
    landing_page: "/?utm_source=instagram",
    referrer: null,
  },
  userAgent: null,
};

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("leadMessage", () => {
  it("собирает заказ, сумму, комментарий и источник", () => {
    const text = leadMessage(lead, 7);
    expect(text).toContain("Заявка №7: Разовый заказ");
    expect(text).toContain("+375 29 123-45-67");
    expect(text).toContain("Эфиопия Иргачеффе × 2 = 64 BYN");
    expect(text).toContain("Итого: 64 BYN");
    expect(text).toContain("utm_source: instagram\nutm_campaign: autumn");
    expect(text).not.toContain("utm_medium");
  });

  it("экранирует html из полей человека", () => {
    expect(leadMessage(lead, 1)).toContain("Имя: &lt;b&gt;Аня&lt;/b&gt; &amp; Ко");
  });

  it("пишет, если источник неизвестен", () => {
    const source = Object.fromEntries(Object.keys(lead.source).map((k) => [k, null]));
    expect(leadMessage({ ...lead, source } as LeadRecord, 1)).toContain("Источник неизвестен");
  });
});

describe("sendToTelegram", () => {
  it("без токена ничего не отправляет", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    await sendToTelegram("текст");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("шлёт sendMessage с html разметкой", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "123:abc");
    vi.stubEnv("TELEGRAM_CHAT_ID", "-100");
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}"));
    vi.stubGlobal("fetch", fetchMock);
    await sendToTelegram("<b>текст</b>");
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("https://api.telegram.org/bot123:abc/sendMessage");
    expect(JSON.parse(init.body)).toEqual({
      chat_id: "-100",
      text: "<b>текст</b>",
      parse_mode: "HTML",
    });
  });

  it("сбой сети и ответ с ошибкой не бросают исключение", async () => {
    vi.stubEnv("TELEGRAM_BOT_TOKEN", "123:abc");
    vi.stubEnv("TELEGRAM_CHAT_ID", "-100");
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")));
    await expect(sendToTelegram("x")).resolves.toBeUndefined();
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("bad", { status: 400 })));
    await expect(sendToTelegram("x")).resolves.toBeUndefined();
    expect(spy).toHaveBeenCalledTimes(2);
    spy.mockRestore();
  });
});
