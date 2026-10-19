import Link from "next/link";
import type { Metadata } from "next";
import { ErrorScreen } from "@/components/ui/ErrorScreen";

export const metadata: Metadata = { title: "Страница не найдена" };

export default function NotFound() {
  return (
    <ErrorScreen
      title="Такой страницы нет"
      text="Ссылка устарела или в адресе опечатка. Кофе от этого не остыл: всё нужное на главной."
    >
      <Link className="btn" href="/">
        На главную
      </Link>
    </ErrorScreen>
  );
}
