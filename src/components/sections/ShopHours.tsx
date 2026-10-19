"use client";

import { useEffect, useState } from "react";
import { HOURS, minskNow, shopStatus, type MinskNow } from "@/lib/schedule";
import styles from "./workshop.module.css";

const toNextMinute = () => 60_000 - (Date.now() % 60_000);

export function ShopHours({ now: initial }: { now: MinskNow }) {
  const [now, setNow] = useState(initial);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const tick = () => {
      setNow(minskNow(new Date()));
      timer = setTimeout(tick, toNextMinute());
    };
    timer = setTimeout(tick, toNextMinute());
    return () => clearTimeout(timer);
  }, []);

  const status = shopStatus(now);

  return (
    <>
      <dl className={styles.hours}>
        {HOURS.map((h, i) => (
          <div key={h.days} aria-current={i === status.todayRow ? "date" : undefined}>
            <dt>{h.days}</dt>
            <dd>{h.time}</dd>
          </div>
        ))}
      </dl>
      <div className={styles.live}>
        <span className={styles.dot} data-open={status.open} aria-hidden="true" />
        <div>
          <b>{status.title}</b>
          <span>{status.sub}</span>
        </div>
      </div>
    </>
  );
}
