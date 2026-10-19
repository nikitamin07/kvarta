import { CATALOG, SUBSCRIPTION } from "./catalog";
import { MAPS_URL, SHOP_PHONE } from "./contacts";
import { HOURS, hoursOf } from "./schedule";
import { absolute, SITE_DESCRIPTION, SITE_NAME } from "./site";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
const pad = (h: number) => `${String(h).padStart(2, "0")}:00`;

function offer(price: number) {
  return {
    "@type": "Offer",
    price,
    priceCurrency: "BYN",
    availability: "https://schema.org/InStock",
    url: absolute("/#k-lead"),
    seller: { "@id": absolute("/#shop") },
  };
}

export function shopJsonLd(images: string[]) {
  const shop = { "@id": absolute("/#shop") };
  const prices = [...CATALOG.map((p) => p.price), SUBSCRIPTION.price];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": absolute("/#site"),
        name: SITE_NAME,
        url: absolute("/"),
        inLanguage: "ru",
        publisher: shop,
      },
      {
        "@type": "CafeOrCoffeeShop",
        ...shop,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: absolute("/"),
        image: images.map(absolute),
        telephone: SHOP_PHONE,
        priceRange: `${Math.min(...prices)}–${Math.max(...prices)} BYN`,
        servesCuisine: "Кофе",
        hasMap: MAPS_URL,
        address: {
          "@type": "PostalAddress",
          streetAddress: "ул. Короля, 9",
          addressLocality: "Минск",
          addressCountry: "BY",
        },
        openingHoursSpecification: HOURS.map((h) => ({
          "@type": "OpeningHoursSpecification",
          dayOfWeek: DAYS.filter((_, dow) => hoursOf(dow) === h),
          opens: pad(h.from),
          closes: pad(h.to),
        })),
      },
      ...CATALOG.map((p) => ({
        "@type": "Product",
        "@id": absolute(`/#${p.id}`),
        name: p.name,
        description: `${p.notes}, ${p.unit}`,
        brand: shop,
        offers: offer(p.price),
      })),
      {
        "@type": "Product",
        "@id": absolute("/#subscription"),
        name: "Подписка на кофе",
        description: `${SUBSCRIPTION.packs} пачки по 250 г раз в месяц, доставка бесплатно`,
        brand: shop,
        offers: {
          ...offer(SUBSCRIPTION.price),
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            price: SUBSCRIPTION.price,
            priceCurrency: "BYN",
            referenceQuantity: { "@type": "QuantitativeValue", value: 1, unitCode: "MON" },
          },
        },
      },
    ],
  };
}

// json внутри script не должен закрыть тег
export const toJsonLd = (data: object) => JSON.stringify(data).replace(/</g, "\u003c");
