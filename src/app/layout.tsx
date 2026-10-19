import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
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
import { caveat, commissioner, literata, literataItalic } from "./fonts";
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

const fontVars = [literata, literataItalic, commissioner, caveat].map((f) => f.variable).join(" ");

// до прокрутки к якорю
const ANCHOR_SCRIPT = `if (location.hash) {
  const html = document.documentElement;
  html.dataset.anchor = "";
  const done = () => delete html.dataset.anchor;
  addEventListener("pointerdown", done, { once: true });
  addEventListener("keydown", done, { once: true });
}`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  await connection();
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <html lang="ru" className={fontVars} id="top" data-scroll-behavior="smooth">
      <head>
        <script nonce={nonce} dangerouslySetInnerHTML={{ __html: ANCHOR_SCRIPT }} />
      </head>
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
