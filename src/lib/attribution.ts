import { SOURCE_KEYS, type LeadSource } from "./lead";

const CAMPAIGN_KEYS = SOURCE_KEYS.filter((k) => k !== "landing_page" && k !== "referrer");
const CLICK_KEYS = ["yclid", "gclid"];
const STORAGE_KEY = "kvarta-source";

export function sourceOfVisit(href: string, referrer: string): LeadSource {
  const url = new URL(href);
  const param = (k: string) => url.searchParams.get(k)?.trim() || null;
  let ref: string | null = null;
  try {
    if (referrer && new URL(referrer).origin !== url.origin) ref = referrer;
  } catch {}
  return {
    utm_source: param("utm_source"),
    utm_medium: param("utm_medium"),
    utm_campaign: param("utm_campaign"),
    utm_content: param("utm_content"),
    utm_term: param("utm_term"),
    click_id: CLICK_KEYS.map(param).find(Boolean) ?? null,
    landing_page: url.pathname + url.search,
    referrer: ref,
  };
}

function isCampaign(s: LeadSource): boolean {
  return CAMPAIGN_KEYS.some((k) => s[k]);
}

// новая реклама важнее старого захода
export function pickSource(stored: LeadSource | null, visit: LeadSource): LeadSource {
  return stored && !isCampaign(visit) ? stored : visit;
}

function readStored(): LeadSource | null {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null");
    if (!raw || typeof raw !== "object") return null;
    return Object.fromEntries(
      SOURCE_KEYS.map((k) => [k, typeof raw[k] === "string" ? raw[k] : null]),
    ) as LeadSource;
  } catch {
    return null;
  }
}

export function captureSource(): LeadSource {
  const source = pickSource(readStored(), sourceOfVisit(location.href, document.referrer));
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(source));
  } catch {}
  return source;
}
