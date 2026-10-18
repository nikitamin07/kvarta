import type { LeadRecord } from "./leads";
import { formatPhone } from "./phone";

const INTEREST_LABEL = {
  order: "Разовый заказ",
  subscription: "Подписка",
  question: "Вопрос",
} as const;

const escape = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

export function leadMessage(lead: LeadRecord, id: number): string {
  const lines = [
    `<b>Заявка №${id}: ${INTEREST_LABEL[lead.interest]}</b>`,
    `Имя: ${escape(lead.name)}`,
    `Телефон: ${formatPhone(lead.phone)}`,
  ];
  if (lead.interest === "order") {
    lines.push(...lead.items.map((i) => `• ${escape(i.name)} × ${i.qty} = ${i.sum} BYN`));
    lines.push(`Итого: ${lead.totalByn} BYN`);
  }
  if (lead.interest === "subscription") {
    const packs = lead.items.map((i) => `${escape(i.name)} × ${i.qty}`).join(", ");
    lines.push(`Пачки: ${packs}`, `Цена: ${lead.totalByn} BYN в месяц`);
  }
  if (lead.question) lines.push(`Вопрос: ${escape(lead.question)}`);
  if (lead.comment) lines.push(`Комментарий: ${escape(lead.comment)}`);

  const source = Object.entries(lead.source)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}: ${escape(v as string)}`);
  lines.push("", source.length ? `<b>Источник</b>\n${source.join("\n")}` : "Источник неизвестен");
  return lines.join("\n");
}

// сбой телеграма не должен ломать заявку
export async function sendToTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) console.error(`telegram: ${res.status} ${await res.text()}`);
  } catch (error) {
    console.error("telegram: request failed", error);
  }
}
