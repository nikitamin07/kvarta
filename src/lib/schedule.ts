const TZ = "Europe/Minsk";

const MONTHS = [
  "января",
  "февраля",
  "марта",
  "апреля",
  "мая",
  "июня",
  "июля",
  "августа",
  "сентября",
  "октября",
  "ноября",
  "декабря",
];

const DAY_NAMES = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const DAY_TEXTS = [
  "собираем заявки",
  "собираем заявки",
  "звоним, уточняем",
  "жарим",
  "везём по Минску",
  "мастерская открыта",
  "мастерская открыта",
];
const ROAST_DOW = 3;
const SHIP_DOW = 4;

export const HOURS = [
  { days: "Пн–Пт", time: "8:00–20:00", from: 8, to: 20 },
  { days: "Сб–Вс", time: "10:00–18:00", from: 10, to: 18 },
] as const;

// dow 0 это понедельник
export type MinskNow = { iso: string; dow: number; minutes: number };

const minskFormat = new Intl.DateTimeFormat("en-GB", {
  timeZone: TZ,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

export function minskNow(date: Date): MinskNow {
  const p = Object.fromEntries(minskFormat.formatToParts(date).map((x) => [x.type, x.value]));
  const iso = `${p.year}-${p.month}-${p.day}`;
  return { iso, dow: dowOf(iso), minutes: Number(p.hour) * 60 + Number(p.minute) };
}

function utcDay(iso: string): Date {
  return new Date(`${iso}T00:00:00Z`);
}

export function dowOf(iso: string): number {
  return (utcDay(iso).getUTCDay() + 6) % 7;
}

export function addDays(iso: string, n: number): string {
  const d = utcDay(iso);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function formatDay(iso: string): string {
  const d = utcDay(iso);
  return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
}

export function dayParts(iso: string): { day: number; month: string } {
  const d = utcDay(iso);
  return { day: d.getUTCDate(), month: MONTHS[d.getUTCMonth()] };
}

export type WeekDay = {
  name: string;
  iso: string;
  text: string;
  roast: boolean;
  ship: boolean;
  today: boolean;
};

export type RoastWeek = { days: WeekDay[]; roast: string; ship: string; note: string };

export function roastWeek(now: MinskNow): RoastWeek {
  // после четверга показываем следующую неделю
  const monday = addDays(now.iso, -now.dow + (now.dow > ROAST_DOW ? 7 : 0));
  const roast = addDays(monday, ROAST_DOW);
  const ship = addDays(monday, SHIP_DOW);
  const days = DAY_NAMES.map((name, i) => ({
    name,
    iso: addDays(monday, i),
    text: DAY_TEXTS[i],
    roast: i === ROAST_DOW,
    ship: i === SHIP_DOW,
    today: now.dow <= ROAST_DOW && i === now.dow,
  }));
  const note =
    now.dow === ROAST_DOW
      ? "сегодня жарим, завтра привезём"
      : `следующая обжарка ${formatDay(roast)}, доставка ${formatDay(ship)}`;
  return { days, roast, ship, note };
}

export function hoursOf(dow: number) {
  return dow >= 5 ? HOURS[1] : HOURS[0];
}

function duration(m: number): string {
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (!h) return `${r} мин`;
  return r ? `${h} ч ${r} мин` : `${h} ч`;
}

export type ShopStatus = { open: boolean; title: string; sub: string; todayRow: 0 | 1 };

export function shopStatus(now: MinskNow): ShopStatus {
  const today = hoursOf(now.dow);
  const todayRow = today === HOURS[0] ? 0 : 1;
  const from = today.from * 60;
  const to = today.to * 60;
  if (now.minutes >= from && now.minutes < to) {
    const sub = `Закроемся в ${today.to}:00, через ${duration(to - now.minutes)}`;
    return { open: true, title: "Сейчас открыто", sub, todayRow };
  }
  const sub =
    now.minutes < from
      ? `Откроемся сегодня в ${today.from}:00`
      : `Откроемся завтра в ${hoursOf((now.dow + 1) % 7).from}:00`;
  return { open: false, title: "Сейчас закрыто", sub, todayRow };
}
