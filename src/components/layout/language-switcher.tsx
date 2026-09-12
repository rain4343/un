"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/routing";
import { locales, type AppLocale } from "@/i18n/config";
import { cn } from "@/lib/utils";

export function LanguageSwitcher({
  variant = "default",
}: {
  variant?: "default" | "sidebar";
}) {
  const t = useTranslations("language");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const pathname = usePathname();
  const sidebar = variant === "sidebar";

  return (
    <div
      className={cn(
        "flex rounded-2xl p-1",
        sidebar
          ? "w-full flex-col gap-1 bg-white/10"
          : "inline-flex border border-unicef/20 bg-white/80 shadow-sm",
      )}
      role="group"
      aria-label={t("label")}
    >
      {locales.map((code) => (
        <button
          key={code}
          type="button"
          className={cn(
            "rounded-xl px-3 py-2 font-extrabold transition-all",
            sidebar ? "w-full text-start text-sm" : "text-xs",
            locale === code
              ? sidebar
                ? "bg-gold text-navy shadow"
                : "bg-unicef text-white shadow"
              : sidebar
                ? "text-white/75 hover:bg-white/10 hover:text-white"
                : "text-navy/70 hover:text-navy",
          )}
          onClick={() => router.replace(pathname, { locale: code })}
        >
          {t(code)}
        </button>
      ))}
    </div>
  );
}
