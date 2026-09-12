import { FORM_1_ITEMS, SECTION_TITLES } from "./form-1";
import { FORM_2_FIELDS } from "./form-2";
import { FORM_CODES, FORM_SECTIONS } from "./types";
import type { FormCode, FormSectionId, LocaleText } from "./types";

export const FORM_TITLES: Record<FormCode, LocaleText> = {
  FORM_1: {
    en: "School / Kindergarten Evaluation Form (Form No. 1)",
    ar: "استمارة تقييم الروضة / المدرسة (الاستمارة رقم 1)",
    ckb: "فۆرمی هەڵسەنگاندنی باخچە / قوتابخانە (فۆرمی ژمارە 1)",
  },
  FORM_2: {
    en: "School Development Plan (Form No. 2)",
    ar: "خطة تطوير المدرسة / الروضة (الاستمارة رقم 2)",
    ckb: "پلانی گەشەپێدانی قوتابخانە (فۆرمی ژمارە 2)",
  },
};

export function itemsBySection() {
  return FORM_SECTIONS.map((section) => ({
    section,
    title: SECTION_TITLES[section],
    items: FORM_1_ITEMS.filter((item) => item.section === section),
  }));
}

export {
  FORM_1_ITEMS,
  FORM_2_FIELDS,
  FORM_CODES,
  FORM_SECTIONS,
  SECTION_TITLES,
};

export type { FormCode, FormSectionId, LocaleText };
