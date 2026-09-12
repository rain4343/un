import {
  Controller,
  ForbiddenException,
  Get,
  Req,
  ServiceUnavailableException,
} from "@nestjs/common";
import { inArray } from "drizzle-orm";
import { kindergartens } from "../../src/db/schema";
import { kindergartenQueryScope } from "../../src/lib/rbac";
import type { AuthenticatedRequest } from "./auth/roles.guard";
import { RequirePermissions } from "./auth/roles.decorator";
import { DatabaseService } from "./database.service";

@Controller("kindergartens")
export class KindergartensController {
  constructor(private readonly database: DatabaseService) {}

  @Get()
  @RequirePermissions("sites.read.assigned")
  async list(@Req() req: AuthenticatedRequest) {
    if (!this.database.isConfigured()) {
      throw new ServiceUnavailableException("DATABASE_URL is not set");
    }
    const user = req.user;
    if (!user) {
      throw new ForbiddenException();
    }
    const scope = kindergartenQueryScope(user);
    if (scope.type === "all") {
      return this.database.client.select().from(kindergartens);
    }
    if (scope.ids.length === 0) {
      throw new ForbiddenException();
    }
    return this.database.client
      .select()
      .from(kindergartens)
      .where(inArray(kindergartens.id, scope.ids));
  }
}
