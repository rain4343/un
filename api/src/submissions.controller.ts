import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
} from "@nestjs/common";
import { RequirePermissions } from "./auth/roles.decorator";
import type { AuthenticatedRequest } from "./auth/roles.guard";
import {
  CreateAllocationDto,
  CreateSubmissionDto,
  SaveForm1SectionDto,
  SaveForm2SectionDto,
} from "./dto/forms.dto";
import { SubmissionsService } from "./submissions.service";

@Controller("submissions")
export class SubmissionsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Post()
  @RequirePermissions("sites.read.assigned")
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateSubmissionDto,
  ) {
    return this.submissions.create(req.user!, dto);
  }

  @Get(":id")
  @RequirePermissions("sites.read.assigned")
  get(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.submissions.get(req.user!, id);
  }

  @Patch(":id/form-1/sections")
  @RequirePermissions("sites.read.assigned")
  saveForm1(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: SaveForm1SectionDto,
  ) {
    return this.submissions.saveForm1Section(req.user!, id, dto);
  }

  @Patch(":id/form-2/sections")
  @RequirePermissions("sites.read.assigned")
  saveForm2(
    @Req() req: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() dto: SaveForm2SectionDto,
  ) {
    return this.submissions.saveForm2Section(req.user!, id, dto);
  }

  @Post(":id/submit")
  @RequirePermissions("sites.read.assigned")
  submit(@Req() req: AuthenticatedRequest, @Param("id") id: string) {
    return this.submissions.submit(req.user!, id);
  }
}

@Controller("allocations")
export class AllocationsController {
  constructor(private readonly submissions: SubmissionsService) {}

  @Post()
  @RequirePermissions("inventory.write.assigned")
  create(
    @Req() req: AuthenticatedRequest,
    @Body() dto: CreateAllocationDto,
  ) {
    return this.submissions.allocate(req.user!, dto);
  }

  @Get("kindergartens/:kindergartenId")
  @RequirePermissions("sites.read.assigned")
  list(
    @Req() req: AuthenticatedRequest,
    @Param("kindergartenId") kindergartenId: string,
  ) {
    return this.submissions.listAllocations(req.user!, kindergartenId);
  }
}
