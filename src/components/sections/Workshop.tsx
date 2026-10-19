import { MAPS_URL, ROUTE_URL, SHOP_ADDRESS, SHOP_PHONE } from "@/lib/contacts";
import type { MinskNow } from "@/lib/schedule";
import { ShopHours } from "./ShopHours";
import styles from "./workshop.module.css";
import { Deco } from "@/components/ui/Deco";

function MapScheme() {
  return (
    <svg viewBox="0 0 400 300" aria-hidden="true" preserveAspectRatio="xMidYMid slice">
      <rect className={styles.ground} width="400" height="300" />
      <path
        className={styles.river}
        d="M-20 230 C 60 200, 120 250, 200 220 C 280 190, 330 230, 420 200"
      />
      <g className={styles.roads}>
        <path d="M-10 120 L 410 90" strokeWidth="16" />
        <path d="M170 -10 L 200 310" strokeWidth="12" />
        <path d="M60 -10 L 110 310" strokeWidth="8" />
        <path d="M280 -10 L 300 310" strokeWidth="8" />
        <path d="M-10 40 L 410 20" strokeWidth="7" />
      </g>
      <g className={styles.blocks}>
        <rect x="210" y="130" width="60" height="40" rx="4" />
        <rect x="110" y="140" width="50" height="50" rx="4" />
        <rect x="220" y="40" width="50" height="34" rx="4" />
      </g>
      <rect className={styles.park} x="320" y="110" width="60" height="60" rx="4" />
      <text className={styles.street} x="250" y="112" transform="rotate(-4 250 112)">
        ул. Короля
      </text>
      <circle className={styles.pulse} cx="190" cy="104" r="10" />
      <path
        className={styles.pin}
        d="M190 104 C 176 88, 176 72, 190 70 C 204 72, 204 88, 190 104 Z"
      />
      <circle className={styles.pinDot} cx="190" cy="80" r="5" />
    </svg>
  );
}

export function Workshop({ now }: { now: MinskNow }) {
  return (
    <section className="sec" id="k-map" aria-labelledby="k-map-h">
      <Deco kind="bean" side="right" at="bottom" />
      <div className={`wrap ${styles.grid}`}>
        <div className={styles.frame}>
          <div className={styles.frameIn}>
            <MapScheme />
            <span className={styles.tag}>мы здесь</span>
            <a className={styles.open} href={MAPS_URL} target="_blank" rel="noopener">
              Открыть в Яндекс Картах
            </a>
          </div>
        </div>
        <div className={styles.place}>
          <h2 id="k-map-h">Мастерская на Короля</h2>
          <p className={styles.addr}>
            {SHOP_ADDRESS}
            <small>Самовывоз и чашка кофе на месте</small>
          </p>
          <ShopHours now={now} />
          <div className={styles.cta}>
            <a className="btn" href={ROUTE_URL} target="_blank" rel="noopener">
              Построить маршрут
            </a>
            <a className="btn btn-line" href={`tel:${SHOP_PHONE}`}>
              Позвонить
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
