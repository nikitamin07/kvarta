import styles from "./fresh.module.css";
import { FreshMeter } from "./FreshMeter";

export function Fresh({ today }: { today: string }) {
  return (
    <section className="sec light" aria-labelledby="k-fresh-h">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.head}>
          <h2 id="k-fresh-h" className={styles.h}>
            Свежесть решает вкус
          </h2>
          <p className={styles.sub}>Сколько дней назад обжарили ваш кофе?</p>
        </div>
        <FreshMeter today={today} />
      </div>
    </section>
  );
}
