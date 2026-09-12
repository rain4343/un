"use client";

import { useEffect, useState } from "react";
import { FORM_2_FIELDS } from "@/content/frameworks/form-2";
import { SECTION_TITLES } from "@/content/frameworks/form-1";
import { FORM_SECTIONS, type FormSectionId } from "@/content/frameworks/types";
import type { AppLocale } from "@/i18n/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { usePlatform } from "@/components/platform/platform-provider";
import { kindergartenLabel, latestSubmission } from "@/lib/platform-store";
import { canSubmitForm } from "@/lib/rbac";

type Plan = Record<string, string>;

export function Form2Sections({ locale }: { locale: AppLocale }) {
  const t = useTranslations("forms");
  const { currentUser, myKindergartens, saveSubmission, state } = usePlatform();
  const readOnly = !currentUser || !canSubmitForm(currentUser.role, "FORM_2");
  const [kindergartenId, setKindergartenId] = useState(
    myKindergartens[0]?.id ?? "",
  );
  const [step, setStep] = useState(0);
  const [plans, setPlans] = useState<Record<string, Plan>>({});
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!kindergartenId && myKindergartens[0]) {
      setKindergartenId(myKindergartens[0].id);
    }
  }, [kindergartenId, myKindergartens]);

  useEffect(() => {
    if (!kindergartenId) {
      return;
    }
    const saved = latestSubmission(state.submissions, kindergartenId, "FORM_2");
    setPlans(saved?.form2Plans ?? {});
    setSaved(false);
  }, [kindergartenId, state.submissions]);
  const section = FORM_SECTIONS[step] as FormSectionId;
  const values = plans[section] ?? {};

  function patch(field: string, value: string) {
    if (readOnly) {
      return;
    }
    setSaved(false);
    setPlans((current) => ({
      ...current,
      [section]: { ...current[section], [field]: value },
    }));
  }

  return (
    <div className="flex flex-col gap-6">
      {readOnly ? (
        <p className="text-base font-bold text-heading">{t("readOnly")}</p>
      ) : null}
      {myKindergartens.length > 0 ? (
        <label className="flex max-w-md flex-col gap-2">
          <span className="text-base font-bold text-heading">{t("kindergarten")}</span>
          <select
            value={kindergartenId}
            onChange={(event) => setKindergartenId(event.target.value)}
            className="h-12 rounded-xl border border-unicef/20 bg-background px-3 text-base font-bold text-foreground"
          >
            {myKindergartens.map((site) => (
              <option key={site.id} value={site.id}>
                {kindergartenLabel(site, locale)}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <ol className="flex flex-wrap gap-2" aria-label={t("steps")}>
        {FORM_SECTIONS.map((id, index) => (
          <li key={id}>
            <button
              type="button"
              className={`rounded-full border px-4 py-2 text-base font-bold transition-all ${
                index === step
                  ? "border-unicef bg-unicef text-white shadow"
                  : "border-unicef/20 bg-muted text-heading hover:border-unicef"
              }`}
              aria-current={index === step ? "step" : undefined}
              onClick={() => setStep(index)}
            >
              {index + 1}. {SECTION_TITLES[id][locale]}
            </button>
          </li>
        ))}
      </ol>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl font-bold sm:text-3xl">
            {SECTION_TITLES[section][locale]}
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-6">
          {FORM_2_FIELDS.map((field) => (
            <label
              key={field.id}
              className="flex flex-col gap-2 rounded-2xl border border-unicef/15 bg-muted/40 p-4 sm:p-5"
            >
              <span className="text-lg font-bold leading-8 text-heading sm:text-xl sm:leading-9">
                {field.prompt[locale]}
              </span>
              <textarea
                name={`${section}.${field.id}`}
                rows={3}
                readOnly={readOnly}
                disabled={readOnly}
                className="w-full rounded-xl border border-unicef/20 bg-background px-3 py-2 text-base font-semibold text-foreground outline-none ring-unicef/30 focus:ring-2"
                value={values[field.id] ?? ""}
                onChange={(event) => patch(field.id, event.target.value)}
              />
            </label>
          ))}
        </CardContent>
      </Card>
      {saved ? (
        <p className="text-lg font-bold text-heading">{t("planSaved")}</p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          disabled={step === 0}
          onClick={() => setStep((current) => Math.max(0, current - 1))}
        >
          {t("back")}
        </Button>
        {step < FORM_SECTIONS.length - 1 ? (
          <Button
            type="button"
            onClick={() => setStep((current) => current + 1)}
          >
            {readOnly ? t("continue") : t("next")}
          </Button>
        ) : readOnly ? null : (
          <Button
            type="button"
            onClick={() => {
              if (kindergartenId) {
                saveSubmission({
                  kindergartenId,
                  formCode: "FORM_2",
                  form2Plans: plans,
                });
              }
              setSaved(true);
            }}
          >
            {t("submit")}
          </Button>
        )}
      </div>
    </div>
  );
}
