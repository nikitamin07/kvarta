import { connection } from "next/server";
import { Build } from "@/components/sections/Build";
import { Hero } from "@/components/sections/Hero";
import { Lead } from "@/components/sections/Lead";
import { Letter } from "@/components/sections/Letter";
import { OrderProvider } from "@/context/OrderProvider";
import { formatDay, minskNow, roastWeek } from "@/lib/schedule";

export default async function Home() {
  await connection();
  const week = roastWeek(minskNow(new Date()));
  return (
    <OrderProvider>
      <Hero roast={week.roast} />
      <Build roastDay={formatDay(week.roast)} />
      <Letter />
      <Lead />
    </OrderProvider>
  );
}
