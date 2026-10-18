export type ProductId = "eth" | "col" | "bra" | "drip";

export type Product = {
  id: ProductId;
  name: string;
  short: string;
  notes: string;
  price: number;
  unit: string;
};

export const CATALOG: readonly Product[] = [
  {
    id: "eth",
    name: "Эфиопия Иргачеффе",
    short: "Эфиопия",
    notes: "цветы, бергамот, светлая обжарка",
    price: 32,
    unit: "250 г",
  },
  {
    id: "col",
    name: "Колумбия Уила",
    short: "Колумбия",
    notes: "карамель, красное яблоко",
    price: 29,
    unit: "250 г",
  },
  {
    id: "bra",
    name: "Бразилия Серрадо",
    short: "Бразилия",
    notes: "орех, шоколад, под эспрессо",
    price: 26,
    unit: "250 г",
  },
  {
    id: "drip",
    name: "Дрип-пакеты",
    short: "Дрипы",
    notes: "ассорти, 10 штук в коробке",
    price: 18,
    unit: "10 штук",
  },
];

export const SUBSCRIPTION = { price: 54, packs: 2 } as const;
export const SUBSCRIPTION_IDS: readonly ProductId[] = ["eth", "col", "bra"];
export const FREE_DELIVERY_FROM = 50;
export const MAX_QTY = 9;

export function findProduct(id: string): Product | undefined {
  return CATALOG.find((p) => p.id === id);
}
