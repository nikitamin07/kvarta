"use client";

import { Stepper } from "@/components/ui/Stepper";
import { useOrder } from "@/context/OrderProvider";
import { CATALOG } from "@/lib/catalog";
import { deliveryNote, lineLabel, priceOrder } from "@/lib/order";
import styles from "./build.module.css";

const BEANS = [1, 2, 3, 4, 5];

export function BuildOrder({ roastDay }: { roastDay: string }) {
  const { qty, changeQty } = useOrder();
  const { lines, total } = priceOrder(CATALOG.map((p) => ({ id: p.id, qty: qty[p.id] })));

  return (
    <div className={styles.grid}>
      <div className={styles.items}>
        {CATALOG.map((p) => (
          <div key={p.id} className={qty[p.id] ? `${styles.item} ${styles.on}` : styles.item}>
            <div className={styles.info}>
              <h3>{p.name}</h3>
              <p className={styles.notes}>{p.notes}</p>
              <p className={styles.price}>
                {p.price} BYN <span className={styles.unit}>за {p.unit}</span>
              </p>
            </div>
            <Stepper name={p.name} qty={qty[p.id]} onChange={(d) => changeQty(p.id, d)} />
          </div>
        ))}
      </div>
      <aside className={styles.receipt} aria-label="Ваш заказ">
        <h3>Ваш заказ</h3>
        <p className={`hand ${styles.note}`}>
          {lines.length ? `жарим в четверг, ${roastDay}` : "здесь появится ваш заказ"}
        </p>
        {lines.length ? (
          <ul className={styles.lines}>
            {lines.map((l) => (
              <li key={l.product.id}>
                <span>{lineLabel(l)}</span>
                <span className={styles.dots} aria-hidden="true" />
                <span>{l.sum} BYN</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className={styles.empty}>Пока пусто. Нажмите плюс у сорта, и он появится здесь.</p>
        )}
        <div className={styles.total}>
          <span>Итого</span>
          <span>{total} BYN</span>
        </div>
        <div className={styles.beans} aria-hidden="true">
          {BEANS.map((i) => (
            <span
              key={i}
              className={total >= i * 10 ? `${styles.bean} ${styles.full}` : styles.bean}
            />
          ))}
        </div>
        <p className={styles.free}>{deliveryNote(total)}</p>
        <a className={`btn ${styles.toForm}`} href="#k-lead">
          Перенести в заявку
        </a>
      </aside>
    </div>
  );
}
