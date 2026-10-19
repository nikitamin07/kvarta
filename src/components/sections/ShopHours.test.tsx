// @vitest-environment jsdom
import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { minskNow } from "@/lib/schedule";
import { ShopHours } from "./ShopHours";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

// время в UTC, Минск это UTC+3
function setup(utc: string) {
  vi.useFakeTimers({ now: new Date(utc) });
  render(<ShopHours now={minskNow(new Date(utc))} />);
}

const today = () => document.querySelector("[aria-current]")?.textContent;

describe("ShopHours", () => {
  it("каждую минуту пересчитывает отсчёт и закрывается в 20:00", () => {
    setup("2026-10-19T16:58:00Z");
    expect(today()).toBe("Пн–Пт8:00–20:00");
    expect(screen.getByText("Сейчас открыто")).toBeTruthy();
    expect(screen.getByText("Закроемся в 20:00, через 2 мин")).toBeTruthy();

    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("Закроемся в 20:00, через 1 мин")).toBeTruthy();

    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("Сейчас закрыто")).toBeTruthy();
    expect(screen.getByText("Откроемся завтра в 8:00")).toBeTruthy();
  });

  it("в выходной подсвечивает строку субботы и воскресенья", () => {
    setup("2026-10-24T06:00:00Z");
    expect(today()).toBe("Сб–Вс10:00–18:00");
    expect(screen.getByText("Откроемся сегодня в 10:00")).toBeTruthy();
  });

  it("тикает по границе минуты, а не от момента загрузки", () => {
    setup("2026-10-19T16:58:45Z");
    act(() => vi.advanceTimersByTime(15_000));
    expect(screen.getByText("Закроемся в 20:00, через 1 мин")).toBeTruthy();
  });
});
