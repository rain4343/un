import { getTranslations, setRequestLocale } from "next-intl/server";
import { isAppLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { KindergartenDirectory } from "@/components/sites/kindergarten-directory";

export default async function KindergartensPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("sites");

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-heading">
          {t("title")}
        </h1>
        <p className="mt-2 text-muted-foreground">{t("intro")}</p>
      </header>
      <KindergartenDirectory />
    </div>
  );
}
