import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { Noto_Naskh_Arabic, Vazirmatn } from "next/font/google";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { isAppLocale, localeDirection, locales, type AppLocale } from "@/i18n/config";
import "../globals.css";

const unicode = Vazirmatn({
  variable: "--font-unicode",
  subsets: ["latin", "latin-ext", "arabic"],
  weight: ["400", "500", "600", "700"],
});

const naskh = Noto_Naskh_Arabic({
  variable: "--font-naskh",
  subsets: ["arabic"],
  weight: ["500", "600", "700"],
});

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  title: "UNICEF · 20 Kindergartens",
  description: "UNICEF kindergarten management platform",
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isAppLocale(locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = localeDirection[locale as AppLocale];

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${unicode.variable} ${naskh.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("unicef-theme")==="dark"){document.documentElement.classList.add("dark");}}catch(e){}})();`,
          }}
        />
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AppShell>{children}</AppShell>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
