"use client";

import { useTranslations } from "next-intl";
import { PartnerMarks } from "@/components/brand/partner-marks";

export function SiteFooter() {
  const t = useTranslations("app");

  return (
    <footer className="mt-auto border-t border-unicef/15 bg-navy text-white">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between lg:px-8">
        <div className="flex items-center gap-3">
          <PartnerMarks variant="compact" />
          <p className="text-sm text-white/80">{t("forEveryChild")}</p>
        </div>
      </div>
    </footer>
  );
}
