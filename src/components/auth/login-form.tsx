"use client";

import { FormEvent, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/routing";
import { usePlatform } from "@/components/platform/platform-provider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PartnerMarks } from "@/components/brand/partner-marks";

export function LoginForm() {
  const t = useTranslations("auth");
  const { login } = usePlatform();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const ok = login(
      String(data.get("username") ?? ""),
      String(data.get("password") ?? ""),
    );
    if (!ok) {
      setError(t("invalid"));
      return;
    }
    router.replace("/");
  }

  return (
    <Card className="mx-auto max-w-md">
      <CardHeader className="items-center text-center">
        <div className="mb-3">
          <PartnerMarks />
        </div>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="flex flex-col gap-3" onSubmit={onSubmit}>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-heading">{t("username")}</span>
            <input
              name="username"
              type="text"
              required
              autoComplete="username"
              defaultValue="admin"
              className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-heading">{t("password")}</span>
            <input
              name="password"
              type="password"
              required
              defaultValue="unicef20"
              className="h-10 rounded-xl border border-unicef/20 bg-background px-3 text-foreground"
            />
          </label>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          <Button type="submit">{t("signIn")}</Button>
          <p className="text-xs leading-5 text-muted-foreground">{t("hint")}</p>
        </form>
      </CardContent>
    </Card>
  );
}
