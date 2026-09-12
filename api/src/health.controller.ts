import { Controller, Get } from "@nestjs/common";
import { I18n, I18nContext } from "nestjs-i18n";
import { DatabaseService } from "./database.service";

@Controller("health")
export class HealthController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  health(@I18n() i18n: I18nContext) {
    return {
      status: "ok",
      database: this.database.isConfigured() ? "configured" : "missing",
      message: i18n.t("common.health.ok"),
    };
  }
}
