"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePlatform } from "@/components/platform/platform-provider";
import type { AppLocale } from "@/i18n/config";
import {
  kindergartenLabel,
  latestSubmission,
} from "@/lib/platform-store";
import {
  downloadUnicefExcel,
  downloadUnicefPdf,
  type ReportFormCode,
} from "@/lib/unicef-reports";

export function ReportExport() {
  const t = useTranslations("reports");
  const locale = useLocale() as AppLocale;
  const { ready, currentUser, myKindergartens, state } = usePlatform();
  const [kindergartenId, setKindergartenId] = useState(
    myKindergartens[0]?.id ?? "",
  );
  const [formCode, setFormCode] = useState<ReportFormCode>("FORM_1");
  const [busy, setBusy] = useState<"excel" | "pdf" | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!kindergartenId && myKindergartens[0]) {
      setKindergartenId(myKindergartens[0].id);
    }
  }, [kindergartenId, myKindergartens]);

  if (!ready) {
    return <p className="text-sm text-muted-foreground">{t("preparing")}</p>;
  }

  if (!currentUser) {
    return <p className="text-sm text-muted-foreground">{t("needLogin")}</p>;
  }

  if (myKindergartens.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("needKindergarten")}</p>;
  }

  const site =
    myKindergartens.find((row) => row.id === kindergartenId) ??
    myKindergartens[0];

  async function run(kind: "excel" | "pdf") {
    setMessage(null);
    setBusy(kind);
    try {
      const submission = latestSubmission(
        state.submissions,
        site.id,
        formCode,
      );
      if (kind === "excel") {
        await downloadUnicefExcel({ locale, formCode, site, submission });
      } else {
        await downloadUnicefPdf({ locale, formCode, site, submission });
      }
      setMessage(t("downloaded"));
    } catch {
      setMessage(t("failed"));
    } finally {
      setBusy(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="flex max-w-xl flex-col gap-4">
        <p className="text-sm text-muted-foreground">{t("hint")}</p>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-heading">{t("kindergarten")}</span>
          <select
            value={site.id}
            onChange={(event) => setKindergartenId(event.target.value)}
            className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
          >
            {myKindergartens.map((row) => (
              <option key={row.id} value={row.id}>
                {kindergartenLabel(row, locale)}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-heading">{t("form")}</span>
          <select
            value={formCode}
            onChange={(event) =>
              setFormCode(event.target.value as ReportFormCode)
            }
            className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
          >
            <option value="FORM_1">{t("form1")}</option>
            <option value="FORM_2">{t("form2")}</option>
          </select>
        </label>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={busy !== null}
            onClick={() => void run("excel")}
          >
            {busy === "excel" ? t("preparing") : t("excel")}
          </Button>
          <Button
            type="button"
            disabled={busy !== null}
            onClick={() => void run("pdf")}
          >
            {busy === "pdf" ? t("preparing") : t("pdf")}
          </Button>
        </div>
        {message ? (
          <p className="text-sm font-medium text-unicef">{message}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
