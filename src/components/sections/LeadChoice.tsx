"use client";

import type { Ref } from "react";
import { Stepper } from "@/components/ui/Stepper";
import { useOrder } from "@/context/OrderProvider";
import { CATALOG, SUBSCRIPTION_PRODUCTS, type ProductId } from "@/lib/catalog";
import { TEXT_MAX, type Interest } from "@/lib/lead";
import { deliveryNote } from "@/lib/order";
import styles from "./leadForm.module.css";
import { useSlideHeight } from "./useSlideHeight";

const INTERESTS: { id: Interest; label: string }[] = [
  { id: "order", label: "Разовый заказ" },
  { id: "subscription", label: "Подписка" },
  { id: "question", label: "Вопрос" },
];

type Props = {
  total: number;
  question: string;
  onQuestion: (value: string) => void;
  error: string;
  onPick: () => void;
  onNext: () => void;
  pickedRef: Ref<HTMLButtonElement>;
};

export function slide(index: number, active: number) {
  return {
    className: styles.fold,
    "data-pos": index < active ? "before" : index > active ? "after" : "current",
    inert: index !== active,
  };
}

function toggle(subs: ProductId[], id: ProductId): ProductId[] {
  return subs.includes(id) ? subs.filter((s) => s !== id) : [...subs, id].slice(-2);
}

export function LeadChoice({
  total,
  question,
  onQuestion,
  error,
  onPick,
  onNext,
  pickedRef,
}: Props) {
  const { qty, changeQty, subs, setSubs, interest, setInterest } = useOrder();
  const picked = new Set(subs);
  const active = INTERESTS.findIndex((o) => o.id === interest);
  const optionsRef = useSlideHeight<HTMLDivElement>(interest);
  const fold = (id: Interest) =>
    slide(
      INTERESTS.findIndex((o) => o.id === id),
      active,
    );

  return (
    <>
      <div className={styles.cards} role="group" aria-label="Что интересует">
        {INTERESTS.map((o) => (
          <button
            key={o.id}
            ref={interest === o.id ? pickedRef : undefined}
            type="button"
            className={styles.opt}
            aria-pressed={interest === o.id}
            onClick={() => {
              setInterest(o.id);
              onPick();
            }}
          >
            {o.label}
          </button>
        ))}
      </div>

      <div ref={optionsRef} className={styles.slides}>
        <div {...fold("order")}>
          <div className={styles.foldIn}>
            <div className={styles.panel}>
              <div className={styles.cells}>
                {CATALOG.map((p) => (
                  <div key={p.id} className={styles.cell}>
                    <div>
                      <b>{p.id === "drip" ? p.name : p.short}</b>
                      <span className={styles.rs}>
                        {p.price} BYN за {p.unit}
                      </span>
                    </div>
                    <Stepper
                      className={styles.cellStep}
                      name={p.name}
                      qty={qty[p.id]}
                      onChange={(d) => changeQty(p.id, d)}
                    />
                  </div>
                ))}
              </div>
              <div className={styles.sum}>
                <span>Итого {total} BYN</span>
                <small>{deliveryNote(total)}</small>
              </div>
            </div>
          </div>
        </div>

        <div {...fold("subscription")}>
          <div className={styles.foldIn}>
            <div className={styles.panel}>
              {SUBSCRIPTION_PRODUCTS.map((p) => {
                const on = picked.has(p.id);
                const off = !on && picked.size >= 2;
                return (
                  <label
                    key={p.id}
                    className={off ? `${styles.check} ${styles.dis}` : styles.check}
                  >
                    <input
                      type="checkbox"
                      checked={on}
                      disabled={off}
                      onChange={() => setSubs(toggle(subs, p.id))}
                    />
                    <b>{p.name}</b>
                    <span className={styles.rs}>{p.notes}</span>
                  </label>
                );
              })}
            </div>
            <p className={styles.note}>
              Две пачки в месяц. Отметите один сорт, привезём две пачки его.
            </p>
          </div>
        </div>

        <div {...fold("question")}>
          <div className={styles.foldIn}>
            <div className={styles.field}>
              <label className={styles.lbl} htmlFor="k-question">
                Ваш вопрос
              </label>
              <textarea
                className={styles.inp}
                id="k-question"
                maxLength={TEXT_MAX}
                placeholder="Например: какой сорт подойдёт для гейзерной кофеварки?"
                value={question}
                onChange={(e) => onQuestion(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <p className={styles.err} role="alert">
          {error}
        </p>
      )}
      <div>
        <button className="btn" type="button" onClick={onNext}>
          Дальше
        </button>
      </div>
    </>
  );
}
