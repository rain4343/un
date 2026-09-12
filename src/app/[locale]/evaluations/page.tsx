import { getTranslations, setRequestLocale } from "next-intl/server";
import { isAppLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { FrameworkGrid } from "@/components/dashboard/framework-grid";
import { itemsBySection } from "@/content/frameworks";

export default async function EvaluationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations();
  const sectionCount = itemsBySection().length;

  return (
    <div className="flex flex-col gap-8">
      <header className="rounded-[24px] border border-border bg-card p-6 shadow-[0_18px_50px_rgba(0,47,108,0.08)] backdrop-blur-md sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-unicef">
          UNICEF
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight text-heading sm:text-4xl">
          {t("nav.evaluations")}
        </h1>
        <p className="mt-4 max-w-3xl text-lg font-bold leading-8 text-heading sm:text-xl sm:leading-9">
          {t("forms.intro", { sections: sectionCount })}
        </p>
      </header>
      <FrameworkGrid locale={locale} />
    </div>
  );
}
