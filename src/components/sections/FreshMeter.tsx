"use client";

import { useState } from "react";
import { plural } from "@/lib/format";
import { AGE_MAX, AGE_MIN, AGE_START, cloudOf, stageOf, verdictOf } from "@/lib/freshness";
import { addDays, formatDay } from "@/lib/schedule";
import styles from "./fresh.module.css";

export function FreshMeter({ today }: { today: string }) {
  const [age, setAge] = useState(AGE_START);
  const { words, gloss } = cloudOf(age);
  const stage = stageOf(age);
  const verdict = verdictOf(age);
  const ageWord = plural(age, "день", "дня", "дней");

  return (
    <>
      <div className={styles.viz}>
        <div
          className={styles.cloud}
          role="img"
          aria-label={`Вкусовые ноты кофе на ${age} день после обжарки: ${stage}`}
        >
          {words.map((w) => (
            <span
              key={w.label}
              className={`${styles.w} ${w.bad ? styles.bad : styles.good}`}
              style={{
                left: `${w.x}%`,
                top: `${w.y}%`,
                translate: `calc(-50% + ${w.dx.toFixed(1)}cqw) calc(-50% + ${w.dy.toFixed(1)}cqh)`,
                opacity: Number(w.opacity.toFixed(3)),
              }}
              aria-hidden="true"
            >
              <span>{w.label}</span>
            </span>
          ))}
          <svg viewBox="0 0 120 150" aria-hidden="true">
            <ellipse
              className={styles.bean}
              cx="60"
              cy="75"
              rx="44"
              ry="62"
              transform="rotate(-24 60 75)"
            />
            <path className={styles.crease} d="M38 26 C 70 54, 44 96, 82 124" />
            <ellipse
              className={styles.gloss}
              style={{ opacity: Number(gloss.toFixed(2)) }}
              cx="44"
              cy="58"
              rx="8"
              ry="16"
              transform="rotate(-24 44 58)"
            />
          </svg>
        </div>
        <p className={styles.stage}>{stage}</p>
      </div>

      <div className={styles.ctrl}>
        <div className={styles.ageRow}>
          <div className={styles.ageNum} aria-hidden="true">
            <b>{age}</b>
            <span>{ageWord}</span>
          </div>
          <p className="hand">обжарен {formatDay(addDays(today, -age))}</p>
        </div>
        <input
          className={styles.range}
          id="k-age"
          type="range"
          min={AGE_MIN}
          max={AGE_MAX}
          step={1}
          value={age}
          onChange={(e) => setAge(Number(e.target.value))}
          aria-label="Сколько дней назад обжарен кофе"
          aria-valuetext={`${age} ${ageWord}`}
        />
        <div className={styles.ticks} aria-hidden="true">
          <span>{AGE_MIN}</span>
          <span>30</span>
          <span>60</span>
          <span>{AGE_MAX}</span>
        </div>
        <div className={styles.verdict} aria-live="polite">
          <h3 className={styles[verdict.tone]}>{verdict.title}</h3>
          <p>{verdict.text}</p>
        </div>
      </div>
    </>
  );
}
