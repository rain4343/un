"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "@/i18n/routing";
import { Link } from "@/i18n/routing";
import { LanguageSwitcher } from "./language-switcher";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { SessionBar } from "@/components/auth/session-bar";
import { PartnerMarks } from "@/components/brand/partner-marks";
import { cn } from "@/lib/utils";
import { usePlatform } from "@/components/platform/platform-provider";
import {
  ClipboardList,
  BarChart3,
  LayoutDashboard,
  School,
  Shield,
} from "lucide-react";

const NAV_KEYS = [
  "dashboard",
  "kindergartens",
  "evaluations",
  "reports",
  "admin",
] as const;

const NAV_HREF: Record<(typeof NAV_KEYS)[number], string> = {
  dashboard: "/",
  kindergartens: "/kindergartens",
  evaluations: "/evaluations",
  reports: "/reports",
  admin: "/admin",
};

const NAV_ICON = {
  dashboard: LayoutDashboard,
  kindergartens: School,
  evaluations: ClipboardList,
  reports: BarChart3,
  admin: Shield,
} as const;

export function SiteHeader() {
  const t = useTranslations();
  const pathname = usePathname();
  const { currentUser } = usePlatform();
  const keys = NAV_KEYS.filter((key) =>
    key === "admin" ? currentUser?.role === "SUPER_ADMIN" : true,
  );

  return (
    <aside className="sticky top-0 z-40 flex w-full shrink-0 flex-col bg-[linear-gradient(180deg,#00112b_0%,#002f6c_48%,#014f86_100%)] text-white shadow-[8px_0_40px_rgba(0,17,43,0.28)] md:h-svh md:w-72">
      <div className="border-b border-white/10 px-5 py-5">
        <Link href="/" className="flex flex-col gap-3">
          <PartnerMarks />
          <span className="text-sm font-extrabold leading-relaxed tracking-tight">
            {t("app.shortName")}
          </span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1.5 overflow-y-auto px-3 py-4" aria-label={t("nav.dashboard")}>
        {keys.map((key) => {
          const href = NAV_HREF[key];
          const active =
            href === "/" ? pathname === "/" : pathname.startsWith(href);
          const Icon = NAV_ICON[key];
          return (
            <Link
              key={key}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3.5 py-3 text-base font-extrabold tracking-tight transition-all",
                active
                  ? "bg-unicef text-white shadow-[0_10px_24px_rgba(28,171,226,0.45)]"
                  : "text-white/80 hover:bg-white/10 hover:text-white",
              )}
            >
              <span
                className={cn(
                  "grid h-10 w-10 place-items-center rounded-xl",
                  active ? "bg-white/20" : "bg-white/10",
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2.5} />
              </span>
              {t(`nav.${key}`)}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto flex flex-col gap-3 border-t border-white/10 px-4 py-4">
        <ThemeToggle />
        <LanguageSwitcher variant="sidebar" />
        <SessionBar variant="sidebar" />
      </div>
    </aside>
  );
}
