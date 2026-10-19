import localFont from "next/font/local";

// урезаны скриптом scripts/subset-fonts.py
export const literata = localFont({
  src: "../assets/fonts/literata.woff2",
  weight: "400 600",
  variable: "--font-literata",
  display: "swap",
  adjustFontFallback: "Times New Roman",
});

export const literataItalic = localFont({
  src: "../assets/fonts/literata-italic.woff2",
  weight: "400",
  style: "italic",
  variable: "--font-literata-italic",
  display: "swap",
  preload: false,
  adjustFontFallback: "Times New Roman",
});

export const commissioner = localFont({
  src: "../assets/fonts/commissioner.woff2",
  weight: "400 600",
  variable: "--font-commissioner",
  display: "swap",
  preload: false,
});

export const caveat = localFont({
  src: "../assets/fonts/caveat.woff2",
  weight: "500",
  variable: "--font-caveat",
  display: "swap",
  preload: false,
});
