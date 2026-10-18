"use client";

import { createContext, use, useState, type ReactNode } from "react";
import { CATALOG, type ProductId } from "@/lib/catalog";
import { clampQty } from "@/lib/order";

export type Qty = Record<ProductId, number>;

type Order = {
  qty: Qty;
  changeQty: (id: ProductId, delta: number) => void;
};

const EMPTY = Object.fromEntries(CATALOG.map((p) => [p.id, 0])) as Qty;

const OrderContext = createContext<Order | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [qty, setQty] = useState<Qty>(EMPTY);

  const changeQty = (id: ProductId, delta: number) =>
    setQty((q) => ({ ...q, [id]: clampQty(q[id] + delta) }));

  return <OrderContext value={{ qty, changeQty }}>{children}</OrderContext>;
}

export function useOrder(): Order {
  const order = use(OrderContext);
  if (!order) throw new Error("useOrder вне OrderProvider");
  return order;
}
