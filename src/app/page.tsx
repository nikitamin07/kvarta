import type { Metadata } from "next";
import { headers } from "next/headers";
import { connection } from "next/server";
import handsBeans from "@/assets/hands-beans.jpg";
import pourover from "@/assets/pourover.jpg";
import { Build } from "@/components/sections/Build";
import { Fresh } from "@/components/sections/Fresh";
import { Hero } from "@/components/sections/Hero";
import { Lead } from "@/components/sections/Lead";
import { Letter } from "@/components/sections/Letter";
import { Sub } from "@/components/sections/Sub";
import { Week } from "@/components/sections/Week";
import { Workshop } from "@/components/sections/Workshop";
import { OrderProvider } from "@/context/OrderProvider";
import { formatDay, minskNow, roastWeek } from "@/lib/schedule";
import { shopJsonLd, toJsonLd } from "@/lib/seo";
import { OPEN_GRAPH } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
  openGraph: { ...OPEN_GRAPH, url: "/" },
};

const JSON_LD = toJsonLd(shopJsonLd([handsBeans.src, pourover.src]));

export default async function Home() {
  await connection();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  const now = minskNow(new Date());
  const week = roastWeek(now);
  return (
    <OrderProvider>
      <script
        type="application/ld+json"
        nonce={nonce}
        dangerouslySetInnerHTML={{ __html: JSON_LD }}
      />
      <Hero roast={week.roast} />
      <Build roastDay={formatDay(week.roast)} />
      <Letter />
      <Fresh today={now.iso} />
      <Sub />
      <Week week={week} />
      <Workshop now={now} />
      <Lead />
    </OrderProvider>
  );
}
