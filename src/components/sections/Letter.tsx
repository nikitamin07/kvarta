import Image from "next/image";
import tools from "@/assets/tools.jpg";
import styles from "./letter.module.css";

export function Letter() {
  return (
    <section className="sec" aria-labelledby="k-letter-h">
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.inner}>
          <h2 id="k-letter-h" className={styles.h}>
            Почему мы жарим сами
          </h2>
          <div className={styles.text}>
            <p>
              Мы много лет простояли за баром и видели, как отличное зерно месяцами ждёт на складе и
              теряет вкус.
            </p>
            <p>
              В 2019-м купили небольшой ростер. Он берёт 5 кг за раз, поэтому жарим немного и только
              под заявки.
            </p>
            <p>Заходите на Короля, 9: покажем, как всё устроено, и сварим чашку.</p>
          </div>
          <p className={styles.sign}>Аня и Дмитрий</p>
        </div>
        <figure className={styles.photo}>
          <Image
            src={tools}
            alt="Холдеры, молотый кофе и зерно на деревянной доске"
            sizes="(min-width: 900px) 460px, 340px"
          />
          <figcaption>наш стол в четверг утром</figcaption>
        </figure>
      </div>
    </section>
  );
}
