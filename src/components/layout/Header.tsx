import styles from "./header.module.css";

const NAV = [
  { href: "/#k-build", label: "Разовый заказ" },
  { href: "/#k-sub", label: "Подписка" },
  { href: "/#k-map", label: "Мы на карте" },
];

export function Header() {
  return (
    <header className={styles.header}>
      <div className={`wrap ${styles.inner}`}>
        {/* якорям нужна нативная ссылка */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className={styles.logo} href="/#top">
          Кварта <span className={`hand ${styles.tagline}`}>жарим сами</span>
        </a>
        <nav className={styles.nav} aria-label="Разделы">
          {NAV.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </nav>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a className={`btn ${styles.cta}`} href="/#k-lead">
          Оставить заявку
        </a>
      </div>
    </header>
  );
}
