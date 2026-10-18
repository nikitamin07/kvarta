import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { caveat, commissioner, literata, prata } from "./fonts";
import "./globals.css";

// nonce в csp требует рендера на запрос
export const instant = false;

export const metadata: Metadata = {
  title: "Кварта, обжарка кофе в Минске",
  description: "Маленькая мастерская в Минске. Обжариваем по четвергам, у вас зерно на 1–3 день.",
};

export const viewport: Viewport = {
  // цвет фона вне токенов css
  themeColor: "#131c18",
};

const fontVars = [literata, commissioner, caveat, prata].map((f) => f.variable).join(" ");

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  return (
    <html lang="ru" className={fontVars} id="top">
      <body>
        <a className="skip" href="#main">
          К содержимому
        </a>
        <Header />
        <main id="main" tabIndex={-1}>
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
