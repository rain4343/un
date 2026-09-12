export type LocaleText = {
  en: string;
  ar: string;
  ckb: string;
};

export const FORM_SECTIONS = [
  "BUILDING",
  "WASH",
  "CANTEEN",
  "LEARNING",
  "TEACHERS",
  "ADMINISTRATION",
  "CURRICULA",
  "COUNCIL",
] as const;

export type FormSectionId = (typeof FORM_SECTIONS)[number];

export const FORM_CODES = ["FORM_1", "FORM_2"] as const;
export type FormCode = (typeof FORM_CODES)[number];

export const SCORE_VALUES = ["1", "2", "3", "4", "NA"] as const;
export type ScoreValue = (typeof SCORE_VALUES)[number];

export type FormItem = {
  id: string;
  section: FormSectionId;
  prompt: LocaleText;
};

export type DevelopmentField = {
  id: string;
  prompt: LocaleText;
};
