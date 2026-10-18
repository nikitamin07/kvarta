import { findProduct, SUBSCRIPTION, type ProductId } from "./catalog";
import { db } from "./db";
import type { Interest, LeadSource, ValidLead } from "./lead";
import { priceOrder } from "./order";

// у подписки цена общая, без цены позиции
export type LeadItem = { id: ProductId; name: string; qty: number; price?: number; sum?: number };

export type LeadRecord = {
  name: string;
  phone: string;
  interest: Interest;
  items: LeadItem[];
  totalByn: number;
  question: string | null;
  comment: string | null;
  source: LeadSource;
  userAgent: string | null;
};

export const DEDUP_MINUTES = 10;

export function toLeadRecord(lead: ValidLead, userAgent: string | null): LeadRecord {
  const base = {
    name: lead.name,
    phone: lead.phone,
    interest: lead.interest,
    question: lead.question,
    comment: lead.comment,
    source: lead.source,
    userAgent: userAgent?.slice(0, 500) || null,
  };
  if (lead.interest === "order") {
    const { lines, total } = priceOrder(lead.items);
    const items = lines.map((l) => ({
      id: l.product.id,
      name: l.product.name,
      qty: l.qty,
      price: l.product.price,
      sum: l.sum,
    }));
    return { ...base, items, totalByn: total };
  }
  if (lead.interest === "subscription") {
    const packs = lead.subs.length === 1 ? [lead.subs[0], lead.subs[0]] : lead.subs;
    const counts = new Map<ProductId, number>();
    for (const id of packs) counts.set(id, (counts.get(id) ?? 0) + 1);
    const items = [...counts].map(([id, qty]) => ({ id, name: findProduct(id)?.name ?? id, qty }));
    return { ...base, items, totalByn: SUBSCRIPTION.price };
  }
  return { ...base, items: [], totalByn: 0 };
}

// замок и заявка одним запросом
export async function insertLead(lead: LeadRecord): Promise<{ id: number } | null> {
  const s = lead.source;
  const rows = await db()`
    with lock as (
      insert into lead_locks (phone, locked_until)
      values (${lead.phone}, now() + make_interval(mins => ${DEDUP_MINUTES}))
      on conflict (phone) do update set locked_until = excluded.locked_until
      where lead_locks.locked_until <= now()
      returning phone
    )
    insert into leads (
      name, phone, interest, items, total_byn, question, comment,
      utm_source, utm_medium, utm_campaign, utm_content, utm_term,
      click_id, landing_page, referrer, user_agent
    )
    select
      ${lead.name}, lock.phone, ${lead.interest}, ${JSON.stringify(lead.items)}::jsonb,
      ${lead.totalByn}, ${lead.question}, ${lead.comment},
      ${s.utm_source}, ${s.utm_medium}, ${s.utm_campaign}, ${s.utm_content}, ${s.utm_term},
      ${s.click_id}, ${s.landing_page}, ${s.referrer}, ${lead.userAgent}
    from lock
    returning id
  `;
  return rows.length ? { id: Number(rows[0].id) } : null;
}
