import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Кварта, обжарка кофе в Минске",
  description: "Маленькая мастерская в Минске. Обжариваем по четвергам, у вас зерно на 1–3 день.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
