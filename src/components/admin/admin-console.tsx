"use client";

import { FormEvent, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { usePlatform } from "@/components/platform/platform-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  EDUCATION_DIRECTORATES,
  educationDirectorateLabel,
} from "@/content/education-directorates";
import { kindergartenLabel } from "@/lib/platform-store";
import type { AppLocale } from "@/i18n/config";
import type { UserRole } from "@/lib/rbac";

const EXTRA_ROLES: UserRole[] = [
  "KINDERGARTEN_MANAGER",
  "FIELD_MONITOR",
  "COUNCIL_MEMBER",
  "DISTRICT_EDUCATION",
];

export function AdminConsole() {
  const t = useTranslations("admin");
  const locale = useLocale() as AppLocale;
  const { currentUser, state, addUserToKindergarten } = usePlatform();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>("KINDERGARTEN_MANAGER");
  const districtRole = role === "DISTRICT_EDUCATION";

  if (currentUser?.role !== "SUPER_ADMIN") {
    return (
      <Card>
        <CardContent className="p-8 text-sm text-muted-foreground">
          {t("adminsOnly")}
        </CardContent>
      </Card>
    );
  }

  function onAddUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setOk(null);
    const data = new FormData(event.currentTarget);
    const selectedRole = String(data.get("role") ?? "KINDERGARTEN_MANAGER") as UserRole;
    const result = addUserToKindergarten({
      kindergartenId: String(data.get("kindergartenId") ?? ""),
      educationDirectorateId: String(data.get("educationDirectorateId") ?? ""),
      displayName: String(data.get("displayName") ?? ""),
      password: String(data.get("password") ?? ""),
      role: selectedRole,
    });
    if (result === "missing_name") {
      setError(t("missingName"));
      return;
    }
    if (result === "duplicate_name") {
      setError(t("duplicateName"));
      return;
    }
    if (result === "missing_site") {
      setError(t("missingSite"));
      return;
    }
    if (result === "missing_directorate") {
      setError(t("missingDirectorate"));
      return;
    }
    if (result) {
      setError(t("adminsOnly"));
      return;
    }
    event.currentTarget.reset();
    setRole("KINDERGARTEN_MANAGER");
    setOk(
      selectedRole === "DISTRICT_EDUCATION"
        ? t("userAddedDistrict")
        : t("userAdded"),
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {ok ? <p className="text-sm font-medium text-unicef">{ok}</p> : null}
      <Card>
        <CardHeader>
          <CardTitle>{t("addUserTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="flex max-w-xl flex-col gap-3" onSubmit={onAddUser}>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-heading">{t("role")}</span>
              <select
                name="role"
                value={role}
                onChange={(event) => setRole(event.target.value as UserRole)}
                className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
              >
                {EXTRA_ROLES.map((item) => (
                  <option key={item} value={item}>
                    {t(`roles.${item}`)}
                  </option>
                ))}
              </select>
            </label>
            {districtRole ? (
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-heading">{t("district")}</span>
                <select
                  name="educationDirectorateId"
                  required
                  className="min-h-10 rounded-xl border border-unicef/20 bg-background px-3 py-2 text-foreground"
                >
                  <option value="">{t("selectDistrict")}</option>
                  {EDUCATION_DIRECTORATES.map((item) => (
                    <option key={item.id} value={item.id}>
                      {educationDirectorateLabel(item.id, locale)}
                    </option>
                  ))}
                </select>
              </label>
            ) : (
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-heading">{t("kindergarten")}</span>
                <select
                  name="kindergartenId"
                  required
                  className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
                >
                  <option value="">{t("selectSite")}</option>
                  {state.kindergartens.map((site) => (
                    <option key={site.id} value={site.id}>
                      {kindergartenLabel(site, locale)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <Field name="displayName" label={t("userName")} required />
            <Field
              name="password"
              label={t("userPassword")}
              type="password"
              required
            />
            <Button type="submit">{t("addUser")}</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>{t("directory")}</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-start text-sm">
            <thead>
              <tr className="border-b border-unicef/15 text-heading">
                <th className="py-2 pe-3 font-semibold">{t("userName")}</th>
                <th className="py-2 pe-3 font-semibold">{t("role")}</th>
                <th className="py-2 font-semibold">{t("scope")}</th>
              </tr>
            </thead>
            <tbody>
              {state.users.map((user) => {
                const site = state.kindergartens.find(
                  (row) => row.id === user.kindergartenId,
                );
                const scope =
                  user.role === "SUPER_ADMIN"
                    ? t("global")
                    : user.role === "DISTRICT_EDUCATION" &&
                        user.educationDirectorateId
                      ? educationDirectorateLabel(
                          user.educationDirectorateId,
                          locale,
                        )
                      : site
                        ? kindergartenLabel(site, locale)
                        : "—";
                return (
                  <tr key={user.id} className="border-b border-unicef/10">
                    <td className="py-2 pe-3">{user.displayName}</td>
                    <td className="py-2 pe-3">{t(`roles.${user.role}`)}</td>
                    <td className="py-2">{scope}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      <span className="font-medium text-heading">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
      />
    </label>
  );
}
