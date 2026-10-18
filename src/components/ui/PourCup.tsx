"use client";

import { useEffect, useId, useRef, useState } from "react";
import styles from "./pourCup.module.css";

const CUP = "M74 128 L166 128 L160 186 Q156 200 140 200 L100 200 Q84 200 80 186 Z";
const TURKA =
  "M-2 -1 L3 1 L36 1 Q40 1 39 5 L33 17 C 41 30, 44 44, 42 54 Q41 60 35 60 L7 60 " +
  "Q1 60 0 54 C -2 44, 1 30, 9 17 L4 6 Z";

export function PourCup({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);
  const [play, setPlay] = useState(false);
  const id = useId();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        setPlay(true);
      },
      { threshold: 0.5 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cls = [styles.cup, play && styles.play, className].filter(Boolean).join(" ");
  return (
    <svg
      ref={ref}
      className={cls}
      viewBox="0 -42 320 282"
      role="img"
      aria-label="Кофе наливают из турки в чашку"
    >
      <defs>
        <linearGradient id={`${id}copper`} x1="0" x2="1" y1="0" y2="0">
          <stop className={styles.copper1} offset="0" />
          <stop className={styles.copper2} offset=".55" />
          <stop className={styles.copper3} offset="1" />
        </linearGradient>
        <clipPath id={`${id}clip`}>
          <path d={CUP} />
        </clipPath>
      </defs>
      <g transform="translate(118 46)">
        <g className={styles.turka}>
          <path className={styles.handle} d="M46 12 L94 -2" />
          <rect
            className={styles.ferrule}
            x="38"
            y="7"
            width="12"
            height="9"
            rx="2"
            transform="rotate(-16 44 11)"
          />
          <path className={styles.body} fill={`url(#${id}copper)`} d={TURKA} />
          <path className={styles.rim} d="M3 1 L38 1" />
          <path className={styles.shine} d="M10 26 C 6 36, 6 46, 9 54" />
        </g>
      </g>
      <path className={styles.stream} d="M118 50 L118 196" />
      <g transform="translate(120 208) scale(.84) translate(-120 -208)">
        <path className={styles.steam} d="M106 116 C 98 104, 114 96, 106 82" />
        <path className={`${styles.steam} ${styles.s2}`} d="M134 116 C 126 102, 142 94, 134 78" />
        <path className={styles.cupBody} d={CUP} />
        <g clipPath={`url(#${id}clip)`}>
          <g className={styles.fill}>
            <rect className={styles.coffee} x="40" y="136" width="160" height="80" />
            <rect className={styles.crema} x="40" y="133" width="160" height="8" />
            <path
              className={`${styles.wave} ${styles.crema}`}
              d="M40 128 Q 60 120 80 128 T 120 128 T 160 128 T 200 128 L200 141 L40 141 Z"
            />
          </g>
        </g>
        <circle className={`${styles.drop} ${styles.d1}`} cx="112" cy="146" r="3.5" />
        <circle className={`${styles.drop} ${styles.d2}`} cx="124" cy="146" r="3" />
        <circle className={`${styles.drop} ${styles.d3}`} cx="118" cy="144" r="2.5" />
        <path className={styles.line} d={CUP} />
        <path className={styles.line} d="M165 140 C 190 140, 189 170, 162.5 170" />
        <path className={styles.line} d="M46 208 Q 120 226 194 208" />
      </g>
    </svg>
  );
}
