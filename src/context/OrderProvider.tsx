"use client";

import { createContext, use, useState, type ReactNode } from "react";
import { CATALOG, type ProductId } from "@/lib/catalog";
import type { Interest } from "@/lib/lead";
import { EMPTY_SLOTS, clampQty, toSlots, type SubSlots } from "@/lib/order";

export type Qty = Record<ProductId, number>;
export type FormStep = 1 | 2;

type Order = {
  qty: Qty;
  changeQty: (id: ProductId, delta: number) => void;
  slots: SubSlots;
  setSlots: (slots: SubSlots) => void;
  subs: ProductId[];
  setSubs: (subs: ProductId[]) => void;
  interest: Interest;
  setInterest: (interest: Interest) => void;
  step: FormStep;
  setStep: (step: FormStep) => void;
  toForm: (interest: Interest) => void;
};

const EMPTY = Object.fromEntries(CATALOG.map((p) => [p.id, 0])) as Qty;

const OrderContext = createContext<Order | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [qty, setQty] = useState<Qty>(EMPTY);
  const [slots, setSlots] = useState<SubSlots>(EMPTY_SLOTS);
  const [interest, setInterest] = useState<Interest>("order");
  const [step, setStep] = useState<FormStep>(1);

  const changeQty = (id: ProductId, delta: number) =>
    setQty((q) => ({ ...q, [id]: clampQty(q[id] + delta) }));

  const subs = slots.filter((s) => s !== null);
  const setSubs = (list: ProductId[]) => setSlots(toSlots(list));

  const toForm = (next: Interest) => {
    setInterest(next);
    setStep(1);
  };

  return (
    <OrderContext
      value={{
        qty,
        changeQty,
        slots,
        setSlots,
        subs,
        setSubs,
        interest,
        setInterest,
        step,
        setStep,
        toForm,
      }}
    >
      {children}
    </OrderContext>
  );
}

export function useOrder(): Order {
  const order = use(OrderContext);
  if (!order) throw new Error("useOrder вне OrderProvider");
  return order;
}
