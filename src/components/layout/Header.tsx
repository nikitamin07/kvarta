import styles from "./header.module.css";

const NAV = [
  { href: "#k-build", label: "Разовый заказ" },
  { href: "#k-sub", label: "Подписка" },
  { href: "#k-map", label: "Мы на карте" },
];

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.inner}`}>
        <a className={styles.logo} href="#top">
          Кварта <span className={`hand ${styles.tagline}`}>жарим сами</span>
        </a>
        <nav className={styles.nav} aria-label="Разделы">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        <a className={`btn ${styles.cta}`} href="#k-lead">
          Оставить заявку
        </a>
      </div>
    </header>
  );
}
