export const USER_ROLES = [
  "SUPER_ADMIN",
  "KINDERGARTEN_MANAGER",
  "FIELD_MONITOR",
  "COUNCIL_MEMBER",
  "DISTRICT_EDUCATION",
] as const;

export type UserRole = (typeof USER_ROLES)[number];

export const PERMISSIONS = [
  "sites.read.all",
  "sites.read.assigned",
  "sites.write.assigned",
  "staff.write.assigned",
  "inventory.write.assigned",
  "evaluations.submit.official",
  "evaluations.submit.council",
  "evaluations.submit.development",
  "evaluations.audit",
  "users.manage.global",
  "reports.read.global",
  "reports.read.assigned",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  SUPER_ADMIN: PERMISSIONS,
  KINDERGARTEN_MANAGER: [
    "sites.read.assigned",
    "sites.write.assigned",
    "staff.write.assigned",
    "inventory.write.assigned",
    "evaluations.submit.development",
    "reports.read.assigned",
  ],
  FIELD_MONITOR: [
    "sites.read.assigned",
    "evaluations.submit.official",
    "evaluations.audit",
    "reports.read.assigned",
  ],
  COUNCIL_MEMBER: [
    "sites.read.assigned",
    "evaluations.submit.council",
  ],
  DISTRICT_EDUCATION: [
    "sites.read.assigned",
    "reports.read.assigned",
  ],
};

export type AccessActor = {
  role: UserRole;
  homeKindergartenId: string | null;
  assignedKindergartenIds: string[];
  educationDirectorateId?: string | null;
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function isDistrictEducationRole(role: UserRole): boolean {
  return role === "DISTRICT_EDUCATION";
}

export function canWriteSite(role: UserRole): boolean {
  return hasPermission(role, "sites.write.assigned");
}

export function canAccessKindergarten(
  actor: AccessActor,
  kindergartenId: string,
): boolean {
  if (actor.role === "SUPER_ADMIN") {
    return true;
  }
  if (actor.homeKindergartenId === kindergartenId) {
    return true;
  }
  return actor.assignedKindergartenIds.includes(kindergartenId);
}

export function requireAssignedScope(actor: AccessActor): string[] {
  if (actor.role === "SUPER_ADMIN") {
    return [];
  }
  const ids = new Set(actor.assignedKindergartenIds);
  if (actor.homeKindergartenId) {
    ids.add(actor.homeKindergartenId);
  }
  return [...ids];
}

export function kindergartenQueryScope(
  actor: AccessActor,
): { type: "all" } | { type: "ids"; ids: string[] } {
  if (actor.role === "SUPER_ADMIN") {
    return { type: "all" };
  }
  return { type: "ids", ids: requireAssignedScope(actor) };
}

export function canSubmitForm(
  role: UserRole,
  form: "FORM_1" | "FORM_2",
  section?: string,
): boolean {
  if (role === "SUPER_ADMIN") {
    return true;
  }
  if (form === "FORM_1") {
    if (hasPermission(role, "evaluations.submit.official")) {
      return true;
    }
    if (!hasPermission(role, "evaluations.submit.council")) {
      return false;
    }
    return section === undefined || section === "COUNCIL";
  }
  return (
    hasPermission(role, "evaluations.submit.official") ||
    hasPermission(role, "evaluations.submit.development")
  );
}

