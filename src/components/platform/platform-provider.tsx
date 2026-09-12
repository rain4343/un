"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { UserRole } from "@/lib/rbac";
import { canSubmitForm, canWriteSite } from "@/lib/rbac";
import {
  actorKindergartens,
  canAccessSite,
  childrenTotalFromAges,
  loadPlatform,
  nextKindergartenCode,
  savePlatform,
  userMatchesLogin,
  userSiteIds,
  type PlatformKindergarten,
  type PlatformState,
  type PlatformSubmission,
  type PlatformUser,
} from "@/lib/platform-store";
import { normalizeEducationDirectorateId } from "@/content/education-directorates";

type PlatformContextValue = {
  ready: boolean;
  state: PlatformState;
  currentUser: PlatformUser | undefined;
  myKindergartens: PlatformKindergarten[];
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addKindergarten: (input: {
    name: string;
    managerName: string;
    managerMobile: string;
    educationDirectorateId: string;
    childrenAge4: string;
    childrenAge5: string;
  }) => string | null;
  addUserToKindergarten: (input: {
    kindergartenId: string;
    educationDirectorateId?: string;
    displayName: string;
    password: string;
    role: UserRole;
  }) => string | null;
  updateKindergarten: (
    id: string,
    patch: Partial<PlatformKindergarten>,
  ) => boolean;
  deleteKindergarten: (id: string) => boolean;
  saveSubmission: (input: {
    kindergartenId: string;
    formCode: "FORM_1" | "FORM_2";
    form1Answers?: Record<string, string>;
    form2Plans?: Record<string, Record<string, string>>;
  }) => boolean;
};

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<PlatformState>(() => ({
    kindergartens: [],
    users: [],
    children: [],
    submissions: [],
    sessionUserId: null,
  }));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setState(loadPlatform());
    setReady(true);
  }, []);

  const commit = useCallback((next: PlatformState) => {
    setState(next);
    savePlatform(next);
  }, []);

  const currentUser = useMemo(
    () => state.users.find((user) => user.id === state.sessionUserId),
    [state],
  );

  const myKindergartens = useMemo(
    () => actorKindergartens(state, currentUser),
    [state, currentUser],
  );

  const login = useCallback(
    (username: string, password: string) => {
      const user = state.users.find(
        (row) => userMatchesLogin(row, username) && row.password === password,
      );
      if (!user) {
        return false;
      }
      commit({ ...state, sessionUserId: user.id });
      return true;
    },
    [commit, state],
  );

  const logout = useCallback(() => {
    commit({ ...state, sessionUserId: null });
  }, [commit, state]);

  const addKindergarten = useCallback(
    (input: {
      name: string;
      managerName: string;
      managerMobile: string;
      educationDirectorateId: string;
      childrenAge4: string;
      childrenAge5: string;
    }) => {
      if (!currentUser) {
        return "need_login";
      }
      if (currentUser.role !== "SUPER_ADMIN") {
        return "forbidden";
      }
      const name = input.name.trim();
      if (!name) {
        return "missing_name";
      }
      const total = childrenTotalFromAges(
        input.childrenAge4,
        input.childrenAge5,
      );
      const site: PlatformKindergarten = {
        id: crypto.randomUUID(),
        code: nextKindergartenCode(state.kindergartens),
        nameEn: name,
        nameAr: name,
        nameCkb: name,
        managerName: input.managerName.trim(),
        managerMobile: input.managerMobile.trim(),
        childrenAge4: input.childrenAge4.trim(),
        childrenAge5: input.childrenAge5.trim(),
        childrenTotal: total,
        educationDirectorateId: normalizeEducationDirectorateId(
          input.educationDirectorateId,
        ),
        governorate: "",
        address: "",
        notes: "",
        childrenCount: total,
        staffCount: "",
        createdAt: new Date().toISOString(),
      };
      commit({
        ...state,
        kindergartens: [...state.kindergartens, site],
      });
      return null;
    },
    [commit, currentUser, state],
  );

  const addUserToKindergarten = useCallback(
    (input: {
      kindergartenId: string;
      educationDirectorateId?: string;
      displayName: string;
      password: string;
      role: UserRole;
    }) => {
      if (currentUser?.role !== "SUPER_ADMIN") {
        return "forbidden";
      }
      if (input.role === "SUPER_ADMIN") {
        return "forbidden";
      }
      const displayName = input.displayName.trim();
      if (!displayName) {
        return "missing_name";
      }
      const username = displayName;
      if (state.users.some((user) => userMatchesLogin(user, username))) {
        return "duplicate_name";
      }
      if (input.role === "DISTRICT_EDUCATION") {
        const educationDirectorateId = normalizeEducationDirectorateId(
          input.educationDirectorateId ?? "",
        );
        if (!educationDirectorateId) {
          return "missing_directorate";
        }
        const user: PlatformUser = {
          id: crypto.randomUUID(),
          username,
          email: username,
          password: input.password,
          displayName,
          role: input.role,
          kindergartenId: null,
          educationDirectorateId,
          assignedKindergartenIds: [],
        };
        commit({ ...state, users: [...state.users, user] });
        return null;
      }
      const kindergartenId = input.kindergartenId.trim();
      if (!kindergartenId || !state.kindergartens.some((site) => site.id === kindergartenId)) {
        return "missing_site";
      }
      const user: PlatformUser = {
        id: crypto.randomUUID(),
        username,
        email: username,
        password: input.password,
        displayName,
        role: input.role,
        kindergartenId,
        educationDirectorateId: null,
        assignedKindergartenIds: [kindergartenId],
      };
      commit({ ...state, users: [...state.users, user] });
      return null;
    },
    [commit, currentUser, state],
  );

  const updateKindergarten = useCallback(
    (id: string, patch: Partial<PlatformKindergarten>) => {
      if (!canAccessSite(currentUser, id, state.kindergartens)) {
        return false;
      }
      if (!currentUser || !canWriteSite(currentUser.role)) {
        return false;
      }
      commit({
        ...state,
        kindergartens: state.kindergartens.map((site) => {
          if (site.id !== id) {
            return site;
          }
          const next = {
            ...site,
            ...patch,
            id: site.id,
            educationDirectorateId: normalizeEducationDirectorateId(
              patch.educationDirectorateId ?? site.educationDirectorateId,
            ),
          };
          const total = childrenTotalFromAges(
            next.childrenAge4,
            next.childrenAge5,
          );
          return { ...next, childrenTotal: total, childrenCount: total };
        }),
      });
      return true;
    },
    [commit, currentUser, state],
  );

  const deleteKindergarten = useCallback(
    (id: string) => {
      if (currentUser?.role !== "SUPER_ADMIN") {
        return false;
      }
      if (!state.kindergartens.some((site) => site.id === id)) {
        return false;
      }
      commit({
        ...state,
        kindergartens: state.kindergartens.filter((site) => site.id !== id),
        children: state.children.filter((child) => child.kindergartenId !== id),
        submissions: (state.submissions ?? []).filter(
          (row) => row.kindergartenId !== id,
        ),
        users: state.users
          .map((user) => {
            if (user.role === "SUPER_ADMIN") {
              return user;
            }
            const assigned = user.assignedKindergartenIds.filter(
              (siteId) => siteId !== id,
            );
            const kindergartenId =
              user.kindergartenId === id
                ? (assigned[0] ?? null)
                : user.kindergartenId;
            return {
              ...user,
              kindergartenId,
              assignedKindergartenIds: assigned,
            };
          })
          .filter(
            (user) =>
              user.role === "SUPER_ADMIN" ||
              user.role === "DISTRICT_EDUCATION" ||
              Boolean(user.kindergartenId && user.assignedKindergartenIds.length),
          ),
      });
      return true;
    },
    [commit, currentUser, state],
  );

  const saveSubmission = useCallback(
    (input: {
      kindergartenId: string;
      formCode: "FORM_1" | "FORM_2";
      form1Answers?: Record<string, string>;
      form2Plans?: Record<string, Record<string, string>>;
    }) => {
      if (!canAccessSite(currentUser, input.kindergartenId, state.kindergartens)) {
        return false;
      }
      if (!currentUser || !canSubmitForm(currentUser.role, input.formCode)) {
        return false;
      }
      const row: PlatformSubmission = {
        id: crypto.randomUUID(),
        kindergartenId: input.kindergartenId,
        formCode: input.formCode,
        submittedAt: new Date().toISOString(),
        form1Answers: input.form1Answers ?? {},
        form2Plans: input.form2Plans ?? {},
      };
      const rest = (state.submissions ?? []).filter(
        (item) =>
          !(
            item.kindergartenId === row.kindergartenId &&
            item.formCode === row.formCode
          ),
      );
      commit({ ...state, submissions: [...rest, row] });
      return true;
    },
    [commit, currentUser, state],
  );

  const visibleState = useMemo((): PlatformState => {
    if (!currentUser) {
      return {
        ...state,
        kindergartens: [],
        users: [],
        children: [],
        submissions: [],
      };
    }
    if (currentUser.role === "SUPER_ADMIN") {
      return { ...state, submissions: state.submissions ?? [] };
    }
    const ids = new Set(userSiteIds(currentUser, state.kindergartens));
    return {
      ...state,
      kindergartens: state.kindergartens.filter((site) => ids.has(site.id)),
      users: state.users.filter((user) => user.id === currentUser.id),
      children: state.children.filter((child) => ids.has(child.kindergartenId)),
      submissions: (state.submissions ?? []).filter((row) =>
        ids.has(row.kindergartenId),
      ),
    };
  }, [currentUser, state]);

  const value = useMemo(
    () => ({
      ready,
      state: visibleState,
      currentUser,
      myKindergartens,
      login,
      logout,
      addKindergarten,
      addUserToKindergarten,
      updateKindergarten,
      deleteKindergarten,
      saveSubmission,
    }),
    [
      ready,
      visibleState,
      currentUser,
      myKindergartens,
      login,
      logout,
      addKindergarten,
      addUserToKindergarten,
      updateKindergarten,
      deleteKindergarten,
      saveSubmission,
    ],
  );

  return (
    <PlatformContext.Provider value={value}>{children}</PlatformContext.Provider>
  );
}

export function usePlatform() {
  const value = useContext(PlatformContext);
  if (!value) {
    throw new Error("usePlatform must be used within PlatformProvider");
  }
  return value;
}
