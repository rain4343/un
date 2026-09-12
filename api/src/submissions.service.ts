import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { eq } from "drizzle-orm";
import { FORM_1_ITEMS } from "../../src/content/frameworks/form-1";
import { FORM_SECTIONS, type FormSectionId } from "../../src/content/frameworks/types";
import {
  developmentPlanEntries,
  formItemResponses,
  formSubmissions,
  kindergartens,
  supplyAllocations,
  type FormSubmission,
} from "../../src/db/schema";
import {
  canAccessKindergarten,
  canSubmitForm,
  type AccessActor,
} from "../../src/lib/rbac";
import { assertKnownForm1Items, scoreForm1 } from "../../src/lib/scoring";
import { DatabaseService } from "./database.service";
import type {
  CreateAllocationDto,
  CreateSubmissionDto,
  SaveForm1SectionDto,
  SaveForm2SectionDto,
} from "./dto/forms.dto";

type MemorySubmission = FormSubmission & {
  responses: SaveForm1SectionDto["responses"];
  plans: SaveForm2SectionDto[];
};

const memory = new Map<string, MemorySubmission>();

@Injectable()
export class SubmissionsService {
  constructor(private readonly database: DatabaseService) {}

  async create(actor: AccessActor & { id: string }, dto: CreateSubmissionDto) {
    this.assertSite(actor, dto.kindergartenId);
    if (!canSubmitForm(actor.role, dto.formCode)) {
      throw new ForbiddenException();
    }

    const row: MemorySubmission = {
      id: crypto.randomUUID(),
      kindergartenId: dto.kindergartenId,
      formCode: dto.formCode,
      instrumentVersion: "1.0.0",
      academicYear: dto.academicYear,
      currentSection: FORM_SECTIONS[0],
      status: "DRAFT",
      overallScore: null,
      sectionScores: null,
      assessorId: actor.id,
      submittedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      responses: [],
      plans: [],
    };

    if (this.database.isConfigured()) {
      await this.assertKindergarten(dto.kindergartenId);
      const [created] = await this.database.client
        .insert(formSubmissions)
        .values({
          kindergartenId: dto.kindergartenId,
          formCode: dto.formCode,
          academicYear: dto.academicYear,
          assessorId: actor.id,
          currentSection: FORM_SECTIONS[0],
          status: "DRAFT",
        })
        .returning();
      return created;
    }

    memory.set(row.id, row);
    return row;
  }

  async saveForm1Section(
    actor: AccessActor & { id: string },
    id: string,
    dto: SaveForm1SectionDto,
  ) {
    const submission = await this.getOwned(actor, id);
    if (submission.formCode !== "FORM_1") {
      throw new BadRequestException("errors.wrongForm");
    }
    if (!canSubmitForm(actor.role, "FORM_1", dto.section)) {
      throw new ForbiddenException();
    }
    try {
      assertKnownForm1Items(dto.section, dto.responses);
    } catch {
      throw new BadRequestException("errors.invalidItem");
    }

    if (this.database.isConfigured()) {
      for (const response of dto.responses) {
        await this.database.client
          .insert(formItemResponses)
          .values({
            submissionId: id,
            itemId: response.itemId,
            section: dto.section,
            score: response.score,
            note: response.note,
          })
          .onConflictDoUpdate({
            target: [formItemResponses.submissionId, formItemResponses.itemId],
            set: {
              score: response.score,
              note: response.note,
              updatedAt: new Date(),
            },
          });
      }
      await this.database.client
        .update(formSubmissions)
        .set({ currentSection: dto.section, updatedAt: new Date() })
        .where(eq(formSubmissions.id, id));
      return this.getOwned(actor, id);
    }

    const mem = memory.get(id);
    if (!mem) {
      throw new NotFoundException();
    }
    mem.responses = [
      ...mem.responses.filter((row) =>
        FORM_1_ITEMS.find((item) => item.id === row.itemId)?.section !==
        dto.section,
      ),
      ...dto.responses,
    ];
    mem.currentSection = dto.section;
    mem.updatedAt = new Date();
    return mem;
  }

  async saveForm2Section(
    actor: AccessActor & { id: string },
    id: string,
    dto: SaveForm2SectionDto,
  ) {
    const submission = await this.getOwned(actor, id);
    if (submission.formCode !== "FORM_2") {
      throw new BadRequestException("errors.wrongForm");
    }
    if (!canSubmitForm(actor.role, "FORM_2", dto.section)) {
      throw new ForbiddenException();
    }

    if (this.database.isConfigured()) {
      await this.database.client
        .insert(developmentPlanEntries)
        .values({
          submissionId: id,
          section: dto.section,
          gaps: dto.gaps,
          objective: dto.objective,
          activities: dto.activities,
          responsible: dto.responsible,
          timeframe: dto.timeframe,
          resources: dto.resources,
          indicator: dto.indicator,
          status: dto.status,
        })
        .onConflictDoUpdate({
          target: [
            developmentPlanEntries.submissionId,
            developmentPlanEntries.section,
          ],
          set: {
            gaps: dto.gaps,
            objective: dto.objective,
            activities: dto.activities,
            responsible: dto.responsible,
            timeframe: dto.timeframe,
            resources: dto.resources,
            indicator: dto.indicator,
            status: dto.status,
            updatedAt: new Date(),
          },
        });
      await this.database.client
        .update(formSubmissions)
        .set({ currentSection: dto.section, updatedAt: new Date() })
        .where(eq(formSubmissions.id, id));
      return this.getOwned(actor, id);
    }

    const mem = memory.get(id);
    if (!mem) {
      throw new NotFoundException();
    }
    mem.plans = mem.plans.filter((row) => row.section !== dto.section);
    mem.plans.push(dto);
    mem.currentSection = dto.section;
    mem.updatedAt = new Date();
    return mem;
  }

  async submit(actor: AccessActor & { id: string }, id: string) {
    const submission = await this.getOwned(actor, id);
    if (submission.formCode === "FORM_1") {
      const responses = await this.loadResponses(id, submission);
      this.assertForm1Complete(actor, responses);
      const scored = scoreForm1(responses);
      if (this.database.isConfigured()) {
        const [updated] = await this.database.client
          .update(formSubmissions)
          .set({
            status: "SUBMITTED",
            overallScore: scored.overallAverage?.toFixed(2) ?? null,
            sectionScores: scored.sections,
            submittedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(formSubmissions.id, id))
          .returning();
        return { ...updated, scoring: scored };
      }
      const mem = memory.get(id);
      if (!mem) {
        throw new NotFoundException();
      }
      mem.status = "SUBMITTED";
      mem.overallScore = scored.overallAverage?.toFixed(2) ?? null;
      mem.sectionScores = scored.sections;
      mem.submittedAt = new Date();
      return { ...mem, scoring: scored };
    }

    await this.assertForm2Complete(id, submission);
    if (this.database.isConfigured()) {
      const [updated] = await this.database.client
        .update(formSubmissions)
        .set({
          status: "SUBMITTED",
          submittedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(formSubmissions.id, id))
        .returning();
      return updated;
    }
    const mem = memory.get(id);
    if (!mem) {
      throw new NotFoundException();
    }
    mem.status = "SUBMITTED";
    mem.submittedAt = new Date();
    return mem;
  }

  async get(actor: AccessActor & { id: string }, id: string) {
    const submission = await this.getOwned(actor, id);
    const responses = await this.loadResponses(id, submission);
    return {
      ...submission,
      responses,
      scoring:
        submission.formCode === "FORM_1" ? scoreForm1(responses) : null,
    };
  }

  async allocate(actor: AccessActor & { id: string }, dto: CreateAllocationDto) {
    this.assertSite(actor, dto.kindergartenId);
    if (!this.database.isConfigured()) {
      throw new ServiceUnavailableException("DATABASE_URL is not set");
    }
    const [row] = await this.database.client
      .insert(supplyAllocations)
      .values({
        kindergartenId: dto.kindergartenId,
        supplyItemId: dto.supplyItemId,
        quantity: dto.quantity,
        academicYear: dto.academicYear,
        status: dto.status ?? "PLANNED",
        allocatedById: actor.id,
        notes: dto.notes,
      })
      .returning();
    return row;
  }

  async listAllocations(actor: AccessActor & { id: string }, kindergartenId: string) {
    this.assertSite(actor, kindergartenId);
    if (!this.database.isConfigured()) {
      throw new ServiceUnavailableException("DATABASE_URL is not set");
    }
    return this.database.client
      .select()
      .from(supplyAllocations)
      .where(eq(supplyAllocations.kindergartenId, kindergartenId));
  }

  private assertSite(actor: AccessActor, kindergartenId: string) {
    if (!canAccessKindergarten(actor, kindergartenId)) {
      throw new ForbiddenException();
    }
  }

  private async assertKindergarten(id: string) {
    const [row] = await this.database.client
      .select({ id: kindergartens.id })
      .from(kindergartens)
      .where(eq(kindergartens.id, id))
      .limit(1);
    if (!row) {
      throw new BadRequestException("errors.unknownSite");
    }
  }

  private async getOwned(actor: AccessActor & { id: string }, id: string) {
    if (this.database.isConfigured()) {
      const [row] = await this.database.client
        .select()
        .from(formSubmissions)
        .where(eq(formSubmissions.id, id))
        .limit(1);
      if (!row) {
        throw new NotFoundException();
      }
      this.assertSite(actor, row.kindergartenId);
      return row;
    }
    const row = memory.get(id);
    if (!row) {
      throw new NotFoundException();
    }
    this.assertSite(actor, row.kindergartenId);
    return row;
  }

  private async loadResponses(
    id: string,
    submission: FormSubmission | MemorySubmission,
  ) {
    if ("responses" in submission) {
      return submission.responses;
    }
    if (!this.database.isConfigured()) {
      return [];
    }
    const rows = await this.database.client
      .select()
      .from(formItemResponses)
      .where(eq(formItemResponses.submissionId, id));
    return rows.map((row) => ({
      itemId: row.itemId,
      score: row.score as SaveForm1SectionDto["responses"][number]["score"],
      note: row.note ?? undefined,
    }));
  }

  private assertForm1Complete(
    actor: AccessActor,
    responses: SaveForm1SectionDto["responses"],
  ) {
    const answered = new Set(responses.map((row) => row.itemId));
    const required = FORM_1_ITEMS.filter((item) =>
      canSubmitForm(actor.role, "FORM_1", item.section),
    );
    const missing = required.filter((item) => !answered.has(item.id));
    if (missing.length > 0) {
      throw new BadRequestException("errors.incompleteForm");
    }
  }

  private async assertForm2Complete(
    id: string,
    submission: FormSubmission | MemorySubmission,
  ) {
    const sections: FormSectionId[] = [...FORM_SECTIONS];
    if ("plans" in submission) {
      const have = new Set(submission.plans.map((row) => row.section));
      if (sections.some((section) => !have.has(section))) {
        throw new BadRequestException("errors.incompleteForm");
      }
      return;
    }
    const rows = await this.database.client
      .select({ section: developmentPlanEntries.section })
      .from(developmentPlanEntries)
      .where(eq(developmentPlanEntries.submissionId, id));
    const have = new Set(rows.map((row) => row.section));
    if (sections.some((section) => !have.has(section))) {
      throw new BadRequestException("errors.incompleteForm");
    }
  }
}
