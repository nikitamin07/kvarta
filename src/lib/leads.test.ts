import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { migrate } from "../../scripts/migrate.mjs";
import { db } from "./db";
import { insertLead, type LeadRecord } from "./leads";

const used: string[] = [];

function randomPhone(): string {
  const phone = `+37529${String(Math.floor(Math.random() * 1e7)).padStart(7, "0")}`;
  used.push(phone);
  return phone;
}

function lead(phone: string, patch: Partial<LeadRecord> = {}): LeadRecord {
  return {
    name: "Аня",
    phone,
    interest: "order",
    items: [{ id: "eth", name: "Эфиопия Иргачеффе", qty: 2, price: 32, sum: 64 }],
    totalByn: 64,
    question: null,
    comment: "помол под турку",
    source: {
      utm_source: "instagram",
      utm_medium: "cpc",
      utm_campaign: "autumn",
      utm_content: "ad-3",
      utm_term: null,
      click_id: null,
      landing_page: "/?utm_source=instagram",
      referrer: "https://l.instagram.com/",
    },
    userAgent: "vitest",
    ...patch,
  };
}

const countLeads = async (phone: string) =>
  Number((await db()`select count(*)::int as n from leads where phone = ${phone}`)[0].n);

beforeAll(async () => {
  const url = process.env.DATABASE_URL_TEST;
  if (!url) throw new Error("DATABASE_URL_TEST не задан, интеграционные тесты не запустить");
  await migrate(url);
});

afterAll(async () => {
  if (!used.length) return;
  await db()`delete from leads where phone = any(${used})`;
  await db()`delete from lead_locks where phone = any(${used})`;
});

describe("insertLead", () => {
  it("сохраняет заявку со всеми полями и источником", async () => {
    const phone = randomPhone();
    const result = await insertLead(lead(phone));
    expect(result?.id).toBeGreaterThan(0);

    const [row] = await db()`select * from leads where id = ${result!.id}`;
    expect(row).toMatchObject({
      name: "Аня",
      phone,
      interest: "order",
      total_byn: 64,
      comment: "помол под турку",
      utm_source: "instagram",
      utm_content: "ad-3",
      landing_page: "/?utm_source=instagram",
      referrer: "https://l.instagram.com/",
    });
    expect(row.items).toEqual([
      { id: "eth", name: "Эфиопия Иргачеффе", qty: 2, price: 32, sum: 64 },
    ]);
  });

  it("повтор номера в течение 10 минут не создаёт заявку", async () => {
    const phone = randomPhone();
    expect(await insertLead(lead(phone))).not.toBeNull();
    expect(await insertLead(lead(phone, { comment: "второй раз" }))).toBeNull();
    expect(await countLeads(phone)).toBe(1);
  });

  it("одновременные отправки одного номера создают ровно одну заявку", async () => {
    const phone = randomPhone();
    const results = await Promise.all(Array.from({ length: 6 }, () => insertLead(lead(phone))));
    expect(results.filter(Boolean)).toHaveLength(1);
    expect(await countLeads(phone)).toBe(1);
  });

  it("после 10 минут тот же номер снова принимается", async () => {
    const phone = randomPhone();
    await insertLead(lead(phone));
    await db()`update lead_locks set locked_until = now() - interval '1 second' where phone = ${phone}`;
    expect(await insertLead(lead(phone))).not.toBeNull();
    expect(await countLeads(phone)).toBe(2);
  });

  it("разные номера не мешают друг другу", async () => {
    const [a, b] = [randomPhone(), randomPhone()];
    const results = await Promise.all([insertLead(lead(a)), insertLead(lead(b))]);
    expect(results.every(Boolean)).toBe(true);
  });

  it("если база отвергла заявку, замок на номер не остаётся", async () => {
    const phone = randomPhone();
    await expect(insertLead(lead(phone, { name: "" }))).rejects.toThrow();
    const locks = await db()`select 1 from lead_locks where phone = ${phone}`;
    expect(locks).toHaveLength(0);
    expect(await insertLead(lead(phone))).not.toBeNull();
  });

  it("база сама не пускает неверный номер и отрицательную сумму", async () => {
    await expect(insertLead(lead("+375301234567"))).rejects.toThrow();
    await expect(insertLead(lead(randomPhone(), { totalByn: -1 }))).rejects.toThrow();
  });
});
