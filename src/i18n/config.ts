export const locales = ["en", "ar", "ckb"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";

export const localeDirection: Record<AppLocale, "ltr" | "rtl"> = {
  en: "ltr",
  ar: "rtl",
  ckb: "rtl",
};

export function isAppLocale(value: string): value is AppLocale {
  return (locales as readonly string[]).includes(value);
}
