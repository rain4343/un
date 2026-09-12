"use client";

import { useEffect, useMemo, useState } from "react";
import { FORM_1_ITEMS, SECTION_TITLES } from "@/content/frameworks/form-1";
import {
  FORM_SECTIONS,
  type FormSectionId,
  type ScoreValue,
} from "@/content/frameworks/types";
import type { AppLocale } from "@/i18n/config";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTranslations } from "next-intl";
import { usePlatform } from "@/components/platform/platform-provider";
import { kindergartenLabel, latestSubmission } from "@/lib/platform-store";
import { canSubmitForm } from "@/lib/rbac";
import { scoreForm1 } from "@/lib/scoring";

const SCORES: ScoreValue[] = ["1", "2", "3", "4", "NA"];

type Answers = Record<string, ScoreValue>;

function asScore(value: string | undefined): ScoreValue | undefined {
  if (value === "1" || value === "2" || value === "3" || value === "4" || value === "NA") {
    return value;
  }
  return undefined;
}

export function Form1Sections({ locale }: { locale: AppLocale }) {
  const t = useTranslations("forms");
  const { currentUser, myKindergartens, saveSubmission, state } = usePlatform();
  const readOnly = !currentUser || !canSubmitForm(currentUser.role, "FORM_1");
  const [kindergartenId, setKindergartenId] = useState(
    myKindergartens[0]?.id ?? "",
  );
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [result, setResult] = useState<string | null>(null);

  useEffect(() => {
    if (!kindergartenId && myKindergartens[0]) {
      setKindergartenId(myKindergartens[0].id);
    }
  }, [kindergartenId, myKindergartens]);

  useEffect(() => {
    if (!kindergartenId) {
      return;
    }
    const saved = latestSubmission(state.submissions, kindergartenId, "FORM_1");
    const loaded: Answers = {};
    if (saved) {
      for (const [itemId, value] of Object.entries(saved.form1Answers)) {
        const score = asScore(value);
        if (score) {
          loaded[itemId] = score;
        }
      }
    }
    setAnswers(loaded);
    const scored = scoreForm1(
      Object.entries(loaded).map(([itemId, score]) => ({ itemId, score })),
    );
    setResult(
      scored.overallAverage != null ? String(scored.overallAverage) : null,
    );
  }, [kindergartenId, state.submissions]);
  const section = FORM_SECTIONS[step];
  const items = useMemo(
    () => FORM_1_ITEMS.filter((item) => item.section === section),
    [section],
  );

  function onSubmit() {
    if (readOnly) {
      return;
    }
    const responses = Object.entries(answers).map(([itemId, score]) => ({
      itemId,
      score,
    }));
    const scored = scoreForm1(responses);
    setResult(scored.overallAverage != null ? String(scored.overallAverage) : "—");
    if (kindergartenId) {
      saveSubmission({
        kindergartenId,
        formCode: "FORM_1",
        form1Answers: answers,
      });
    }
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
              {index + 1}. {SECTION_TITLES[id as FormSectionId][locale]}
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
        <CardContent className="flex flex-col gap-7">
          {items.map((item, index) => (
            <fieldset
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-unicef/15 bg-muted/40 p-4 sm:p-5"
            >
              <legend className="mb-1 w-full px-1 text-lg font-bold leading-8 text-heading sm:text-xl sm:leading-9">
                <span className="me-2 inline-flex min-w-8 items-center justify-center rounded-lg bg-unicef/15 px-2 py-0.5 text-sm font-bold text-unicef">
                  {index + 1}
                </span>
                {item.prompt[locale]}
              </legend>
              <div className="flex flex-wrap gap-2" role="radiogroup">
                {SCORES.map((score) => (
                  <label
                    key={score}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-base font-bold transition-all ${
                      readOnly ? "cursor-default" : "cursor-pointer"
                    } ${
                      answers[item.id] === score
                        ? "border-unicef bg-unicef text-white shadow"
                        : "border-unicef/20 bg-muted hover:border-unicef"
                    }`}
                  >
                    <input
                      type="radio"
                      name={item.id}
                      value={score}
                      checked={answers[item.id] === score}
                      disabled={readOnly}
                      onChange={() => {
                        if (readOnly) {
                          return;
                        }
                        setAnswers((current) => ({ ...current, [item.id]: score }));
                      }}
                    />
                    {t(`scores.${score}`)}
                  </label>
                ))}
              </div>
            </fieldset>
          ))}
        </CardContent>
      </Card>
      {result ? (
        <p className="text-lg font-bold text-heading">{t("overall", { score: result })}</p>
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
            onClick={() =>
              setStep((current) => Math.min(current + 1, FORM_SECTIONS.length - 1))
            }
          >
            {readOnly ? t("continue") : t("next")}
          </Button>
        ) : readOnly ? null : (
          <Button type="button" onClick={onSubmit}>
            {t("submit")}
          </Button>
        )}
      </div>
    </div>
  );
}
