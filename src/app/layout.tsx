import type { Metadata, Viewport } from "next";
import { connection } from "next/server";
import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import {
  OPEN_GRAPH,
  SITE_DESCRIPTION,
  SITE_INDEXING,
  SITE_NAME,
  SITE_TITLE,
  SITE_URL,
} from "@/lib/site";
import { caveat, commissioner, literata, prata } from "./fonts";
import "./globals.css";

// nonce в csp требует рендера на запрос
export const instant = false;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_TITLE, template: `%s · ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
  robots: { index: SITE_INDEXING, follow: SITE_INDEXING },
  openGraph: OPEN_GRAPH,
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  // цвет фона вне токенов css
  themeColor: "#131c18",
};

const fontVars = [literata, commissioner, caveat, prata].map((f) => f.variable).join(" ");

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  return (
    <html lang="ru" className={fontVars} id="top" data-scroll-behavior="smooth">
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
