import { connection } from "next/server";
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

export default async function Home() {
  await connection();
  const now = minskNow(new Date());
  const week = roastWeek(now);
  return (
    <OrderProvider>
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
