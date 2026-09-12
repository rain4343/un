import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@/i18n/routing";
import { FORM_CODES, FORM_TITLES } from "@/content/frameworks";
import type { AppLocale } from "@/i18n/config";
import { getTranslations } from "next-intl/server";

export async function FrameworkGrid({ locale }: { locale: AppLocale }) {
  const t = await getTranslations("dashboard");

  return (
    <section className="grid gap-5 lg:grid-cols-2">
      {FORM_CODES.map((code, index) => (
        <Link
          key={code}
          href={`/evaluations/${code === "FORM_1" ? "form-1" : "form-2"}`}
          className="group"
        >
          <Card className="h-full overflow-hidden transition-all duration-300 group-hover:-translate-y-1 group-hover:border-unicef/50 group-hover:shadow-[0_24px_60px_rgba(28,171,226,0.18)]">
            <div className="h-1.5 bg-gradient-to-r from-unicef via-[#7ed0f0] to-navy" />
            <CardContent className="flex flex-col gap-5 p-7 sm:p-8">
              <div className="flex items-center justify-between gap-3">
                <span className="rounded-full bg-unicef/10 px-3.5 py-1.5 text-sm font-bold tracking-wide text-unicef">
                  {code === "FORM_1" ? t("form1Badge") : t("form2Badge")}
                </span>
                <span className="text-4xl font-black text-heading/10">
                  0{index + 1}
                </span>
              </div>
              <h3 className="text-2xl font-bold leading-snug text-heading sm:text-3xl">
                {FORM_TITLES[code][locale]}
              </h3>
              <p className="text-base font-bold leading-8 text-heading/80 sm:text-lg sm:leading-8">
                {code === "FORM_1" ? t("form1Hint") : t("form2Hint")}
              </p>
              <p className="text-base font-bold text-unicef">
                {t("openForm")} →
              </p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </section>
  );
}
