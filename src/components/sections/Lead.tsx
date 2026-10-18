import { PourCup } from "@/components/ui/PourCup";
import styles from "./lead.module.css";
import { LeadForm } from "./LeadForm";

export function Lead() {
  return (
    <section className="sec light" id="k-lead" aria-labelledby="k-lead-h">
      <div className={`wrap ${styles.grid}`}>
        <div>
          <h2 id="k-lead-h">Оставьте заявку</h2>
          <p className={styles.lede}>
            Два коротких шага. Перезвоним, уточним детали, оплата при получении.
          </p>
          <PourCup className={styles.cup} />
        </div>
        <LeadForm />
      </div>
    </section>
  );
}
