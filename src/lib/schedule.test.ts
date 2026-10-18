import { describe, expect, it } from "vitest";
import { addDays, formatDay, minskNow, roastWeek, shopStatus } from "./schedule";

// время в тестах задано в UTC, Минск это UTC+3
const at = (utc: string) => minskNow(new Date(utc));

describe("minskNow", () => {
  it("берёт день и время Минска, а не UTC", () => {
    expect(at("2026-10-19T21:30:00Z")).toEqual({ iso: "2026-10-20", dow: 1, minutes: 30 });
  });

  it("понедельник это 0, воскресенье это 6", () => {
    expect(at("2026-10-19T09:00:00Z").dow).toBe(0);
    expect(at("2026-10-25T09:00:00Z").dow).toBe(6);
  });
});

describe("addDays и formatDay", () => {
  it("переходит через месяц и год", () => {
    expect(addDays("2026-10-30", 6)).toBe("2026-11-05");
    expect(addDays("2026-12-31", 1)).toBe("2027-01-01");
    expect(formatDay("2027-01-01")).toBe("1 января");
  });
});

describe("roastWeek", () => {
  it("в среду показывает текущую неделю и отмечает сегодня", () => {
    const w = roastWeek(at("2026-10-21T09:00:00Z"));
    expect(w.days[0].iso).toBe("2026-10-19");
    expect(w.roast).toBe("2026-10-22");
    expect(w.ship).toBe("2026-10-23");
    expect(w.days.filter((d) => d.today).map((d) => d.name)).toEqual(["Ср"]);
    expect(w.note).toBe("следующая обжарка 22 октября, доставка 23 октября");
  });

  it("в четверг до полуночи по Минску говорит что жарим сегодня", () => {
    const w = roastWeek(at("2026-10-22T20:59:00Z"));
    expect(w.roast).toBe("2026-10-22");
    expect(w.note).toBe("сегодня жарим, завтра привезём");
  });

  it("с пятницы показывает следующую неделю без отметки сегодня", () => {
    const w = roastWeek(at("2026-10-22T21:00:00Z"));
    expect(w.days[0].iso).toBe("2026-10-26");
    expect(w.roast).toBe("2026-10-29");
    expect(w.days.some((d) => d.today)).toBe(false);
  });

  it("в воскресенье тоже следующая неделя", () => {
    expect(roastWeek(at("2026-10-25T12:00:00Z")).roast).toBe("2026-10-29");
  });

  it("переходит через месяц и год", () => {
    expect(roastWeek(at("2026-10-30T12:00:00Z")).note).toBe(
      "следующая обжарка 5 ноября, доставка 6 ноября",
    );
    const nye = roastWeek(at("2026-12-31T12:00:00Z"));
    expect([nye.roast, nye.ship]).toEqual(["2026-12-31", "2027-01-01"]);
    expect(roastWeek(at("2027-01-01T12:00:00Z")).roast).toBe("2027-01-07");
  });

  it("всегда семь дней с четвергом обжарки и пятницей доставки", () => {
    const w = roastWeek(at("2026-10-19T09:00:00Z"));
    expect(w.days).toHaveLength(7);
    expect(w.days.find((d) => d.roast)?.name).toBe("Чт");
    expect(w.days.find((d) => d.ship)?.name).toBe("Пт");
  });
});

describe("shopStatus", () => {
  it("в будни открыто с 8:00 до 20:00", () => {
    expect(shopStatus(at("2026-10-19T04:59:00Z"))).toMatchObject({
      open: false,
      sub: "Откроемся сегодня в 8:00",
    });
    expect(shopStatus(at("2026-10-19T05:00:00Z"))).toMatchObject({
      open: true,
      title: "Сейчас открыто",
      sub: "Закроемся в 20:00, через 12 ч",
      todayRow: 0,
    });
    expect(shopStatus(at("2026-10-19T16:59:00Z")).sub).toBe("Закроемся в 20:00, через 1 мин");
    expect(shopStatus(at("2026-10-19T14:15:00Z")).sub).toBe("Закроемся в 20:00, через 2 ч 45 мин");
    expect(shopStatus(at("2026-10-19T17:00:00Z"))).toMatchObject({
      open: false,
      title: "Сейчас закрыто",
      sub: "Откроемся завтра в 8:00",
    });
  });

  it("в пятницу вечером обещает субботу с 10:00", () => {
    expect(shopStatus(at("2026-10-23T18:00:00Z")).sub).toBe("Откроемся завтра в 10:00");
  });

  it("в выходные открыто с 10:00 до 18:00", () => {
    expect(shopStatus(at("2026-10-24T06:00:00Z"))).toMatchObject({
      open: false,
      sub: "Откроемся сегодня в 10:00",
      todayRow: 1,
    });
    expect(shopStatus(at("2026-10-24T07:00:00Z")).open).toBe(true);
    expect(shopStatus(at("2026-10-25T15:00:00Z")).sub).toBe("Откроемся завтра в 8:00");
  });

  it("после полуночи по Минску уже новый день, хотя в UTC ещё вчера", () => {
    expect(shopStatus(at("2026-10-23T21:30:00Z"))).toMatchObject({
      open: false,
      sub: "Откроемся сегодня в 10:00",
      todayRow: 1,
    });
  });
});
