import type { ReactNode } from "react";
import { PourCup } from "./PourCup";

type Props = { title: string; text: string; children: ReactNode };

export function ErrorScreen({ title, text, children }: Props) {
  return (
    <section className="error-screen" aria-labelledby="k-error-h">
      <div className="wrap error-grid">
        <PourCup className="error-cup" />
        <div>
          <h1 id="k-error-h">{title}</h1>
          <p className="error-text">{text}</p>
          <div className="error-actions">{children}</div>
        </div>
      </div>
    </section>
  );
}
