import styles from "./build.module.css";
import { BuildOrder } from "./BuildOrder";

export function Build({ roastDay }: { roastDay: string }) {
  return (
    <section className="sec light" id="k-build" aria-labelledby="k-build-h">
      <div className="wrap">
        <div className={styles.head}>
          <h2 id="k-build-h">Соберите заказ</h2>
          <p className={`hand ${styles.headNote}`}>менеджер перезвонит и всё уточнит</p>
        </div>
        <BuildOrder roastDay={roastDay} />
      </div>
    </section>
  );
}
