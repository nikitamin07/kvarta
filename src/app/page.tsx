import { connection } from "next/server";
import { Build } from "@/components/sections/Build";
import { OrderProvider } from "@/context/OrderProvider";
import { formatDay, minskNow, roastWeek } from "@/lib/schedule";

export default async function Home() {
  await connection();
  const week = roastWeek(minskNow(new Date()));
  return (
    <OrderProvider>
      <section className="wrap sec" aria-labelledby="k-hero-h">
        <h1 id="k-hero-h">Жарим кофе так, как хотели бы пить его сами</h1>
      </section>
      <Build roastDay={formatDay(week.roast)} />
    </OrderProvider>
  );
}
