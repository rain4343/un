"use client";

import { useTranslations } from "next-intl";
import { UnicefLogo } from "@/components/brand/unicef-logo";

type PartnerMarksProps = {
  variant?: "full" | "compact";
};

export function EuFlag({ className }: { className?: string }) {
  const t = useTranslations("app");
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/eu-flag.png"
      alt={t("euFlag")}
      className={className ?? "h-11 w-auto rounded-lg object-cover"}
    />
  );
}

export function PartnerMarks({ variant = "full" }: PartnerMarksProps) {
  const euClass =
    variant === "compact"
      ? "h-8 w-auto rounded-md object-cover"
      : "h-11 w-auto rounded-lg object-cover";
  const unicefClass =
    variant === "compact" ? "h-8 w-auto rounded-md" : undefined;

  return (
    <span className="inline-flex items-center gap-2">
      <UnicefLogo variant={variant} className={unicefClass} />
      <EuFlag className={euClass} />
    </span>
  );
}
