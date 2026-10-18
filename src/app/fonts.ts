import { Caveat, Commissioner, Literata, Prata } from "next/font/google";

export const literata = Literata({
  subsets: ["latin", "cyrillic"],
  weight: "variable",
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-literata",
  display: "swap",
});

export const commissioner = Commissioner({
  subsets: ["latin", "cyrillic"],
  weight: "variable",
  variable: "--font-commissioner",
  display: "swap",
});

export const caveat = Caveat({
  subsets: ["latin", "cyrillic"],
  weight: "variable",
  variable: "--font-caveat",
  display: "swap",
  preload: false,
});

export const prata = Prata({
  subsets: ["latin", "cyrillic"],
  weight: "400",
  variable: "--font-prata",
  display: "swap",
  preload: false,
});
