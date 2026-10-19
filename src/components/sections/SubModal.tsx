"use client";

import { useRef, useState, type Ref } from "react";
import { useOrder } from "@/context/OrderProvider";
import { SUBSCRIPTION, SUBSCRIPTION_PRODUCTS, findProduct, type ProductId } from "@/lib/catalog";
import { dropSub, putSub, subsLabel } from "@/lib/order";
import styles from "./subModal.module.css";
import opt from "./subOptions.module.css";

const SLOTS = Array.from({ length: SUBSCRIPTION.packs }, (_, i) => i);
// смена имени анимации перезапускает её
const flip = (tick: number) => (tick % 2 ? "a" : "b");

export function SubModal({ ref }: { ref: Ref<HTMLDialogElement> }) {
  const { slots, setSlots, subs } = useOrder();
  const opts = useRef<HTMLDivElement>(null);
  const [moved, setMoved] = useState({ slots: [] as number[], shake: false, tick: 0 });
  const left = slots.filter((s) => s === null).length;

  const mark = (slots: number[], shake = false) =>
    setMoved((m) => ({ slots, shake, tick: m.tick + 1 }));

  function put(id: ProductId) {
    if (!left) return mark([], true);
    setSlots(putSub(slots, id));
    mark([slots.indexOf(null)]);
  }

  function drop(i: number) {
    setSlots(dropSub(slots, i));
    mark([i]);
    // слот опустел, фокус к сортам
    opts.current?.querySelector("button")?.focus();
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

        <div className={styles.slots} data-shake={moved.shake ? flip(moved.tick) : undefined}>
          {SLOTS.map((i) => {
            const id = slots[i];
            const p = id && findProduct(id);
            const anim = moved.slots.includes(i) ? flip(moved.tick) : undefined;
            return p ? (
              <button
                key={i}
                type="button"
                className={`${styles.slot} ${styles.filled}`}
                data-anim={anim}
                onClick={() => drop(i)}
              >
                <span className={styles.pack}>
                  <b>{p.short}</b>
                  {p.unit}
                </span>
                <small>Нажмите, чтобы убрать</small>
              </button>
            ) : (
              <div key={i} className={styles.slot} data-anim={anim}>
                <b>Пачка {i + 1}</b>
                <small>пока пустая</small>
              </div>
            );
          })}
        </div>

        <div ref={opts} className={opt.opts}>
          {SUBSCRIPTION_PRODUCTS.map((p) => {
            const count = subs.filter((id) => id === p.id).length;
            return (
              <button
                key={p.id}
                type="button"
                className={opt.opt}
                data-count={count}
                aria-disabled={!left && !count}
                onClick={() => put(p.id)}
              >
                <b>{p.name}</b>
                <span className={opt.marks} aria-hidden="true">
                  <i />
                  <i />
                </span>
                <span className={opt.notes}>{p.notes}</span>
              </button>
            );
          })}
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
