"use client";

import { ErrorScreen } from "@/components/ui/ErrorScreen";
import { SHOP_PHONE, SHOP_PHONE_DISPLAY } from "@/lib/contacts";
import { caveat, commissioner, literata, literataItalic } from "./fonts";
import "./globals.css";

const fontVars = [literata, literataItalic, commissioner, caveat].map((f) => f.variable).join(" ");

export default function GlobalError({ retry }: { error: unknown; retry: () => void }) {
  return (
    <html lang="ru" className={fontVars}>
      <body>
        <title>Ошибка · Кварта</title>
        <main>
          <ErrorScreen
            title="Сайт не загрузился"
            text="У нас что-то сломалось. Попробуйте обновить страницу или позвоните, примем заказ по телефону."
          >
            <button className="btn" type="button" onClick={() => retry()}>
              Обновить
            </button>
            <a className="btn btn-line" href={`tel:${SHOP_PHONE}`}>
              {SHOP_PHONE_DISPLAY}
            </a>
          </ErrorScreen>
        </main>
      </body>
    </html>
  );
}
