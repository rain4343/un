import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  Min,
  ValidateNested,
} from "class-validator";
import { FORM_SECTIONS } from "../../src/content/frameworks/types";
import { SCORE_VALUES } from "../../src/content/frameworks/types";

const FORMS = ["FORM_1", "FORM_2"] as const;
const PLAN_STATUSES = [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "BLOCKED",
] as const;
const ALLOC_STATUSES = ["PLANNED", "DISPATCHED", "RECEIVED"] as const;

export class CreateSubmissionDto {
  @IsUUID()
  kindergartenId!: string;

  @IsIn(FORMS)
  formCode!: (typeof FORMS)[number];

  @Matches(/^\d{4}\/\d{4}$/)
  academicYear!: string;
}

export class ItemResponseDto {
  @IsString()
  itemId!: string;

  @IsIn(SCORE_VALUES)
  score!: (typeof SCORE_VALUES)[number];

  @IsOptional()
  @IsString()
  note?: string;
}

export class SaveForm1SectionDto {
  @IsIn(FORM_SECTIONS)
  section!: (typeof FORM_SECTIONS)[number];

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ItemResponseDto)
  responses!: ItemResponseDto[];
}

export class SaveForm2SectionDto {
  @IsIn(FORM_SECTIONS)
  section!: (typeof FORM_SECTIONS)[number];

  @IsString()
  gaps!: string;

  @IsString()
  objective!: string;

  @IsString()
  activities!: string;

  @IsString()
  responsible!: string;

  @IsString()
  timeframe!: string;

  @IsString()
  resources!: string;

  @IsString()
  indicator!: string;

  @IsIn(PLAN_STATUSES)
  status!: (typeof PLAN_STATUSES)[number];
}

export class CreateAllocationDto {
  @IsUUID()
  kindergartenId!: string;

  @IsUUID()
  supplyItemId!: string;

  @IsInt()
  @Min(1)
  quantity!: number;

  @Matches(/^\d{4}\/\d{4}$/)
  academicYear!: string;

  @IsOptional()
  @IsIn(ALLOC_STATUSES)
  status?: (typeof ALLOC_STATUSES)[number];

  @IsOptional()
  @IsString()
  notes?: string;
}
