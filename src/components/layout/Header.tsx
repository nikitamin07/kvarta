import styles from "./header.module.css";

const NAV = [
  { href: "#k-build", label: "Зерно" },
  { href: "#k-sub", label: "Подписка" },
  { href: "#k-map", label: "Мастерская" },
  { href: "#k-lead", label: "Заявка" },
];

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.inner}`}>
        <a className={styles.logo} href="#top">
          Кварта <span className={`hand ${styles.tagline}`}>жарим по четвергам</span>
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
