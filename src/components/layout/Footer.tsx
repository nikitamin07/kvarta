import { SHOP_PHONE, SHOP_PHONE_DISPLAY } from "@/lib/contacts";
import styles from "./footer.module.css";

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`wrap ${styles.inner}`}>
        <span>Обжарка «Кварта», Минск, с 2019 года</span>
        <span>
          ул. Короля, 9 · <a href={`tel:${SHOP_PHONE}`}>{SHOP_PHONE_DISPLAY}</a>
        </span>
      </div>
    </footer>
  );
}
