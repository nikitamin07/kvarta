import { CATALOG, MAX_QTY, SUBSCRIPTION_IDS, type ProductId } from "./catalog";
import type { OrderItem } from "./order";
import { checkPhone, PHONE_ERRORS } from "./phone";

export const INTERESTS = ["order", "subscription", "question"] as const;
export type Interest = (typeof INTERESTS)[number];

export const SOURCE_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "click_id",
  "landing_page",
  "referrer",
] as const;
export type SourceKey = (typeof SOURCE_KEYS)[number];
export type LeadSource = Record<SourceKey, string | null>;

export type LeadField = "name" | "phone" | "interest" | "items" | "subs" | "question" | "comment";
export type FieldErrors = Partial<Record<LeadField, string[]>>;

export type ValidLead = {
  name: string;
  phone: string;
  interest: Interest;
  items: OrderItem[];
  subs: ProductId[];
  question: string | null;
  comment: string | null;
  source: LeadSource;
};

export const NAME_MAX = 60;
export const TEXT_MAX = 1000;
export const MIN_FILL_MS = 3000;

const SOURCE_MAX: Record<SourceKey, number> = {
  utm_source: 200,
  utm_medium: 200,
  utm_campaign: 200,
  utm_content: 200,
  utm_term: 200,
  click_id: 200,
  landing_page: 500,
  referrer: 500,
};

const str = (v: unknown) => (typeof v === "string" ? v.trim() : "");

function cleanSource(v: unknown): LeadSource {
  const raw = v && typeof v === "object" ? (v as Record<string, unknown>) : {};
  return Object.fromEntries(
    SOURCE_KEYS.map((k) => [k, str(raw[k]).slice(0, SOURCE_MAX[k]) || null]),
  ) as LeadSource;
}

function cleanItems(v: unknown): OrderItem[] | null {
  if (!Array.isArray(v)) return null;
  const qty = new Map<ProductId, number>();
  for (const item of v) {
    const { id, qty: q } = (item ?? {}) as { id?: unknown; qty?: unknown };
    const product = CATALOG.find((p) => p.id === id);
    if (!product || !Number.isInteger(q) || (q as number) < 1) return null;
    qty.set(product.id, (qty.get(product.id) ?? 0) + (q as number));
  }
  if ([...qty.values()].some((q) => q > MAX_QTY)) return null;
  return [...qty].map(([id, q]) => ({ id, qty: q }));
}

function cleanSubs(v: unknown): ProductId[] | null {
  if (!Array.isArray(v) || v.length < 1 || v.length > 2) return null;
  const ok = v.every((id) => (SUBSCRIPTION_IDS as readonly unknown[]).includes(id));
  return ok ? (v as ProductId[]) : null;
}

export function validateLead(
  body: unknown,
): { ok: true; data: ValidLead } | { ok: false; errors: FieldErrors } {
  const b = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const errors: FieldErrors = {};
  const add = (field: LeadField, message: string) => (errors[field] ??= []).push(message);

  const name = str(b.name);
  if (!name) add("name", "Напишите, как к вам обращаться");
  else if (name.length > NAME_MAX) add("name", `Имя длиннее ${NAME_MAX} символов`);

  const phone = checkPhone(typeof b.phone === "string" ? b.phone : "");
  if (!phone.ok) add("phone", PHONE_ERRORS[phone.error]);

  const interest = INTERESTS.find((i) => i === b.interest);
  if (!interest) add("interest", "Выберите, что вас интересует");

  let items: OrderItem[] = [];
  let subs: ProductId[] = [];
  if (interest === "order") {
    const cleaned = cleanItems(b.items);
    if (!cleaned) add("items", `Проверьте заказ: сорта из каталога, от 1 до ${MAX_QTY} штук`);
    else if (!cleaned.length) add("items", "Добавьте хотя бы одну пачку плюсом");
    else items = cleaned;
  }
  if (interest === "subscription") {
    const cleaned = cleanSubs(b.subs);
    if (!cleaned) add("subs", "Отметьте один или два сорта для подписки");
    else subs = cleaned;
  }

  const question = str(b.question);
  if (interest === "question" && !question) {
    add("question", "Напишите вопрос, чтобы менеджер подготовился к звонку");
  }
  if (question.length > TEXT_MAX) add("question", `Вопрос длиннее ${TEXT_MAX} символов`);

  const comment = str(b.comment);
  if (comment.length > TEXT_MAX) add("comment", `Комментарий длиннее ${TEXT_MAX} символов`);

  if (Object.keys(errors).length || !interest || !phone.ok) return { ok: false, errors };
  return {
    ok: true,
    data: {
      name,
      phone: phone.phone,
      interest,
      items,
      subs,
      question: interest === "question" ? question : null,
      comment: comment || null,
      source: cleanSource(b.source),
    },
  };
}

// ловушка заполнена или форма слишком быстрая
export function looksLikeBot(body: unknown, now: number): boolean {
  const b = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  if (typeof b.website !== "string" || b.website !== "") return true;
  const startedAt = b.startedAt;
  if (typeof startedAt !== "number" || !Number.isFinite(startedAt)) return true;
  return now - startedAt < MIN_FILL_MS;
}
