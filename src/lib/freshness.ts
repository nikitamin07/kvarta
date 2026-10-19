export const AGE_MIN = 1;
export const AGE_MAX = 120;
export const AGE_START = 45;

export type Tone = "rest" | "peak" | "fading" | "shelf";
export type Word = {
  label: string;
  bad: boolean;
  x: number;
  y: number;
  dx: number;
  dy: number;
  opacity: number;
};

const GOOD: [string, number, number][] = [
  ["бергамот", 18, 16],
  ["карамель", 76, 14],
  ["цветы", 9, 52],
  ["яблоко", 82, 50],
  ["шоколад", 22, 88],
  ["орех", 74, 88],
];
const BAD: [string, number, number][] = [
  ["картон", 50, 8],
  ["горечь", 14, 34],
  ["пыль", 86, 32],
];

const VERDICTS: { upTo: number; tone: Tone; title: string; text: string }[] = [
  {
    upTo: 3,
    tone: "rest",
    title: "Отдыхает после обжарки",
    text: "Столько едет зерно от нашего ростера до вашей кухни. Пара дней отдыха, и вкус раскроется полностью.",
  },
  {
    upTo: 30,
    tone: "peak",
    title: "Пик вкуса",
    text:
      "Аромат и сладость на максимуме, кислинка и горчинка в балансе. " +
      "Допивайте пачку в эти недели, пока вкус яркий.",
  },
  {
    upTo: 60,
    tone: "fading",
    title: "Уже выдыхается",
    text: "Вкус становится плоским, кислинка уходит в горечь. Так обычно и бывает с пачкой из магазина.",
  },
  {
    upTo: Infinity,
    tone: "shelf",
    title: "Так часто бывает на полке",
    text: "На многих пачках пишут срок годности на год, а не дату обжарки. Через пару месяцев кофе пахнет картоном.",
  },
];

function ease(age: number, from: number, to: number): number {
  const t = Math.max(0, Math.min(1, (age - from) / (to - from)));
  return t * t * (3 - 2 * t);
}

export function stageOf(age: number): string {
  if (age <= 3) return "аромат ещё раскрывается";
  if (age <= 30) return "всё на месте";
  if (age <= 60) return "ноты улетучиваются";
  return "остались только полка и картон";
}

export function verdictOf(age: number) {
  return VERDICTS.find((v) => age <= v.upTo)!;
}

// слова тянутся к центру и гаснут
export function cloudOf(age: number): { words: Word[]; gloss: number } {
  const good = 1 - 0.92 * ease(age, 25, 95);
  const pull = 0.22 - 0.4 * ease(age, 20, 110);
  const bad = ease(age, 50, 100);
  const word =
    (isBad: boolean, k: number, opacity: number) =>
    ([label, x, y]: [string, number, number]) => ({
      label,
      bad: isBad,
      x,
      y,
      dx: (50 - x) * k,
      dy: (50 - y) * k,
      opacity,
    });
  return {
    words: [...GOOD.map(word(false, pull, good)), ...BAD.map(word(true, 0, bad))],
    gloss: Math.max(0.1, good),
  };
}
