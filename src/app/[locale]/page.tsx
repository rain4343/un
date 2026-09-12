import { getTranslations, setRequestLocale } from "next-intl/server";
import { isAppLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { StatCard } from "@/components/dashboard/stat-card";
import { UnicefCareScene } from "@/components/dashboard/unicef-care-scene";
import { PartnerMarks } from "@/components/brand/partner-marks";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    notFound();
  }
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <div className="flex flex-col gap-8">
      <section className="relative overflow-hidden rounded-[28px] bg-navy px-6 py-12 text-white shadow-[0_30px_80px_rgba(0,47,108,0.28)] sm:px-10 sm:py-16">
        <div className="pointer-events-none absolute -start-16 -top-20 h-64 w-64 rounded-full bg-unicef/30 blur-3xl" />
        <div className="pointer-events-none absolute -end-10 bottom-0 h-48 w-48 rounded-full bg-gold/20 blur-3xl" />
        <div className="relative mx-auto flex max-w-4xl flex-col items-center text-center">
          <div className="mb-7">
            <PartnerMarks />
          </div>
          <p className="text-[11px] font-bold uppercase tracking-[0.42em] text-unicef">
            ECE
          </p>
          <h1 className="mt-4 text-balance text-2xl font-extrabold leading-snug tracking-tight sm:text-4xl sm:leading-tight">
            {t("app.shortName")}
          </h1>
          <div className="mt-6 h-px w-28 bg-gradient-to-r from-transparent via-[#ffc20e] to-transparent" />
          <p className="mt-5 text-sm font-medium tracking-wide text-white/70">
            {t("app.forEveryChild")}
          </p>
        </div>
      </section>
      <UnicefCareScene />
      <section className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label={t("dashboard.frameworks")}
          value="2"
          hint={t("dashboard.formsHint")}
        />
        <StatCard
          label={t("dashboard.coverage")}
          value="8"
          hint={t("dashboard.sectionsHint")}
        />
      </section>
    </div>
  );
}
