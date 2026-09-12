import type { AppLocale } from "@/i18n/config";
import {
  FORM_1_ITEMS,
  FORM_2_FIELDS,
  FORM_SECTIONS,
  FORM_TITLES,
  SECTION_TITLES,
} from "@/content/frameworks";
import { educationDirectorateLabel } from "@/content/education-directorates";
import {
  kindergartenLabel,
  type PlatformKindergarten,
  type PlatformSubmission,
} from "@/lib/platform-store";
import { scoreForm1 } from "@/lib/scoring";
import type { ScoreValue } from "@/content/frameworks/types";

const UNICEF_BLUE = "1CABE2";
const UNICEF_NAVY = "002F6C";

export type ReportFormCode = "FORM_1" | "FORM_2";

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

function fileStem(
  formCode: ReportFormCode,
  site: PlatformKindergarten,
  ext: "xlsx" | "pdf",
) {
  const code = site.code || "kg";
  const form = formCode === "FORM_1" ? "form-1" : "form-2";
  return `unicef-${form}-${code}.${ext}`;
}

function siteDirectorate(site: PlatformKindergarten, locale: AppLocale) {
  return site.educationDirectorateId
    ? educationDirectorateLabel(site.educationDirectorateId, locale)
    : "—";
}

export async function downloadUnicefExcel(input: {
  locale: AppLocale;
  formCode: ReportFormCode;
  site: PlatformKindergarten;
  submission?: PlatformSubmission;
}) {
  const ExcelJS = (await import("exceljs")).default;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "UNICEF Kindergarten Platform";
  workbook.created = new Date();
  const sheetName = input.formCode === "FORM_1" ? "Form 1" : "Form 2";
  const sheet = workbook.addWorksheet(sheetName, {
    views: [{ rightToLeft: input.locale !== "en", state: "frozen", ySplit: 5 }],
  });

  sheet.mergeCells("A1:E1");
  const brand = sheet.getCell("A1");
  brand.value = "UNICEF";
  brand.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 18 };
  brand.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: `FF${UNICEF_NAVY}` },
  };
  brand.alignment = { vertical: "middle", horizontal: "left" };

  sheet.mergeCells("A2:E2");
  const title = sheet.getCell("A2");
  title.value = FORM_TITLES[input.formCode][input.locale];
  title.font = { bold: true, color: { argb: `FF${UNICEF_BLUE}` }, size: 13 };

  sheet.mergeCells("A3:E3");
  sheet.getCell("A3").value =
    `${kindergartenLabel(input.site, input.locale)} · ${input.site.code}`;
  sheet.mergeCells("A4:E4");
  sheet.getCell("A4").value = siteDirectorate(input.site, input.locale);

  if (input.formCode === "FORM_1") {
    const answers = input.submission?.form1Answers ?? {};
    const responses = Object.entries(answers)
      .filter(([, score]) => score === "1" || score === "2" || score === "3" || score === "4" || score === "NA")
      .map(([itemId, score]) => ({ itemId, score: score as ScoreValue }));
    const scoring = scoreForm1(responses);

    sheet.addRow([]);
    const header = sheet.addRow(["ID", "Section", "Indicator", "Score", "Note"]);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${UNICEF_BLUE}` },
      };
    });
    for (const item of FORM_1_ITEMS) {
      sheet.addRow([
        item.id,
        SECTION_TITLES[item.section][input.locale],
        item.prompt[input.locale],
        answers[item.id] ?? "",
        "",
      ]);
    }
    sheet.addRow([]);
    sheet.addRow([
      "Overall",
      scoring.overallAverage ?? "",
      "",
      "",
      "",
    ]);
  } else {
    const plans = input.submission?.form2Plans ?? {};
    sheet.addRow([]);
    const header = sheet.addRow(["Section", "Field", "Response"]);
    header.font = { bold: true, color: { argb: "FFFFFFFF" } };
    header.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: `FF${UNICEF_BLUE}` },
      };
    });
    for (const section of FORM_SECTIONS) {
      for (const field of FORM_2_FIELDS) {
        sheet.addRow([
          SECTION_TITLES[section][input.locale],
          field.prompt[input.locale],
          plans[section]?.[field.id] ?? "",
        ]);
      }
    }
  }

  sheet.columns = [
    { width: 28 },
    { width: 36 },
    { width: 64 },
    { width: 12 },
    { width: 24 },
  ];

  const buffer = await workbook.xlsx.writeBuffer();
  downloadBlob(
    new Blob([buffer as BlobPart], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    fileStem(input.formCode, input.site, "xlsx"),
  );
}

export async function downloadUnicefPdf(input: {
  locale: AppLocale;
  formCode: ReportFormCode;
  site: PlatformKindergarten;
  submission?: PlatformSubmission;
}) {
  const [{ jsPDF }, html2canvas] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
  ]);
  const node = buildReportNode(input);
  document.body.appendChild(node);
  try {
    const canvas = await html2canvas.default(node, {
      scale: 2,
      backgroundColor: "#ffffff",
      useCORS: true,
    });
    const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = pageWidth;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    const image = canvas.toDataURL("image/png");
    let remaining = imgHeight;
    let offset = 0;
    pdf.addImage(image, "PNG", 0, offset, imgWidth, imgHeight);
    remaining -= pageHeight;
    while (remaining > 0) {
      offset -= pageHeight;
      pdf.addPage();
      pdf.addImage(image, "PNG", 0, offset, imgWidth, imgHeight);
      remaining -= pageHeight;
    }
    pdf.save(fileStem(input.formCode, input.site, "pdf"));
  } finally {
    node.remove();
  }
}

function buildReportNode(input: {
  locale: AppLocale;
  formCode: ReportFormCode;
  site: PlatformKindergarten;
  submission?: PlatformSubmission;
}) {
  const dir = input.locale === "en" ? "ltr" : "rtl";
  const wrap = document.createElement("div");
  wrap.setAttribute("dir", dir);
  wrap.style.cssText =
    "position:fixed;left:-1400px;top:0;width:794px;background:#fff;color:#0f172a;font-family:Arial,Tahoma,'Noto Naskh Arabic',sans-serif;padding:0;z-index:-1;";

  const answers = input.submission?.form1Answers ?? {};
  const plans = input.submission?.form2Plans ?? {};
  const responses = Object.entries(answers)
    .filter(
      ([, score]) =>
        score === "1" ||
        score === "2" ||
        score === "3" ||
        score === "4" ||
        score === "NA",
    )
    .map(([itemId, score]) => ({ itemId, score: score as ScoreValue }));
  const overall =
    input.formCode === "FORM_1"
      ? (scoreForm1(responses).overallAverage ?? "—")
      : "";

  const rows =
    input.formCode === "FORM_1"
      ? FORM_1_ITEMS.map(
          (item) =>
            `<tr>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:11px">${escapeHtml(SECTION_TITLES[item.section][input.locale])}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:11px">${escapeHtml(item.prompt[input.locale])}</td>
              <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:11px;font-weight:700">${escapeHtml(answers[item.id] || "—")}</td>
            </tr>`,
        ).join("")
      : FORM_SECTIONS.flatMap((section) =>
          FORM_2_FIELDS.map(
            (field) =>
              `<tr>
                <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:11px">${escapeHtml(SECTION_TITLES[section][input.locale])}</td>
                <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:11px">${escapeHtml(field.prompt[input.locale])}</td>
                <td style="padding:8px;border-bottom:1px solid #e2e8f0;font-size:11px">${escapeHtml(plans[section]?.[field.id] || "—")}</td>
              </tr>`,
          ),
        ).join("");

  wrap.innerHTML = `
    <div style="background:#${UNICEF_NAVY};color:#fff;padding:22px 28px">
      <div style="font-size:13px;letter-spacing:0.18em;font-weight:700">UNICEF</div>
      <div style="margin-top:8px;font-size:20px;font-weight:800;color:#${UNICEF_BLUE}">${escapeHtml(FORM_TITLES[input.formCode][input.locale])}</div>
    </div>
    <div style="padding:22px 28px 8px">
      <p style="margin:0 0 6px;font-size:14px;font-weight:700">${escapeHtml(kindergartenLabel(input.site, input.locale))} · ${escapeHtml(input.site.code)}</p>
      <p style="margin:0 0 6px;font-size:12px;color:#475569">${escapeHtml(siteDirectorate(input.site, input.locale))}</p>
      ${
        input.formCode === "FORM_1"
          ? `<p style="margin:0;font-size:12px;color:#002F6C;font-weight:700">Overall: ${escapeHtml(String(overall))}</p>`
          : ""
      }
    </div>
    <table style="width:100%;border-collapse:collapse;margin:8px 0 28px">
      <thead>
        <tr style="background:#${UNICEF_BLUE};color:#fff">
          <th style="text-align:start;padding:10px 12px;font-size:11px">Section</th>
          <th style="text-align:start;padding:10px 12px;font-size:11px">${input.formCode === "FORM_1" ? "Indicator" : "Field"}</th>
          <th style="text-align:start;padding:10px 12px;font-size:11px">${input.formCode === "FORM_1" ? "Score" : "Response"}</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <p style="padding:0 28px 24px;font-size:10px;color:#64748b">Confidential — UNICEF programme use only.</p>
  `;
  return wrap;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
