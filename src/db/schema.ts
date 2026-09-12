import { sql } from "drizzle-orm";
import {
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const userRoleEnum = pgEnum("user_role", [
  "SUPER_ADMIN",
  "KINDERGARTEN_MANAGER",
  "FIELD_MONITOR",
  "COUNCIL_MEMBER",
  "DISTRICT_EDUCATION",
]);

export const localeEnum = pgEnum("locale", ["en", "ar", "ckb"]);

export const instrumentCodeEnum = pgEnum("instrument_code", [
  "FORM_1",
  "FORM_2",
]);

export const allocationStatusEnum = pgEnum("allocation_status", [
  "PLANNED",
  "DISPATCHED",
  "RECEIVED",
]);

export const planEntryStatusEnum = pgEnum("plan_entry_status", [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETED",
  "BLOCKED",
]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
};

export const kindergartens = pgTable(
  "kindergartens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 32 }).notNull(),
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar").notNull(),
    nameCkb: text("name_ckb").notNull(),
    educationDirectorateId: text("education_directorate_id"),
    governorate: text("governorate"),
    address: text("address"),
    isActive: integer("is_active").default(1).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("kindergartens_code_uidx").on(table.code),
    index("kindergartens_active_idx").on(table.isActive),
  ],
);

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    displayName: text("display_name").notNull(),
    role: userRoleEnum("role").notNull(),
    preferredLocale: localeEnum("preferred_locale").default("en").notNull(),
    kindergartenId: uuid("kindergarten_id").references(() => kindergartens.id, {
      onDelete: "restrict",
    }),
    educationDirectorateId: text("education_directorate_id"),
    isActive: integer("is_active").default(1).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_uidx").on(sql`lower(${table.email})`),
    index("users_role_idx").on(table.role),
    index("users_kindergarten_idx").on(table.kindergartenId),
  ],
);

export const userSiteAssignments = pgTable(
  "user_site_assignments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    kindergartenId: uuid("kindergarten_id")
      .notNull()
      .references(() => kindergartens.id, { onDelete: "restrict" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("user_site_uidx").on(table.userId, table.kindergartenId),
    index("user_site_user_idx").on(table.userId),
    index("user_site_kg_idx").on(table.kindergartenId),
  ],
);

export const classrooms = pgTable(
  "classrooms",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kindergartenId: uuid("kindergarten_id")
      .notNull()
      .references(() => kindergartens.id, { onDelete: "restrict" }),
    code: varchar("code", { length: 32 }).notNull(),
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar").notNull(),
    nameCkb: text("name_ckb").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("classrooms_site_code_uidx").on(
      table.kindergartenId,
      table.code,
    ),
    index("classrooms_kindergarten_idx").on(table.kindergartenId),
  ],
);

export const children = pgTable(
  "children",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kindergartenId: uuid("kindergarten_id")
      .notNull()
      .references(() => kindergartens.id, { onDelete: "restrict" }),
    classroomId: uuid("classroom_id").references(() => classrooms.id, {
      onDelete: "set null",
    }),
    registrationCode: varchar("registration_code", { length: 64 }).notNull(),
    givenName: text("given_name").notNull(),
    familyName: text("family_name").notNull(),
    sex: varchar("sex", { length: 16 }),
    dateOfBirth: timestamp("date_of_birth", { withTimezone: false }),
    disabilityFlag: integer("disability_flag").default(0).notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("children_reg_code_uidx").on(table.registrationCode),
    index("children_kindergarten_idx").on(table.kindergartenId),
    index("children_classroom_idx").on(table.classroomId),
  ],
);

export const evaluationInstruments = pgTable(
  "evaluation_instruments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: instrumentCodeEnum("code").notNull(),
    version: varchar("version", { length: 32 }).notNull(),
    titleEn: text("title_en").notNull(),
    titleAr: text("title_ar").notNull(),
    titleCkb: text("title_ckb").notNull(),
    schema: jsonb("schema").notNull(),
    isActive: integer("is_active").default(1).notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("instruments_code_version_uidx").on(table.code, table.version),
  ],
);

export const formSubmissions = pgTable(
  "form_submissions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kindergartenId: uuid("kindergarten_id")
      .notNull()
      .references(() => kindergartens.id, { onDelete: "restrict" }),
    formCode: instrumentCodeEnum("form_code").notNull(),
    instrumentVersion: varchar("instrument_version", { length: 32 })
      .default("1.0.0")
      .notNull(),
    academicYear: varchar("academic_year", { length: 16 }).notNull(),
    currentSection: varchar("current_section", { length: 32 }),
    status: varchar("status", { length: 16 }).default("DRAFT").notNull(),
    overallScore: numeric("overall_score", { precision: 5, scale: 2 }),
    sectionScores: jsonb("section_scores").$type<unknown>(),
    assessorId: uuid("assessor_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    submittedAt: timestamp("submitted_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    index("submissions_site_idx").on(table.kindergartenId),
    index("submissions_form_idx").on(table.formCode),
    index("submissions_year_idx").on(table.academicYear),
    index("submissions_assessor_idx").on(table.assessorId),
  ],
);

export const formItemResponses = pgTable(
  "form_item_responses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => formSubmissions.id, { onDelete: "cascade" }),
    itemId: varchar("item_id", { length: 64 }).notNull(),
    section: varchar("section", { length: 32 }).notNull(),
    score: varchar("score", { length: 8 }).notNull(),
    note: text("note"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("response_submission_item_uidx").on(
      table.submissionId,
      table.itemId,
    ),
    index("response_section_idx").on(table.submissionId, table.section),
  ],
);

export const developmentPlanEntries = pgTable(
  "development_plan_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    submissionId: uuid("submission_id")
      .notNull()
      .references(() => formSubmissions.id, { onDelete: "cascade" }),
    section: varchar("section", { length: 32 }).notNull(),
    gaps: text("gaps").notNull(),
    objective: text("objective").notNull(),
    activities: text("activities").notNull(),
    responsible: text("responsible").notNull(),
    timeframe: text("timeframe").notNull(),
    resources: text("resources").notNull(),
    indicator: text("indicator").notNull(),
    status: planEntryStatusEnum("status").default("NOT_STARTED").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("plan_submission_section_uidx").on(
      table.submissionId,
      table.section,
    ),
  ],
);

export const supplyItems = pgTable(
  "supply_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sku: varchar("sku", { length: 64 }).notNull(),
    category: varchar("category", { length: 64 }).notNull(),
    nameEn: text("name_en").notNull(),
    nameAr: text("name_ar").notNull(),
    nameCkb: text("name_ckb").notNull(),
    unit: varchar("unit", { length: 32 }).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("supply_sku_uidx").on(table.sku)],
);

export const supplyAllocations = pgTable(
  "supply_allocations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    kindergartenId: uuid("kindergarten_id")
      .notNull()
      .references(() => kindergartens.id, { onDelete: "restrict" }),
    supplyItemId: uuid("supply_item_id")
      .notNull()
      .references(() => supplyItems.id, { onDelete: "restrict" }),
    quantity: integer("quantity").notNull(),
    academicYear: varchar("academic_year", { length: 16 }).notNull(),
    status: allocationStatusEnum("status").default("PLANNED").notNull(),
    allocatedById: uuid("allocated_by_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [
    index("alloc_site_idx").on(table.kindergartenId),
    index("alloc_item_idx").on(table.supplyItemId),
    index("alloc_year_idx").on(table.academicYear),
    uniqueIndex("alloc_site_item_year_uidx").on(
      table.kindergartenId,
      table.supplyItemId,
      table.academicYear,
    ),
  ],
);

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorId: uuid("actor_id").references(() => users.id, {
      onDelete: "set null",
    }),
    action: varchar("action", { length: 64 }).notNull(),
    entity: varchar("entity", { length: 64 }).notNull(),
    entityId: uuid("entity_id"),
    kindergartenId: uuid("kindergarten_id"),
    payloadHash: varchar("payload_hash", { length: 128 }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    index("audit_entity_idx").on(table.entity, table.entityId),
    index("audit_created_idx").on(table.createdAt),
    index("audit_site_idx").on(table.kindergartenId),
  ],
);

export type Kindergarten = typeof kindergartens.$inferSelect;
export type User = typeof users.$inferSelect;
export type Child = typeof children.$inferSelect;
export type FormSubmission = typeof formSubmissions.$inferSelect;
export type FormItemResponse = typeof formItemResponses.$inferSelect;
export type DevelopmentPlanEntry = typeof developmentPlanEntries.$inferSelect;
export type SupplyAllocation = typeof supplyAllocations.$inferSelect;
