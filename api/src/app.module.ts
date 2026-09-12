import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { AcceptLanguageResolver, HeaderResolver, I18nModule } from "nestjs-i18n";
import path from "node:path";
import { HealthController } from "./health.controller";
import { KindergartensController } from "./kindergartens.controller";
import { FormsController } from "./forms.controller";
import { SubmissionsController, AllocationsController } from "./submissions.controller";
import { SubmissionsService } from "./submissions.service";
import { ReportsController } from "./reports.controller";
import { ReportsService } from "./reports.service";
import { DatabaseService } from "./database.service";
import { I18nValidationFilter } from "./i18n-validation.filter";
import { APP_FILTER, APP_GUARD } from "@nestjs/core";
import { RolesGuard } from "./auth/roles.guard";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    I18nModule.forRoot({
      fallbackLanguage: "en",
      loaderOptions: {
        path: path.join(__dirname, "i18n"),
        watch: true,
      },
      resolvers: [
        { use: HeaderResolver, options: ["x-locale"] },
        AcceptLanguageResolver,
      ],
    }),
  ],
  controllers: [
    HealthController,
    KindergartensController,
    FormsController,
    SubmissionsController,
    AllocationsController,
    ReportsController,
  ],
  providers: [
    DatabaseService,
    SubmissionsService,
    ReportsService,
    { provide: APP_FILTER, useClass: I18nValidationFilter },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
