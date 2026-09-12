"use client";

import { useTranslations } from "next-intl";

export function UnicefCareScene() {
  const t = useTranslations("dashboard");

  return (
    <section className="flex flex-col gap-6" aria-label={t("careTitle")}>
      <div className="relative overflow-hidden rounded-[32px] bg-[linear-gradient(145deg,#000c22_0%,#002f6c_38%,#0a6aa8_72%,#1cabe2_100%)] px-5 py-8 text-white shadow-[0_30px_80px_rgba(0,47,108,0.28)] sm:px-8 sm:py-10">
        <div className="pointer-events-none absolute -start-10 top-0 h-56 w-56 rounded-full bg-unicef/30 blur-3xl" />
        <div className="pointer-events-none absolute -end-8 bottom-0 h-48 w-48 rounded-full bg-gold/25 blur-3xl" />
        <div className="relative mx-auto flex max-w-3xl flex-col items-center text-center">
          <div className="flex flex-wrap justify-center gap-2">
            {[
                ["🧸", t("careChipPlay")],
                ["📖", t("careChipLearn")],
                ["🛡️", t("careChipProtect")],
                ["💧", t("careChipWash")],
            ].map(([emoji, label]) => (
              <span
                key={label}
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/8 px-3 py-1.5 text-sm font-semibold"
              >
                <span aria-hidden className="text-base">
                  {emoji}
                </span>
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
