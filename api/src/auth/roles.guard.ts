import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import type { Request } from "express";
import {
  canAccessKindergarten,
  hasPermission,
  type AccessActor,
  type Permission,
  type UserRole,
} from "../../src/lib/rbac";
import { PERMISSIONS_KEY, ROLES_KEY } from "./roles.decorator";
import { actorFromRequest } from "./actor";

export type AuthenticatedRequest = Request & {
  user?: AccessActor & { id: string };
};

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const permissions = this.reflector.getAllAndOverride<Permission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!roles?.length && !permissions?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    if (!request.user) {
      request.user = actorFromRequest(request);
    }
    const user = request.user;
    if (!user) {
      throw new ForbiddenException();
    }

    if (roles?.length && !roles.includes(user.role)) {
      throw new ForbiddenException();
    }

    if (permissions?.length && !permissions.every((p) => hasPermission(user.role, p))) {
      throw new ForbiddenException();
    }

    const site = request.params.kindergartenId ?? request.query.kindergartenId;
    if (typeof site === "string" && site.length > 0) {
      if (!canAccessKindergarten(user, site)) {
        throw new ForbiddenException();
      }
    }

    return true;
  }
}
