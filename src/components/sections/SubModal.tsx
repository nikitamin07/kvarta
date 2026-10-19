"use client";

import { useRef, useState, type Ref } from "react";
import { useOrder } from "@/context/OrderProvider";
import { SUBSCRIPTION, SUBSCRIPTION_PRODUCTS, findProduct, type ProductId } from "@/lib/catalog";
import { dropSub, putSub, subsLabel } from "@/lib/order";
import styles from "./subModal.module.css";

const SLOTS = Array.from({ length: SUBSCRIPTION.packs }, (_, i) => i);

export function SubModal({ ref }: { ref: Ref<HTMLDialogElement> }) {
  const { subs, setSubs } = useOrder();
  const opts = useRef<HTMLDivElement>(null);
  const [moved, setMoved] = useState({ slots: [] as number[], tick: 0 });
  const left = SUBSCRIPTION.packs - subs.length;

  const mark = (slots: number[]) => setMoved((m) => ({ slots, tick: m.tick + 1 }));

  function put(id: ProductId) {
    const next = putSub(subs, id);
    setSubs(next);
    mark(left > 0 ? [next.length - 1] : SLOTS);
  }

  function drop(i: number) {
    setSubs(dropSub(subs, i));
    mark(SLOTS.filter((s) => s >= i));
    // слот опустел, фокус к сортам
    if (subs.length - 1 <= i) opts.current?.querySelector("button")?.focus();
  }

  return (
    // с клавиатуры закрывает нативный escape
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <dialog
      ref={ref}
      className={styles.modal}
      aria-labelledby="k-modal-h"
      onClick={(e) => e.target === e.currentTarget && e.currentTarget.close()}
      onClose={() => mark([])}
    >
      <form method="dialog" className={styles.in}>
        <div className={styles.head}>
          <div>
            <h3 id="k-modal-h">Соберите свою пару</h3>
            <p className={`hand ${styles.hand}`}>можно две одинаковые</p>
          </div>
          <button className={styles.x} aria-label="Закрыть">
            ×
          </button>
        </div>

        <div className={styles.slots}>
          {SLOTS.map((i) => {
            const p = subs[i] && findProduct(subs[i]);
            // смена имени анимации перезапускает её
            const anim = moved.slots.includes(i) ? (moved.tick % 2 ? "a" : "b") : undefined;
            return p ? (
              <button
                key={i}
                type="button"
                className={`${styles.slot} ${styles.filled}`}
                data-anim={anim}
                onClick={() => drop(i)}
              >
                <b>{p.short}</b>
                <small>{p.unit}, нажмите, чтобы убрать</small>
              </button>
            ) : (
              <div key={i} className={styles.slot} data-anim={anim}>
                <b>Пачка {i + 1}</b>
                <small>пока пустая</small>
              </div>
            );
          })}
        </div>

        <div ref={opts} className={styles.opts}>
          {SUBSCRIPTION_PRODUCTS.map((p) => (
            <button key={p.id} type="button" className={styles.opt} onClick={() => put(p.id)}>
              <b>{p.name}</b>
              <i aria-hidden="true">
                <svg viewBox="0 0 16 16" width="14" height="14">
                  <path d="M8 2v12M2 8h12" />
                </svg>
              </i>
              <span>{p.notes}</span>
            </button>
          ))}
        </div>

        <div className={styles.foot}>
          <p aria-live="polite">
            {left > 0 ? `Осталось выбрать ${left}` : `Пара собрана: ${subsLabel(subs)}`}
          </p>
          <button className="btn" disabled={left > 0}>
            Готово
          </button>
        </div>
      </form>
    </dialog>
  );
}
