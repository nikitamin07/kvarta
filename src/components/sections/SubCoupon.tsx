"use client";

import { useRef } from "react";
import { useOrder } from "@/context/OrderProvider";
import { SUBSCRIPTION, findProduct } from "@/lib/catalog";
import styles from "./sub.module.css";
import { SubModal } from "./SubModal";

export function SubPicked() {
  const { subs } = useOrder();
  if (!subs.length) return null;
  return (
    <ul className={styles.picked} aria-label="Выбранные пачки">
      {subs.map((id, i) => (
        <li key={i}>{findProduct(id)!.short}</li>
      ))}
    </ul>
  );
}

export function SubActions() {
  const { subs, toForm } = useOrder();
  const dialog = useRef<HTMLDialogElement>(null);
  const ready = subs.length === SUBSCRIPTION.packs;

  return (
    <>
      <button
        className="btn"
        type="button"
        aria-haspopup="dialog"
        onClick={() => dialog.current?.showModal()}
      >
        {ready ? "Изменить пачки" : "Выбрать две пачки"}
      </button>
      {ready && (
        <a className={styles.link} href="#k-lead" onClick={() => toForm("subscription")}>
          Перейти к заявке
        </a>
      )}
      <SubModal ref={dialog} />
    </>
  );
}
