import { Injectable } from "@nestjs/common";
import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { FORM_1_ITEMS, SECTION_TITLES } from "../../src/content/frameworks/form-1";
import { FORM_TITLES } from "../../src/content/frameworks";
import type { AppLocale } from "../../src/i18n/config";
import { scoreForm1 } from "../../src/lib/scoring";
import { SubmissionsService } from "./submissions.service";
import type { AccessActor } from "../../src/lib/rbac";

const UNICEF_BLUE = "1CABE2";
const UNICEF_NAVY = "374EA2";

@Injectable()
export class ReportsService {
  constructor(private readonly submissions: SubmissionsService) {}

  async excel(
    actor: AccessActor & { id: string },
    id: string,
    locale: AppLocale,
  ): Promise<Buffer> {
    const data = await this.submissions.get(actor, id);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "UNICEF Kindergarten Platform";
    const sheet = workbook.addWorksheet("Form 1", {
      views: [{ rightToLeft: locale !== "en", state: "frozen", ySplit: 3 }],
    });

    sheet.mergeCells("A1:E1");
    sheet.getCell("A1").value = "UNICEF";
    sheet.getCell("A1").font = { bold: true, color: { argb: "FFFFFFFF" }, size: 16 };
    sheet.getCell("A1").fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: `FF${UNICEF_NAVY}` },
    };

    sheet.mergeCells("A2:E2");
    sheet.getCell("A2").value = FORM_TITLES.FORM_1[locale];
    sheet.getCell("A2").font = { bold: true, color: { argb: `FF${UNICEF_BLUE}` } };

    sheet.addRow([]);
    sheet.addRow(["ID", "Section", "Indicator", "Score", "Note"]);
    const header = sheet.getRow(4);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${UNICEF_BLUE}` },
      };
    });

    const responseMap = new Map(
      data.responses.map((row) => [row.itemId, row]),
    );
    for (const item of FORM_1_ITEMS) {
      const response = responseMap.get(item.id);
      sheet.addRow([
        item.id,
        SECTION_TITLES[item.section][locale],
        item.prompt[locale],
        response?.score ?? "",
        response?.note ?? "",
      ]);
    }

    const scoring = scoreForm1(data.responses);
    sheet.addRow([]);
    sheet.addRow(["Overall", scoring.overallAverage ?? ""]);
    sheet.columns = [
      { width: 24 },
      { width: 28 },
      { width: 56 },
      { width: 12 },
      { width: 24 },
    ];

    const buf = await workbook.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  async pdf(
    actor: AccessActor & { id: string },
    id: string,
    locale: AppLocale,
  ): Promise<Buffer> {
    const data = await this.submissions.get(actor, id);
    const scoring = scoreForm1(data.responses);

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 48, size: "A4" });
      const chunks: Buffer[] = [];
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      doc.rect(0, 0, doc.page.width, 56).fill(`#${UNICEF_NAVY}`);
      doc.fillColor("#FFFFFF").fontSize(16).text("UNICEF", 48, 20);
      doc.fillColor(`#${UNICEF_BLUE}`).fontSize(12).text(
        FORM_TITLES.FORM_1[locale],
        48,
        72,
        { align: locale === "en" ? "left" : "right" },
      );
      doc.fillColor("#0F172A").fontSize(10).text(
        `Overall: ${scoring.overallAverage ?? "—"}`,
        48,
        96,
      );

      let y = 120;
      for (const section of scoring.sections) {
        if (y > 740) {
          doc.addPage();
          y = 48;
        }
        doc
          .fontSize(11)
          .fillColor(`#${UNICEF_NAVY}`)
          .text(
            `${SECTION_TITLES[section.section][locale]} — ${section.average ?? "—"}`,
            48,
            y,
          );
        y += 18;
      }

      doc
        .fontSize(8)
        .fillColor("#64748B")
        .text(
          "Confidential — UNICEF programme use only. Arabic and Kurdish text requires Noto Naskh in the report font pack.",
          48,
          800,
        );
      doc.end();
    });
  }
}
