import {
  Controller,
  Get,
  Header,
  Param,
  Query,
  Req,
  StreamableFile,
} from "@nestjs/common";
import { RequirePermissions } from "./auth/roles.decorator";
import type { AuthenticatedRequest } from "./auth/roles.guard";
import { ReportsService } from "./reports.service";
import { isAppLocale, type AppLocale } from "../../src/i18n/config";

@Controller("reports")
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get("submissions/:id.xlsx")
  @RequirePermissions("reports.read.assigned")
  @Header(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  )
  async excel(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Query("locale") locale: string,
  ) {
    const lang: AppLocale = isAppLocale(locale) ? locale : "en";
    const buffer = await this.reports.excel(req.user!, id, lang);
    return new StreamableFile(buffer, {
      disposition: `attachment; filename="unicef-form1-${id}.xlsx"`,
    });
  }

  @Get("submissions/:id.pdf")
  @RequirePermissions("reports.read.assigned")
  @Header("Content-Type", "application/pdf")
  async pdf(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Query("locale") locale: string,
  ) {
    const lang: AppLocale = isAppLocale(locale) ? locale : "en";
    const pdf = await this.reports.pdf(req.user!, id, lang);
    return new StreamableFile(pdf, {
      disposition: `attachment; filename="unicef-form1-${id}.pdf"`,
    });
  }
}
