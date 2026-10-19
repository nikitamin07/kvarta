import type { ReactNode } from "react";
import styles from "./deco.module.css";

const CREASE = "M0 -36 C -9 -18, 9 -6, 0 8 C -7 20, 2 30, 0 36";

function Bean({ x, y, size = 1, rot = 0 }: { x: number; y: number; size?: number; rot?: number }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${size})`}>
      <ellipse rx="26" ry="38" />
      <path d={CREASE} />
    </g>
  );
}

const LEAF = "M0 0 C 14 -15, 42 -16, 62 0 C 42 16, 14 15, 0 0 Z M0 0 L54 0";

function Leaf({ x, y, rot }: { x: number; y: number; rot: number }) {
  return <path transform={`translate(${x} ${y}) rotate(${rot})`} d={LEAF} />;
}

function Cherry({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <circle r="9" />
      <path d="M-2 -3 Q 0 -6 3 -4" />
    </g>
  );
}

const SHAPES = {
  bean: <Bean x={100} y={100} size={2} rot={-24} />,
  beans: (
    <>
      <Bean x={62} y={70} rot={-30} />
      <Bean x={132} y={92} size={1.2} rot={18} />
      <Bean x={84} y={146} size={0.9} rot={70} />
    </>
  ),
  branch: (
    <>
      <path d="M14 190 C 52 150, 92 118, 186 18" />
      <Leaf x={52} y={152} rot={-150} />
      <Leaf x={74} y={132} rot={-20} />
      <Leaf x={112} y={96} rot={-160} />
      <Leaf x={134} y={72} rot={-30} />
      <Leaf x={166} y={38} rot={-120} />
      <Cherry x={92} y={126} />
      <Cherry x={102} y={138} />
      <Cherry x={150} y={66} />
    </>
  ),
  steam: (
    <>
      <path d="M58 188 C 34 156, 82 134, 58 102 C 34 70, 82 48, 58 14" />
      <path d="M100 188 C 76 150, 124 128, 100 92 C 76 58, 124 38, 100 6" />
      <path d="M142 188 C 118 156, 166 134, 142 102 C 118 70, 166 48, 142 14" />
    </>
  ),
  cup: (
    <>
      <circle cx="96" cy="104" r="78" />
      <circle cx="96" cy="104" r="52" />
      <circle cx="96" cy="104" r="42" />
      <path d="M146 88 C 186 80, 190 128, 146 120" />
      <path d="M78 92 C 92 80, 112 84, 108 102 C 104 118, 82 116, 86 104" />
    </>
  ),
} satisfies Record<string, ReactNode>;

export type DecoKind = keyof typeof SHAPES;

type Props = { kind: DecoKind; side: "left" | "right"; at?: "top" | "middle" | "bottom" };

export function Deco({ kind, side, at = "top" }: Props) {
  return (
    <svg
      className={`${styles.deco} ${styles[side]} ${styles[at]}`}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      {SHAPES[kind]}
    </svg>
  );
}
