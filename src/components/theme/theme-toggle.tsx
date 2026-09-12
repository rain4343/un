"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme/theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const t = useTranslations("theme");
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const dark = mounted && theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={t("toggle")}
      suppressHydrationWarning
      className={cn(
        "flex w-full items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-extrabold transition-all",
        "bg-white/10 text-white/90 hover:bg-white/15 hover:text-white",
      )}
    >
      <span className="grid h-10 w-10 place-items-center rounded-xl bg-white/10">
        {dark ? (
          <Sun className="h-5 w-5 text-gold" strokeWidth={2.5} />
        ) : (
          <Moon className="h-5 w-5 text-unicef" strokeWidth={2.5} />
        )}
      </span>
      {dark ? t("light") : t("dark")}
    </button>
  );
}
