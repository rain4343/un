"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePlatform } from "@/components/platform/platform-provider";
import { cn } from "@/lib/utils";

export function SessionBar({
  variant = "default",
}: {
  variant?: "default" | "sidebar";
}) {
  const t = useTranslations("auth");
  const { ready, currentUser, logout } = usePlatform();
  const sidebar = variant === "sidebar";

  if (!ready) {
    return null;
  }

  if (!currentUser) {
    return (
      <Link
        href="/login"
        className={cn(
          "rounded-xl px-3 py-2 text-sm font-extrabold",
          sidebar
            ? "bg-gold text-center text-navy"
            : "rounded-full bg-navy px-3 py-1.5 text-xs font-semibold text-white",
        )}
      >
        {t("signIn")}
      </Link>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-0.5",
        sidebar ? "text-start" : "max-w-56 items-end text-end",
      )}
    >
      <p
        className={cn(
          "truncate font-extrabold",
          sidebar ? "text-sm text-white" : "text-xs text-heading",
        )}
      >
        {currentUser.displayName}
      </p>
      <button
        type="button"
        className={cn(
          "font-bold hover:underline",
          sidebar ? "text-start text-sm text-gold" : "text-[11px] text-unicef",
        )}
        onClick={logout}
      >
        {t("signOut")}
      </button>
    </div>
  );
}
