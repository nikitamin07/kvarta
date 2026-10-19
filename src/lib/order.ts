import {
  CATALOG,
  FREE_DELIVERY_FROM,
  MAX_QTY,
  SUBSCRIPTION,
  findProduct,
  type Product,
  type ProductId,
} from "./catalog";

export type OrderItem = { id: ProductId; qty: number };
export type OrderLine = { product: Product; qty: number; sum: number };

export function priceOrder(items: readonly OrderItem[]): { lines: OrderLine[]; total: number } {
  const lines = CATALOG.flatMap((product) => {
    const qty = items.filter((i) => i.id === product.id).reduce((a, i) => a + i.qty, 0);
    return qty > 0 ? [{ product, qty, sum: product.price * qty }] : [];
  });
  return { lines, total: lines.reduce((a, l) => a + l.sum, 0) };
}

export function clampQty(qty: number): number {
  return Math.max(0, Math.min(MAX_QTY, qty));
}

export function deliveryNote(total: number): string {
  if (total === 0) return `Доставка бесплатно от ${FREE_DELIVERY_FROM} BYN`;
  const left = FREE_DELIVERY_FROM - total;
  return left > 0 ? `До бесплатной доставки ещё ${left} BYN` : "Доставка бесплатно";
}

export function lineLabel(line: OrderLine): string {
  return line.qty > 1 ? `${line.product.short} × ${line.qty}` : line.product.short;
}

export type SubSlots = (ProductId | null)[];

export const EMPTY_SLOTS: SubSlots = Array.from({ length: SUBSCRIPTION.packs }, () => null);

export function toSlots(subs: readonly ProductId[]): SubSlots {
  return EMPTY_SLOTS.map((_, i) => subs[i] ?? null);
}

export function putSub(slots: SubSlots, id: ProductId): SubSlots {
  const free = slots.indexOf(null);
  return free < 0 ? slots : slots.map((s, i) => (i === free ? id : s));
}

export function dropSub(slots: SubSlots, index: number): SubSlots {
  return slots.map((s, i) => (i === index ? null : s));
}

export function subsLabel(subs: readonly ProductId[]): string {
  const names = subs.map((id) => findProduct(id)!.short);
  return new Set(names).size === 1 ? `${names[0]} × ${SUBSCRIPTION.packs}` : names.join(" + ");
}
