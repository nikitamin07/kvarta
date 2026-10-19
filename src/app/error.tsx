"use client";

import { ErrorScreen } from "@/components/ui/ErrorScreen";
import { SHOP_PHONE, SHOP_PHONE_DISPLAY } from "@/lib/contacts";

export default function ErrorPage({ retry }: { error: unknown; retry: () => void }) {
  return (
    <ErrorScreen
      title="Что-то пошло не так"
      text="Страница не загрузилась. Попробуйте ещё раз, а если не выйдет, позвоните нам."
    >
      <button className="btn" type="button" onClick={() => retry()}>
        Попробовать ещё раз
      </button>
      <a className="btn btn-line" href={`tel:${SHOP_PHONE}`}>
        {SHOP_PHONE_DISPLAY}
      </a>
    </ErrorScreen>
  );
}
