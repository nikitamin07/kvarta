import type { ProductId } from "./catalog";
import type { FieldErrors, Interest, LeadSource } from "./lead";
import type { OrderItem } from "./order";

export type LeadBody = {
  name: string;
  phone: string;
  interest: Interest;
  items: OrderItem[];
  subs: ProductId[];
  question: string;
  comment: string;
  consent: boolean;
  source: LeadSource | null;
  website: string;
  startedAt: number;
};

export type LeadResult =
  | { kind: "sent" }
  | { kind: "duplicate" }
  | { kind: "invalid"; errors: FieldErrors }
  | { kind: "rate-limited" }
  | { kind: "failed" };

const TIMEOUT_MS = 15_000;

async function readJson(res: Response): Promise<Record<string, unknown> | null> {
  try {
    const body = await res.json();
    return body && typeof body === "object" ? body : null;
  } catch {
    return null;
  }
}

export async function sendLead(body: LeadBody): Promise<LeadResult> {
  let res: Response;
  try {
    res = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });
  } catch {
    return { kind: "failed" };
  }

  if (res.status === 429) return { kind: "rate-limited" };
  if (res.status === 422) {
    const errors = (await readJson(res))?.errors;
    return { kind: "invalid", errors: errors && typeof errors === "object" ? errors : {} };
  }
  if (res.status !== 200) return { kind: "failed" };
  const data = await readJson(res);
  if (data?.ok !== true) return { kind: "failed" };
  return { kind: data.duplicate === true ? "duplicate" : "sent" };
}
