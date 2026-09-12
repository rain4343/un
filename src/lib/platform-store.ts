import { normalizeEducationDirectorateId } from "@/content/education-directorates";
import { USER_ROLES, type UserRole } from "@/lib/rbac";
import type { AppLocale } from "@/i18n/config";

export type PlatformKindergarten = {
  id: string;
  code: string;
  nameEn: string;
  nameAr: string;
  nameCkb: string;
  managerName: string;
  managerMobile: string;
  childrenAge4: string;
  childrenAge5: string;
  childrenTotal: string;
  educationDirectorateId: string;
  governorate: string;
  address: string;
  notes: string;
  childrenCount: string;
  staffCount: string;
  createdAt: string;
};

export type PlatformUser = {
  id: string;
  username: string;
  email: string;
  password: string;
  displayName: string;
  role: UserRole;
  kindergartenId: string | null;
  educationDirectorateId: string | null;
  assignedKindergartenIds: string[];
};

export type PlatformChild = {
  id: string;
  kindergartenId: string;
  givenName: string;
  familyName: string;
};

export type PlatformSubmission = {
  id: string;
  kindergartenId: string;
  formCode: "FORM_1" | "FORM_2";
  submittedAt: string;
  form1Answers: Record<string, string>;
  form2Plans: Record<string, Record<string, string>>;
};

export type PlatformState = {
  kindergartens: PlatformKindergarten[];
  users: PlatformUser[];
  children: PlatformChild[];
  submissions: PlatformSubmission[];
  sessionUserId: string | null;
};

const STORAGE_KEY = "unicef-kg-platform-v1";

const ADMIN_ID = "00000000-0000-4000-8000-000000000001";

const seed = (): PlatformState => ({
  kindergartens: [],
  users: [
    {
      id: ADMIN_ID,
      username: "admin",
      email: "admin",
      password: "unicef20",
      displayName: "UNICEF Country Office",
      role: "SUPER_ADMIN",
      kindergartenId: null,
      educationDirectorateId: null,
      assignedKindergartenIds: [],
    },
  ],
  children: [],
  submissions: [],
  sessionUserId: ADMIN_ID,
});

function canUseStorage() {
  return typeof window !== "undefined";
}

export function loadPlatform(): PlatformState {
  if (!canUseStorage()) {
    return seed();
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seed();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  try {
    const parsed = JSON.parse(raw) as PlatformState;
    if (!parsed.users?.length) {
      return seed();
    }
    return {
      ...parsed,
      kindergartens: (parsed.kindergartens ?? []).map(normalizeKindergarten),
      users: (parsed.users ?? []).map(normalizeUser),
      submissions: (parsed.submissions ?? []).map(normalizeSubmission),
    };
  } catch {
    return seed();
  }
}

function asText(value: unknown) {
  return typeof value === "string" ? value : value == null ? "" : String(value);
}

export function userMatchesLogin(
  user: Pick<PlatformUser, "username" | "displayName" | "email">,
  input: string,
) {
  const key = input.trim().toLowerCase();
  if (!key) {
    return false;
  }
  const aliases = new Set(
    [user.username, user.displayName, user.email]
      .map((value) => value.trim().toLowerCase())
      .filter(Boolean),
  );
  if (aliases.has("admin")) {
    aliases.add("admin@unicef.local");
  }
  return aliases.has(key);
}

export function deriveUsername(
  row: Partial<PlatformUser> & Record<string, unknown>,
) {
  const role = asText(row.role);
  if (role === "SUPER_ADMIN") {
    const existing = asText(row.username).trim();
    if (
      existing &&
      existing.toLowerCase() !== "unicef country office" &&
      existing.toLowerCase() !== "admin@unicef.local"
    ) {
      return existing;
    }
    return "admin";
  }
  const username = asText(row.username).trim();
  if (username) {
    return username;
  }
  const email = asText(row.email).trim();
  if (email.includes("@")) {
    return email.slice(0, email.indexOf("@"));
  }
  if (email) {
    return email;
  }
  return asText(row.displayName).trim();
}

export function childrenTotalFromAges(age4: string, age5: string) {
  const four = Number(age4) || 0;
  const five = Number(age5) || 0;
  return String(four + five);
}

export function nextKindergartenCode(sites: PlatformKindergarten[]) {
  let n = sites.length + 1;
  let code = `KG-${String(n).padStart(2, "0")}`;
  const used = new Set(sites.map((site) => site.code));
  while (used.has(code)) {
    n += 1;
    code = `KG-${String(n).padStart(2, "0")}`;
  }
  return code;
}

export function normalizeKindergarten(
  row: Partial<PlatformKindergarten> & Record<string, unknown>,
): PlatformKindergarten {
  const nameCkb = asText(row.nameCkb);
  const nameAr = asText(row.nameAr);
  const nameEn = asText(row.nameEn);
  const age4 = asText(row.childrenAge4);
  const age5 = asText(row.childrenAge5);
  const total =
    asText(row.childrenTotal) ||
    asText(row.childrenCount) ||
    childrenTotalFromAges(age4, age5);
  return {
    id: asText(row.id) || crypto.randomUUID(),
    code: asText(row.code),
    nameEn,
    nameAr,
    nameCkb,
    managerName: asText(row.managerName),
    managerMobile: asText(row.managerMobile),
    childrenAge4: age4,
    childrenAge5: age5,
    childrenTotal: total,
    educationDirectorateId: normalizeEducationDirectorateId(
      asText(row.educationDirectorateId),
    ),
    governorate: asText(row.governorate),
    address: asText(row.address),
    notes: asText(row.notes),
    childrenCount: total,
    staffCount: asText(row.staffCount),
    createdAt: asText(row.createdAt) || new Date().toISOString(),
  };
}

export function normalizeSubmission(
  row: Partial<PlatformSubmission> & Record<string, unknown>,
): PlatformSubmission {
  const form1Answers =
    row.form1Answers && typeof row.form1Answers === "object"
      ? Object.fromEntries(
          Object.entries(row.form1Answers as Record<string, unknown>).map(
            ([key, value]) => [key, asText(value)],
          ),
        )
      : {};
  const form2Plans: Record<string, Record<string, string>> = {};
  if (row.form2Plans && typeof row.form2Plans === "object") {
    for (const [section, fields] of Object.entries(
      row.form2Plans as Record<string, unknown>,
    )) {
      if (!fields || typeof fields !== "object") {
        continue;
      }
      form2Plans[section] = Object.fromEntries(
        Object.entries(fields as Record<string, unknown>).map(([key, value]) => [
          key,
          asText(value),
        ]),
      );
    }
  }
  return {
    id: asText(row.id) || crypto.randomUUID(),
    kindergartenId: asText(row.kindergartenId),
    formCode: row.formCode === "FORM_2" ? "FORM_2" : "FORM_1",
    submittedAt: asText(row.submittedAt) || new Date().toISOString(),
    form1Answers,
    form2Plans,
  };
}

export function latestSubmission(
  submissions: PlatformSubmission[],
  kindergartenId: string,
  formCode: "FORM_1" | "FORM_2",
) {
  return submissions
    .filter(
      (row) =>
        row.kindergartenId === kindergartenId && row.formCode === formCode,
    )
    .sort((a, b) => b.submittedAt.localeCompare(a.submittedAt))[0];
}

export function savePlatform(state: PlatformState) {
  if (!canUseStorage()) {
    return;
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function normalizeUser(
  row: Partial<PlatformUser> & Record<string, unknown>,
): PlatformUser {
  const role = USER_ROLES.includes(row.role as UserRole)
    ? (row.role as UserRole)
    : "KINDERGARTEN_MANAGER";
  const kindergartenId = asText(row.kindergartenId) || null;
  const educationDirectorateId =
    role === "DISTRICT_EDUCATION"
      ? normalizeEducationDirectorateId(asText(row.educationDirectorateId)) ||
        null
      : null;
  const assigned = Array.isArray(row.assignedKindergartenIds)
    ? row.assignedKindergartenIds.map((id) => String(id)).filter(Boolean)
    : [];
  if (kindergartenId && !assigned.includes(kindergartenId)) {
    assigned.unshift(kindergartenId);
  }
  const siteBound = role !== "SUPER_ADMIN" && role !== "DISTRICT_EDUCATION";
  const username = deriveUsername(row);
  const displayName = asText(row.displayName).trim() || username;
  return {
    id: asText(row.id) || crypto.randomUUID(),
    username,
    email: username,
    password: asText(row.password),
    displayName,
    role,
    kindergartenId: siteBound ? kindergartenId : null,
    educationDirectorateId,
    assignedKindergartenIds: siteBound ? [...new Set(assigned)] : [],
  };
}

export function userSiteIds(
  user: PlatformUser | undefined,
  kindergartens: PlatformKindergarten[] = [],
): string[] {
  if (!user || user.role === "SUPER_ADMIN") {
    return [];
  }
  if (user.role === "DISTRICT_EDUCATION") {
    const directorateId = user.educationDirectorateId;
    if (!directorateId) {
      return [];
    }
    return kindergartens
      .filter((site) => site.educationDirectorateId === directorateId)
      .map((site) => site.id);
  }
  const ids = new Set(user.assignedKindergartenIds);
  if (user.kindergartenId) {
    ids.add(user.kindergartenId);
  }
  return [...ids];
}

export function canAccessSite(
  user: PlatformUser | undefined,
  kindergartenId: string,
  kindergartens: PlatformKindergarten[] = [],
): boolean {
  if (!user) {
    return false;
  }
  if (user.role === "SUPER_ADMIN") {
    return true;
  }
  const ids = userSiteIds(user, kindergartens);
  if (ids.length === 0) {
    return false;
  }
  return ids.includes(kindergartenId);
}

export function kindergartenLabel(
  site: PlatformKindergarten,
  locale: AppLocale,
): string {
  if (locale === "ckb") {
    return site.nameCkb || site.nameAr || site.nameEn || site.code;
  }
  if (locale === "ar") {
    return site.nameAr || site.nameCkb || site.nameEn || site.code;
  }
  return site.nameEn || site.nameCkb || site.nameAr || site.code;
}

export function actorKindergartens(
  state: PlatformState,
  user: PlatformUser | undefined,
): PlatformKindergarten[] {
  if (!user) {
    return [];
  }
  if (user.role === "SUPER_ADMIN") {
    return state.kindergartens;
  }
  const ids = new Set(userSiteIds(user, state.kindergartens));
  if (ids.size === 0) {
    return [];
  }
  return state.kindergartens.filter((site) => ids.has(site.id));
}
