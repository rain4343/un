import { FORM_1_ITEMS } from "../content/frameworks/form-1";
import {
  FORM_SECTIONS,
  type FormSectionId,
  type ScoreValue,
} from "../content/frameworks/types";

export type ItemResponseInput = {
  itemId: string;
  score: ScoreValue;
  note?: string;
};

export type SectionScore = {
  section: FormSectionId;
  answered: number;
  numericCount: number;
  average: number | null;
  flaggedItemIds: string[];
};

export type Form1ScoreResult = {
  overallAverage: number | null;
  sections: SectionScore[];
  flaggedItemIds: string[];
};

const ITEM_SECTION = new Map(
  FORM_1_ITEMS.map((item) => [item.id, item.section]),
);

function toNumber(score: ScoreValue): number | null {
  if (score === "NA") {
    return null;
  }
  return Number(score);
}

export function scoreForm1(responses: ItemResponseInput[]): Form1ScoreResult {
  const byItem = new Map(responses.map((row) => [row.itemId, row]));
  const sections: SectionScore[] = FORM_SECTIONS.map((section) => {
    const items = FORM_1_ITEMS.filter((item) => item.section === section);
    const flaggedItemIds: string[] = [];
    let numericSum = 0;
    let numericCount = 0;
    let answered = 0;

    for (const item of items) {
      const row = byItem.get(item.id);
      if (!row) {
        continue;
      }
      answered += 1;
      const value = toNumber(row.score);
      if (value === null) {
        continue;
      }
      numericCount += 1;
      numericSum += value;
      if (value <= 2) {
        flaggedItemIds.push(item.id);
      }
    }

    return {
      section,
      answered,
      numericCount,
      average: numericCount === 0 ? null : round2(numericSum / numericCount),
      flaggedItemIds,
    };
  });

  const withAverages = sections.filter((row) => row.average !== null);
  const overallAverage =
    withAverages.length === 0
      ? null
      : round2(
          withAverages.reduce((sum, row) => sum + (row.average ?? 0), 0) /
            withAverages.length,
        );

  return {
    overallAverage,
    sections,
    flaggedItemIds: sections.flatMap((row) => row.flaggedItemIds),
  };
}

export function assertKnownForm1Items(
  section: FormSectionId,
  responses: ItemResponseInput[],
): void {
  for (const row of responses) {
    const expected = ITEM_SECTION.get(row.itemId);
    if (expected !== section) {
      throw new Error(`Item ${row.itemId} does not belong to ${section}`);
    }
  }
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}
