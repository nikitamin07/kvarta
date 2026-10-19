import type { MetadataRoute } from "next";
import { SUBSCRIPTION } from "./catalog";

const VERCEL_HOST = process.env.VERCEL_PROJECT_PRODUCTION_URL;
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (VERCEL_HOST ? `https://${VERCEL_HOST}` : "http://localhost:3000");
export const SITE_INDEXING = process.env.SITE_INDEXING === "true";
export const SITE_NAME = "Кварта";
export const SITE_TITLE = "Кварта, свежая обжарка кофе в Минске";
export const SITE_DESCRIPTION =
  "Маленькая обжарка в Минске. Жарим по четвергам партиями по 5 кг, в пятницу везём по городу. " +
  `Зерно у вас на 1–3 день, подписка ${SUBSCRIPTION.price} BYN в месяц.`;
// меняется вместе с текстами страницы
export const CONTENT_UPDATED = "2026-10-19";

export const OPEN_GRAPH = {
  type: "website",
  locale: "ru_RU",
  siteName: SITE_NAME,
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
} as const;

export const absolute = (path: string) => new URL(path, SITE_URL).href;

export function robotsRules(indexing: boolean): MetadataRoute.Robots {
  if (!indexing) return { rules: { userAgent: "*", disallow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/", disallow: "/api/" },
    sitemap: absolute("/sitemap.xml"),
  };
}
