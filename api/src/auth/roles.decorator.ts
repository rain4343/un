import { SetMetadata } from "@nestjs/common";
import type { Permission, UserRole } from "../../src/lib/rbac";

export const ROLES_KEY = "roles";
export const PERMISSIONS_KEY = "permissions";

export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);

export const RequirePermissions = (...permissions: Permission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
