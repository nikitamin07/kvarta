import { SUBSCRIPTION } from "@/lib/catalog";
import styles from "./sub.module.css";
import { SubActions, SubPicked } from "./SubCoupon";
import { Deco } from "@/components/ui/Deco";

export function Sub() {
  return (
    <section className="sec" id="k-sub" aria-labelledby="k-sub-h">
      <Deco kind="branch" side="left" at="middle" />
      <div className="wrap">
        <div className={styles.coupon}>
          <div className={styles.main}>
            <h2 id="k-sub-h">Подписка: кофе приходит сам</h2>
            <p>
              Две пачки по 250 г раз в месяц из свежей обжарки. Сорта можно менять перед каждой
              поставкой.
            </p>
            <SubPicked />
          </div>
          <div className={styles.side}>
            <p className={styles.price}>
              {SUBSCRIPTION.price} BYN<small>в месяц, доставка бесплатно</small>
            </p>
            <SubActions />
          </div>
        </div>
      </div>
    </section>
  );
}
