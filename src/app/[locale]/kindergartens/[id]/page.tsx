import { getTranslations, setRequestLocale } from "next-intl/server";
import { isAppLocale } from "@/i18n/config";
import { notFound } from "next/navigation";
import { KindergartenEditor } from "@/components/sites/kindergarten-directory";

export default async function KindergartenDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!isAppLocale(locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations("sites");

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold tracking-tight text-heading">
        {t("editTitle")}
      </h1>
      <KindergartenEditor id={id} />
    </div>
  );
}
