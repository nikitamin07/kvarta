import { dayParts, type RoastWeek } from "@/lib/schedule";
import styles from "./week.module.css";
import { Deco } from "@/components/ui/Deco";

const CIRCLE =
  "M44 6 C 24 10, 6 22, 6 36 C 6 51, 30 59, 50 57 C 70 55, 82 45, 80 30 C 78 16, 60 10, 44 10.5 " +
  "C 36 10.8, 29 7.5, 21 3.5";
const SQUIG =
  "M1.5 6.8 C 3.6 4.4, 6.4 3.6, 8.8 5.9 C 11.6 8.7, 14.4 9.9, 17.6 6.9 C 20 4.5, 21.8 2.3, 25.6 4.9 " +
  "C 28.8 7.3, 31.2 10.6, 35 7.8 C 37.6 5.8, 39.2 4.6, 42 6.3 C 44.6 7.9, 47.4 8.6, 50 6.6 " +
  "C 52 5.1, 54.4 5.4, 58.5 6.2";

export function Week({ week }: { week: RoastWeek }) {
  return (
    <section className="sec light" aria-labelledby="k-week-h">
      <Deco kind="steam" side="right" />
      <div className="wrap">
        <h2 id="k-week-h">Неделя в мастерской</h2>
        <ol className={styles.cal}>
          {week.days.map((d) => (
            <li
              key={d.iso}
              className={[
                styles.day,
                d.roast && styles.hot,
                d.ship && styles.ship,
                d.today && styles.today,
              ]
                .filter(Boolean)
                .join(" ")}
              aria-current={d.today ? "date" : undefined}
            >
              <p className={styles.name}>{d.name}</p>
              <p className={styles.num}>{dayParts(d.iso).day}</p>
              <p className={styles.text}>{d.text}</p>
              {d.roast && (
                <svg
                  className={styles.circle}
                  viewBox="0 0 84 62"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path vectorEffect="non-scaling-stroke" d={CIRCLE} />
                </svg>
              )}
              {d.ship && (
                <svg
                  className={styles.squig}
                  viewBox="0 0 60 12"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  <path vectorEffect="non-scaling-stroke" d={SQUIG} />
                </svg>
              )}
            </li>
          ))}
        </ol>
        <p className={`hand ${styles.note}`}>{week.note}</p>
      </div>
    </section>
  );
}
