"use client";

import { Trash2 } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePlatform } from "@/components/platform/platform-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EDUCATION_DIRECTORATES,
  educationDirectorateLabel,
} from "@/content/education-directorates";
import type { AppLocale } from "@/i18n/config";
import { canWriteSite } from "@/lib/rbac";
import {
  canAccessSite,
  childrenTotalFromAges,
  kindergartenLabel,
} from "@/lib/platform-store";

export function KindergartenDirectory() {
  const t = useTranslations("sites");
  const locale = useLocale() as AppLocale;
  const { currentUser, myKindergartens, deleteKindergarten } = usePlatform();

  if (!currentUser) {
    return <p className="text-sm text-muted-foreground">{t("needLogin")}</p>;
  }

  return (
    <div className="flex flex-col gap-6">
      {currentUser.role === "SUPER_ADMIN" ? <KindergartenCreateForm /> : (
        <p className="text-sm text-muted-foreground">
          {currentUser.role === "DISTRICT_EDUCATION"
            ? t("scopedNoteDistrict")
            : t("scopedNote")}
        </p>
      )}
      {myKindergartens.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {myKindergartens.map((site) => (
            <Card key={site.id}>
              <CardContent className="flex flex-col gap-3 p-6">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs font-bold uppercase tracking-widest text-unicef">
                    {site.code}
                  </p>
                  {currentUser.role === "SUPER_ADMIN" ? (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-9 w-9 shrink-0 p-0 text-red-600 hover:bg-red-500/10 hover:text-red-700"
                      aria-label={t("delete")}
                      onClick={() => {
                        if (!window.confirm(t("deleteConfirm"))) {
                          return;
                        }
                        deleteKindergarten(site.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
                <h2 className="text-xl font-bold text-heading">
                  {kindergartenLabel(site, locale)}
                </h2>
                <dl className="grid gap-1 text-sm text-muted-foreground">
                  <div className="flex justify-between gap-3">
                    <dt>{t("educationDirectorate")}</dt>
                    <dd className="text-end font-medium text-heading">
                      {site.educationDirectorateId
                        ? educationDirectorateLabel(
                            site.educationDirectorateId,
                            locale,
                          )
                        : "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>{t("managerName")}</dt>
                    <dd className="font-medium text-heading">
                      {site.managerName || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>{t("managerMobile")}</dt>
                    <dd className="font-medium text-heading" dir="ltr">
                      {site.managerMobile || "—"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>{t("childrenAge4")}</dt>
                    <dd className="font-medium text-heading">
                      {site.childrenAge4 || "0"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>{t("childrenAge5")}</dt>
                    <dd className="font-medium text-heading">
                      {site.childrenAge5 || "0"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-3">
                    <dt>{t("childrenTotal")}</dt>
                    <dd className="font-semibold text-heading">
                      {site.childrenTotal || "0"}
                    </dd>
                  </div>
                </dl>
                <Button asChild>
                  <Link href={`/kindergartens/${site.id}`}>
                    {canWriteSite(currentUser.role) ? t("open") : t("view")}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function KindergartenCreateForm() {
  const t = useTranslations("sites");
  const { addKindergarten } = usePlatform();
  const [age4, setAge4] = useState("");
  const [age5, setAge5] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const total = useMemo(
    () => childrenTotalFromAges(age4, age5),
    [age4, age5],
  );

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const result = addKindergarten({
      name: String(data.get("name") ?? ""),
      managerName: String(data.get("managerName") ?? ""),
      managerMobile: String(data.get("managerMobile") ?? ""),
      educationDirectorateId: String(data.get("educationDirectorateId") ?? ""),
      childrenAge4: String(data.get("childrenAge4") ?? ""),
      childrenAge5: String(data.get("childrenAge5") ?? ""),
    });
    if (result === "missing_name") {
      setMessage(t("missingName"));
      return;
    }
    if (result) {
      setMessage(t("forbidden"));
      return;
    }
    event.currentTarget.reset();
    setAge4("");
    setAge5("");
    setMessage(t("created"));
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("addTitle")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-heading">{t("name")}</span>
            <input
              name="name"
              required
              className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-heading">{t("managerName")}</span>
            <input
              name="managerName"
              className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-heading">{t("managerMobile")}</span>
            <input
              name="managerMobile"
              type="tel"
              dir="ltr"
              className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
            />
          </label>
          <EducationDirectorateField />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-heading">{t("childrenAge4")}</span>
            <input
              name="childrenAge4"
              type="number"
              min="0"
              value={age4}
              onChange={(event) => setAge4(event.target.value)}
              className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-heading">{t("childrenAge5")}</span>
            <input
              name="childrenAge5"
              type="number"
              min="0"
              value={age5}
              onChange={(event) => setAge5(event.target.value)}
              className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-heading">{t("childrenTotal")}</span>
            <input
              readOnly
              value={total}
              className="h-10 rounded-xl border border-unicef/20 bg-muted px-3 font-semibold text-heading"
            />
          </label>
          {message ? (
            <p className="text-sm font-medium text-unicef sm:col-span-2">
              {message}
            </p>
          ) : null}
          <div className="sm:col-span-2">
            <Button type="submit">{t("add")}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export function KindergartenEditor({ id }: { id: string }) {
  const t = useTranslations("sites");
  const locale = useLocale() as AppLocale;
  const { currentUser, myKindergartens, updateKindergarten } = usePlatform();
  const site = myKindergartens.find((row) => row.id === id);
  const allowed = canAccessSite(currentUser, id, myKindergartens);
  const readOnly = !currentUser || !canWriteSite(currentUser.role);
  const [age4, setAge4] = useState(site?.childrenAge4 ?? "");
  const [age5, setAge5] = useState(site?.childrenAge5 ?? "");
  const total = useMemo(
    () => childrenTotalFromAges(age4, age5),
    [age4, age5],
  );

  useEffect(() => {
    if (!site) {
      return;
    }
    setAge4(site.childrenAge4);
    setAge5(site.childrenAge5);
  }, [site]);

  if (!site || !allowed) {
    return <p className="text-sm text-muted-foreground">{t("forbidden")}</p>;
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (readOnly) {
      return;
    }
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    updateKindergarten(id, {
      nameCkb: locale === "ckb" ? name : site.nameCkb || name,
      nameAr: locale === "ar" ? name : site.nameAr || name,
      nameEn: locale === "en" ? name : site.nameEn || name,
      managerName: String(data.get("managerName") ?? ""),
      managerMobile: String(data.get("managerMobile") ?? ""),
      educationDirectorateId: String(data.get("educationDirectorateId") ?? ""),
      childrenAge4: String(data.get("childrenAge4") ?? ""),
      childrenAge5: String(data.get("childrenAge5") ?? ""),
    });
  }

  return (
    <Card>
      <CardContent className="p-6 sm:p-8">
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={onSubmit}>
          {readOnly ? (
            <p className="text-sm font-bold text-heading sm:col-span-2">
              {t("readOnly")}
            </p>
          ) : null}
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-heading">{t("name")}</span>
            <input
              name="name"
              required
              defaultValue={kindergartenLabel(site, locale)}
              className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
              readOnly={readOnly}
              disabled={readOnly}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-heading">{t("managerName")}</span>
            <input
              name="managerName"
              defaultValue={site.managerName}
              className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
              readOnly={readOnly}
              disabled={readOnly}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-heading">{t("managerMobile")}</span>
            <input
              name="managerMobile"
              type="tel"
              dir="ltr"
              defaultValue={site.managerMobile}
              className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
              readOnly={readOnly}
              disabled={readOnly}
            />
          </label>
          <EducationDirectorateField
            defaultValue={site.educationDirectorateId}
            disabled={readOnly}
          />
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-heading">{t("childrenAge4")}</span>
            <input
              name="childrenAge4"
              type="number"
              min="0"
              value={age4}
              onChange={(event) => setAge4(event.target.value)}
              className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
              readOnly={readOnly}
              disabled={readOnly}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-heading">{t("childrenAge5")}</span>
            <input
              name="childrenAge5"
              type="number"
              min="0"
              value={age5}
              onChange={(event) => setAge5(event.target.value)}
              className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
              readOnly={readOnly}
              disabled={readOnly}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            <span className="font-medium text-heading">{t("childrenTotal")}</span>
            <input
              readOnly
              value={total}
              className="h-10 rounded-xl border border-unicef/20 bg-muted px-3 font-semibold text-heading"
            />
          </label>
          {readOnly ? null : (
            <div className="sm:col-span-2">
              <Button type="submit">{t("save")}</Button>
            </div>
          )}
        </form>
      </CardContent>
    </Card>
  );
}

function EducationDirectorateField({
  defaultValue = "",
  disabled = false,
}: {
  defaultValue?: string;
  disabled?: boolean;
}) {
  const t = useTranslations("sites");
  const locale = useLocale() as AppLocale;
  return (
    <label className="flex flex-col gap-1 text-sm sm:col-span-2">
      <span className="font-medium text-heading">
        {t("educationDirectorate")}
      </span>
      <select
        name="educationDirectorateId"
        defaultValue={defaultValue}
        disabled={disabled}
        className="min-h-10 rounded-xl border border-unicef/20 bg-background px-3 py-2 text-start text-foreground"
      >
        <option value="">{t("educationDirectorateOptional")}</option>
        {EDUCATION_DIRECTORATES.map((item) => (
          <option key={item.id} value={item.id}>
            {educationDirectorateLabel(item.id, locale)}
          </option>
        ))}
      </select>
    </label>
  );
}
