import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { migrate } from "../../../../scripts/migrate.mjs";
import { db } from "@/lib/db";

const afterTasks: (() => unknown)[] = [];
vi.mock("next/server", async (importOriginal) => ({
  ...(await importOriginal<typeof import("next/server")>()),
  after: (task: () => unknown) => afterTasks.push(task),
}));

const { POST } = await import("./route");

const used: string[] = [];
function randomPhone(): string {
  const phone = `+37544${String(Math.floor(Math.random() * 1e7)).padStart(7, "0")}`;
  used.push(phone);
  return phone;
}

const human = () => ({ website: "", startedAt: Date.now() - 10_000 });

function post(body: unknown, raw?: string | Uint8Array<ArrayBuffer>) {
  return POST(
    new Request("http://localhost/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json", "User-Agent": "vitest" },
      body: raw ?? JSON.stringify(body),
    }),
  );
}

const rowsFor = (phone: string) => db()`select * from leads where phone = ${phone}`;

beforeAll(async () => {
  await migrate(process.env.DATABASE_URL_TEST!);
});

beforeEach(() => {
  afterTasks.length = 0;
});

afterAll(async () => {
  await db()`delete from leads where phone = any(${used})`;
  await db()`delete from lead_locks where phone = any(${used})`;
});

describe("POST /api/lead", () => {
  it("сохраняет заказ, сумму считает сам и ставит копию в telegram после ответа", async () => {
    const phone = randomPhone();
    const res = await post({
      ...human(),
      name: "Аня",
      phone,
      interest: "order",
      items: [
        { id: "eth", qty: 2, price: 1 },
        { id: "drip", qty: 1 },
      ],
      total: 3,
      source: { utm_source: "yandex", utm_campaign: "coffee", landing_page: "/" },
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, duplicate: false });

    const [row] = await rowsFor(phone);
    expect(row.total_byn).toBe(82);
    expect(row.items).toEqual([
      { id: "eth", name: "Эфиопия Иргачеффе", qty: 2, price: 32, sum: 64 },
      { id: "drip", name: "Дрип-пакеты", qty: 1, price: 18, sum: 18 },
    ]);
    expect(row).toMatchObject({
      utm_source: "yandex",
      utm_campaign: "coffee",
      user_agent: "vitest",
    });
    expect(afterTasks).toHaveLength(1);
  });

  it("повтор номера отвечает 200 с duplicate и не пишет вторую заявку", async () => {
    const phone = randomPhone();
    const body = { ...human(), name: "Дима", phone, interest: "question", question: "опт?" };
    await post(body);
    const res = await post(body);
    expect(await res.json()).toEqual({ ok: true, duplicate: true });
    expect(await rowsFor(phone)).toHaveLength(1);
    expect(afterTasks).toHaveLength(1);
  });

  it("подписка из одного сорта это две пачки за 54 BYN", async () => {
    const phone = randomPhone();
    await post({ ...human(), name: "Аня", phone, interest: "subscription", subs: ["col"] });
    const [row] = await rowsFor(phone);
    expect(row.total_byn).toBe(54);
    expect(row.items).toEqual([{ id: "col", name: "Колумбия Уила", qty: 2 }]);
  });

  it("ошибки полей это 422 в формате message и errors", async () => {
    const res = await post({ ...human(), name: "", phone: "123", interest: "order", items: [] });
    expect(res.status).toBe(422);
    const body = await res.json();
    expect(body.message).toBe("Проверьте поля формы");
    expect(Object.keys(body.errors).sort()).toEqual(["items", "name", "phone"]);
    expect(body.errors.phone[0]).toContain("+375");
  });

  it("битый json это 400, огромное тело это 413, формат тот же", async () => {
    const bad = await post(null, "{name:");
    expect(bad.status).toBe(400);
    expect(await bad.json()).toEqual({ message: expect.any(String), errors: {} });
    const big = await post(null, JSON.stringify({ comment: "я".repeat(20_000) }));
    expect(big.status).toBe(413);
  });

  // время считаем внутри теста
  it.each([
    ["заполнена ловушка", "http://spam.example", 10_000],
    ["форма отправлена за секунду", "", 1000],
    ["нет отметки времени", "", null],
  ])("бот (%s): 200, но ничего не пишем", async (_, website, age) => {
    const phone = randomPhone();
    const trap = age === null ? { website } : { website, startedAt: Date.now() - age };
    const res = await post({ ...trap, name: "Bot", phone, interest: "question", question: "buy" });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, duplicate: false });
    expect(await rowsFor(phone)).toHaveLength(0);
    expect(afterTasks).toHaveLength(0);
  });

  it("413 по заявленной длине и по потоку без длины, тело целиком не читаем", async () => {
    const declared = new Request("http://localhost/api/lead", {
      method: "POST",
      headers: { "Content-Length": "999999" },
      body: "{}",
    });
    expect((await POST(declared)).status).toBe(413);

    let pulled = 0;
    const endless = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled += 1;
        controller.enqueue(new Uint8Array(4096));
      },
    });
    const streamed = new Request("http://localhost/api/lead", {
      method: "POST",
      body: endless,
      duplex: "half",
    } as RequestInit);
    expect((await POST(streamed)).status).toBe(413);
    expect(pulled).toBeLessThan(10);
  });

  it("кириллица в utf8 сохраняется как есть", async () => {
    const phone = randomPhone();
    const body = {
      ...human(),
      name: "Аня & Ко",
      phone,
      interest: "question",
      question: "Есть Кения?",
    };
    expect((await post(body)).status).toBe(200);
    const [row] = await rowsFor(phone);
    expect(row).toMatchObject({ name: "Аня & Ко", question: "Есть Кения?" });
  });

  it("тело не в utf8 это 400, в базу ничего не пишем", async () => {
    const phone = randomPhone();
    const json = (name: string) =>
      JSON.stringify({ ...human(), name, phone, interest: "question", question: "q" });
    const [head, tail] = json("@@").split("@@");
    // «Тест» в windows 1251, как шлёт curl из git bash
    const cp1251 = new Uint8Array([
      ...new TextEncoder().encode(head),
      0xd2,
      0xe5,
      0xf1,
      0xf2,
      ...new TextEncoder().encode(tail),
    ]);
    const res = await post(null, cp1251);
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ message: "Не удалось прочитать заявку", errors: {} });
    expect(await rowsFor(phone)).toHaveLength(0);
  });

  it("ответы не кэшируются", async () => {
    const res = await post(null, "{");
    expect(res.headers.get("cache-control")).toBe("no-store");
  });
});
