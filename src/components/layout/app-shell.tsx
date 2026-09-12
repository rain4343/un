"use client";

import { SiteHeader } from "./site-header";
import { SiteFooter } from "./site-footer";
import { PlatformProvider } from "@/components/platform/platform-provider";
import { ThemeProvider } from "@/components/theme/theme-provider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <PlatformProvider>
        <div className="flex min-h-full flex-1 flex-col md:flex-row">
          <SiteHeader />
          <div className="flex min-w-0 flex-1 flex-col">
            <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 lg:px-10 lg:py-10">
              {children}
            </main>
            <SiteFooter />
          </div>
        </div>
      </PlatformProvider>
    </ThemeProvider>
  );
}
