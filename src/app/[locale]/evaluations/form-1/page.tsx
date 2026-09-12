import { getTranslations, setRequestLocale } from "next-intl/server";
import { isAppLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { FORM_TITLES } from "@/content/frameworks";
import { Form1Sections } from "@/components/evaluations/form-1-sections";

export default async function Form1Page({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("dashboard");

  return (
    <div className="flex flex-col gap-8">
      <header className="rounded-[24px] border border-border bg-card p-6 shadow-[0_18px_50px_rgba(0,47,108,0.08)] backdrop-blur-md sm:p-8">
        <p className="text-sm font-bold text-unicef">{t("form1Badge")}</p>
        <h1 className="mt-2 text-3xl font-bold leading-snug tracking-tight text-heading sm:text-4xl">
          {FORM_TITLES.FORM_1[locale]}
        </h1>
      </header>
      <Form1Sections locale={locale} />
    </div>
  );
}
