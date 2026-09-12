import type { AppLocale } from "@/i18n/config";

export type EducationDirectorate = {
  id: string;
  localCkb: string;
  localAr: string;
  localEn: string;
};

const MINISTRY: Record<AppLocale, string> = {
  ckb: "وەزارەتی پەروەردە",
  ar: "وزارة التربية",
  en: "Ministry of Education",
};

const SULAYMANIYAH_GENERAL: Record<AppLocale, string> = {
  ckb: "بەڕێوەبەرایەتی گشتی پەروەردەی سلێمانی",
  ar: "المديرية العامة لتربية السليمانية",
  en: "Sulaymaniyah General Directorate of Education",
};

/** District education offices under Sulaymaniyah GDE (ب.پ.). */
export const EDUCATION_DIRECTORATES: EducationDirectorate[] = [
  {
    id: "sulaymaniyah-sharbazher",
    localCkb: "ب.پ.شارباژێڕ",
    localAr: "مديرية تربية شارباژێر",
    localEn: "Sharbazher Education Directorate",
  },
  {
    id: "sulaymaniyah-sharazur",
    localCkb: "ب.پ.شارەزوور",
    localAr: "مديرية تربية شارزور",
    localEn: "Sharazur Education Directorate",
  },
  {
    id: "sulaymaniyah-west",
    localCkb: "ب.پ.ڕۆژئاوا",
    localAr: "مديرية تربية غرب السليمانية",
    localEn: "West Sulaymaniyah Education Directorate",
  },
  {
    id: "sulaymaniyah-east",
    localCkb: "ب.پ.ڕۆژهەڵات",
    localAr: "مديرية تربية شرق السليمانية",
    localEn: "East Sulaymaniyah Education Directorate",
  },
  {
    id: "sulaymaniyah-penjwen",
    localCkb: "ب.پ.پێنجوێن",
    localAr: "مديرية تربية بنجوين",
    localEn: "Penjwen Education Directorate",
  },
  {
    id: "sulaymaniyah-qaradagh",
    localCkb: "ب.پ.قەرەداغ",
    localAr: "مديرية تربية قره‌داغ",
    localEn: "Qaradagh Education Directorate",
  },
  {
    id: "sulaymaniyah-darbandikhan",
    localCkb: "ب.پ.دەربەندیخان",
    localAr: "مديرية تربية دربنديخان",
    localEn: "Darbandikhan Education Directorate",
  },
  {
    id: "sulaymaniyah-saidsadiq",
    localCkb: "ب.پ.سەیدسادق",
    localAr: "مديرية تربية سيد صادق",
    localEn: "Said Sadiq Education Directorate",
  },
  {
    id: "sulaymaniyah-chamchamal",
    localCkb: "ب.پ.چەمچەماڵ",
    localAr: "مديرية تربية جمجمال",
    localEn: "Chamchamal Education Directorate",
  },
  {
    id: "sulaymaniyah-dukan",
    localCkb: "ب.پ.دووکان",
    localAr: "مديرية تربية دوكان",
    localEn: "Dukan Education Directorate",
  },
];

export function educationDirectorateLabel(
  id: string,
  locale: AppLocale,
): string {
  const row = EDUCATION_DIRECTORATES.find((item) => item.id === id);
  if (!row) {
    return "";
  }
  const local =
    locale === "ckb"
      ? row.localCkb
      : locale === "ar"
        ? row.localAr
        : row.localEn;
  return `${MINISTRY[locale]} / ${SULAYMANIYAH_GENERAL[locale]} / ${local}`;
}

export function isEducationDirectorateId(value: string): boolean {
  return EDUCATION_DIRECTORATES.some((item) => item.id === value);
}

const DIRECTORATE_ID_ALIASES: Record<string, string> = {
  "sulaymaniyah-mawat": "sulaymaniyah-dukan",
  "sulaymaniyah-city": "sulaymaniyah-west",
};

export function normalizeEducationDirectorateId(value: string): string {
  const trimmed = value.trim();
  const id = DIRECTORATE_ID_ALIASES[trimmed] ?? trimmed;
  return isEducationDirectorateId(id) ? id : "";
}
