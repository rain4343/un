import type { Request } from "express";
import { USER_ROLES, type AccessActor, type UserRole } from "../../src/lib/rbac";
import type { AuthenticatedRequest } from "./roles.guard";

function isRole(value: string): value is UserRole {
  return (USER_ROLES as readonly string[]).includes(value);
}

export function actorFromRequest(
  request: Request,
): (AccessActor & { id: string }) | undefined {
  const authed = request as AuthenticatedRequest;
  if (authed.user) {
    return authed.user;
  }

  const roleHeader = header(request, "x-user-role");
  const id =
    header(request, "x-user-id") ?? "00000000-0000-4000-8000-000000000001";
  const home = header(request, "x-kindergarten-id");
  const directorate = header(request, "x-education-directorate-id");
  const assigned = header(request, "x-assigned-kindergartens");
  const assignedKindergartenIds = assigned
    ? assigned.split(",").map((part) => part.trim()).filter(Boolean)
    : [];

  if (roleHeader && isRole(roleHeader)) {
    return {
      id,
      role: roleHeader,
      homeKindergartenId: home ?? null,
      assignedKindergartenIds,
      educationDirectorateId: directorate ?? null,
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      id,
      role: "SUPER_ADMIN",
      homeKindergartenId: null,
      assignedKindergartenIds: [],
      educationDirectorateId: null,
    };
  }

  return undefined;
}

function header(request: Request, name: string): string | undefined {
  const value = request.headers[name];
  return typeof value === "string" && value.length > 0 ? value : undefined;
}
