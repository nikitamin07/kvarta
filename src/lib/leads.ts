import { db } from "./db";

export type Interest = "order" | "subscription" | "question";

export type LeadSource = {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  click_id: string | null;
  landing_page: string | null;
  referrer: string | null;
};

export type LeadRecord = {
  name: string;
  phone: string;
  interest: Interest;
  items: unknown[];
  totalByn: number;
  question: string | null;
  comment: string | null;
  source: LeadSource;
  userAgent: string | null;
};

export const DEDUP_MINUTES = 10;

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
