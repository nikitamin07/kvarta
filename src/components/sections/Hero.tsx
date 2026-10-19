import Image from "next/image";
import handsBeans from "@/assets/hands-beans.jpg";
import pourover from "@/assets/pourover.jpg";
import { SUBSCRIPTION } from "@/lib/catalog";
import { dayParts, formatDay } from "@/lib/schedule";
import styles from "./hero.module.css";

export function Hero({ roast }: { roast: string }) {
  const { day, month } = dayParts(roast);
  return (
    <section className={styles.hero} aria-labelledby="k-hero-h">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.text}>
          <h1 id="k-hero-h">Жарим кофе так, как хотели бы пить его сами</h1>
          <p className={styles.sub}>
            Маленькая мастерская в Минске. Обжариваем по четвергам, у вас зерно на 1–3 день.
          </p>
          <div className={styles.cta}>
            <a className="btn" href="#k-build">
              Собрать заказ
            </a>
            <a className="btn btn-line" href="#k-sub">
              Подписка за {SUBSCRIPTION.price} BYN
            </a>
          </div>
        </div>
        <div className={styles.stage}>
          <figure className={`${styles.print} ${styles.p1}`}>
            <Image
              src={handsBeans}
              alt="Свежеобжаренное зерно в ладони"
              sizes="(min-width: 900px) 330px, (min-width: 600px) 280px, 52vw"
              loading="eager"
              fetchPriority="high"
            />
            <figcaption>ещё тёплое, после ростера</figcaption>
          </figure>
          <figure className={`${styles.print} ${styles.p2}`}>
            <Image
              src={pourover}
              alt="Пуровер на стойке в мастерской"
              sizes="(min-width: 900px) 280px, (min-width: 600px) 240px, 46vw"
              loading="eager"
            />
            <figcaption>пробуем каждую партию</figcaption>
          </figure>
          <div
            className={styles.stamp}
            role="img"
            aria-label={`Ближайшая обжарка ${formatDay(roast)}`}
          >
            <span>обжарка</span>
            <b>{day}</b>
            <span>{month}</span>
          </div>
          <div className={styles.note} aria-hidden="true">
            <span className="hand">партия всего 5 кг, поэтому свежая</span>
            <svg width="54" height="50" viewBox="0 0 54 50">
              <path
                d="M3 42 C 20 44, 36 36, 40 9 M33 15 L40.5 7.5 L47 16"
                stroke="currentColor"
                strokeWidth="2.4"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
