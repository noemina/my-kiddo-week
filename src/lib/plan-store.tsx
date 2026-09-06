"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Kid = { id: string; name: string; color: string };

export type Activity = {
  id: string;
  /** Shared across every day-of-week row created from the same "add recurring
   * activity" submission, so a "whole series" edit/delete can find its siblings. */
  seriesId: string;
  title: string;
  dayOfWeek: number; // 0 = Monday .. 6 = Sunday
  startTime: string;
  endTime: string | null;
  location: string | null;
  category: string | null;
  color: string | null;
  validFrom: string | null; // ISO date, e.g. "2026-09-01"
  validTo: string | null;
  includeInTypicalWeek: boolean;
  kidIds: string[];
  /** Dated occurrences (ISO dates) skipped because that single event was edited or cancelled. */
  excludeDates: string[];
};

export type ActivityException = {
  id: string;
  title: string;
  date: string; // ISO date
  startTime: string | null;
  endTime: string | null;
  location: string | null;
  notes: string | null;
  category: string | null;
  color: string | null;
  kidIds: string[];
};

export type MealType = "lunch" | "dinner";

export type MealEntry = {
  id: string;
  date: string; // ISO date — meals are planned per specific week, not recurring
  mealType: MealType;
  title: string;
  color: string | null;
  /** Empty = whole family / unscoped; non-empty = only these kids (a per-kid split). */
  kidIds: string[];
};

export type SchoolSubject = {
  id: string;
  title: string;
  color: string | null;
  kidIds: string[];
  daysOfWeek: number[]; // 0 = Monday .. 6 = Sunday — same time slot on every listed day
  startTime: string;
  endTime: string | null;
};

/** One independent notes field per planner — the activities planner (both
 * the dated and typical print views share this one), meals, and school each
 * have their own text, since what you'd jot down for one has nothing to do
 * with the others. */
export type PlanNotes = {
  planner: string;
  meals: string;
  school: string;
};

export type PlanData = {
  version: 1;
  familyName: string;
  kids: Kid[];
  activities: Activity[];
  exceptions: ActivityException[];
  /** Free-text notes shown/edited on each planner's print view — persisted
   * so they survive reloads and travel with save/load, instead of being
   * lost the moment you navigate away. */
  notes: PlanNotes;
  /** Separate from activities on purpose — its own weekly, dated (not
   * recurring) plan. Shares only the kid list. */
  meals: MealEntry[];
  /** Separate from activities on purpose — a recurring-only weekly
   * timetable (no dated exceptions, unlike activities). Shares only the
   * kid list. */
  schoolSubjects: SchoolSubject[];
};

export const EMPTY_PLAN: PlanData = {
  version: 1,
  familyName: "",
  kids: [],
  activities: [],
  exceptions: [],
  notes: { planner: "", meals: "", school: "" },
  meals: [],
  schoolSubjects: [],
};

const STORAGE_KEY = "my-kiddo-week:plan";

function isPlanData(value: unknown): value is PlanData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    typeof v.familyName === "string" &&
    Array.isArray(v.kids) &&
    Array.isArray(v.activities) &&
    Array.isArray(v.exceptions)
  );
}

// Legacy activities predate seriesId — each day-of-week was saved as its own
// row with no link back to the others created in the same "add recurring
// activity" submission. Reconstruct that link with a best-effort match on
// everything but the day itself, so existing multi-day activities get
// whole-series editing without the user having to re-enter them.
function normalizeActivities(activities: Activity[]): Activity[] {
  const seriesKeyToId = new Map<string, string>();
  return activities.map((a) => {
    const excludeDates = a.excludeDates ?? [];
    if (a.seriesId) return { ...a, excludeDates };
    const key = [
      a.title,
      a.startTime,
      a.endTime,
      a.location,
      a.category,
      [...a.kidIds].sort().join(","),
    ].join("|");
    let seriesId = seriesKeyToId.get(key);
    if (!seriesId) {
      seriesId = newId();
      seriesKeyToId.set(key, seriesId);
    }
    return { ...a, excludeDates, seriesId };
  });
}

// A pre-item-14 plan's `notes` was a single string (shared across every
// print view) — migrate it into the "planner" slot specifically, since that
// was the only print view notes existed on at the time.
function normalizeNotes(notes: unknown): PlanNotes {
  if (typeof notes === "string") return { planner: notes, meals: "", school: "" };
  const n = (notes ?? {}) as Partial<PlanNotes>;
  return { planner: n.planner ?? "", meals: n.meals ?? "", school: n.school ?? "" };
}

// Older exported/stored plans predate excludeDates/seriesId/notes — default
// them in rather than letting every reader guard against undefined.
function normalizePlan(plan: PlanData): PlanData {
  return {
    ...plan,
    notes: normalizeNotes(plan.notes),
    meals: plan.meals ?? [],
    schoolSubjects: plan.schoolSubjects ?? [],
    activities: normalizeActivities(plan.activities),
  };
}

// Upserts by id: an incoming kid (from a loaded file) overwrites a local
// kid sharing its id, but kids only present locally are left untouched —
// loading e.g. a School file should restore/refresh the kids it needs
// without deleting kids that only Meals or the Planner currently use.
function mergeKids(existing: Kid[], incoming: Kid[]): Kid[] {
  const byId = new Map(existing.map((k) => [k.id, k] as const));
  for (const k of incoming) byId.set(k.id, k);
  return Array.from(byId.values());
}

function downloadJson(data: unknown, fileName: string) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function safeFileNamePart(value: string): string {
  return (value || "my-kiddo-week").trim().replace(/[^a-z0-9-_]+/gi, "-") || "my-kiddo-week";
}

// Each planner's Save/Load is self-contained (family name + kids + that
// planner's own data + its own notes) so the file works standalone even on
// a browser with no kids set up yet — not just a fragment that assumes the
// referenced kids already exist.
export type PlannerExport = {
  version: 1;
  kind: "planner";
  familyName: string;
  kids: Kid[];
  activities: Activity[];
  exceptions: ActivityException[];
  notes: string;
};

export type MealsExport = {
  version: 1;
  kind: "meals";
  familyName: string;
  kids: Kid[];
  meals: MealEntry[];
  notes: string;
};

export type SchoolExport = {
  version: 1;
  kind: "school";
  familyName: string;
  kids: Kid[];
  schoolSubjects: SchoolSubject[];
  notes: string;
};

function isPlannerExport(value: unknown): value is PlannerExport {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 &&
    v.kind === "planner" &&
    Array.isArray(v.kids) &&
    Array.isArray(v.activities) &&
    Array.isArray(v.exceptions)
  );
}

function isMealsExport(value: unknown): value is MealsExport {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return v.version === 1 && v.kind === "meals" && Array.isArray(v.kids) && Array.isArray(v.meals);
}

function isSchoolExport(value: unknown): value is SchoolExport {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  return (
    v.version === 1 && v.kind === "school" && Array.isArray(v.kids) && Array.isArray(v.schoolSubjects)
  );
}

function loadFromStorage(): PlanData {
  if (typeof window === "undefined") return EMPTY_PLAN;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PLAN;
    const parsed = JSON.parse(raw);
    return isPlanData(parsed) ? normalizePlan(parsed) : EMPTY_PLAN;
  } catch {
    return EMPTY_PLAN;
  }
}

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export type PlanStore = {
  plan: PlanData;
  hydrated: boolean;
  setFamilyName: (name: string) => void;
  setNotes: (scope: keyof PlanNotes, value: string) => void;
  addKid: (kid: Omit<Kid, "id">) => void;
  updateKid: (id: string, patch: Partial<Omit<Kid, "id">>) => void;
  removeKid: (id: string) => void;
  addActivity: (activity: Omit<Activity, "id" | "excludeDates">) => void;
  /** Updates every day-of-week row sharing this seriesId (a "whole series" edit). */
  updateActivitySeries: (
    seriesId: string,
    patch: Partial<Pick<Activity, "title" | "startTime" | "endTime" | "location" | "category" | "color" | "kidIds">>
  ) => void;
  /** Removes every day-of-week row sharing this seriesId (a "whole series" delete). */
  removeActivitySeries: (seriesId: string) => void;
  /** Skips a single dated occurrence of a recurring activity (edit-this-one or cancel-this-one). */
  skipActivityOccurrence: (activityId: string, date: string) => void;
  addException: (exception: Omit<ActivityException, "id">) => void;
  updateException: (id: string, patch: Partial<Omit<ActivityException, "id">>) => void;
  removeException: (id: string) => void;
  /** Self-contained (family name + kids + activities/exceptions + planner
   * notes) so the file works standalone, e.g. on a browser with no kids yet. */
  exportPlannerData: () => void;
  importPlannerData: (file: File) => Promise<void>;
  /** Clears only activities/exceptions/planner-notes — kids, meals, and
   * school data are untouched. */
  clearPlannerData: () => void;
  addMeal: (meal: Omit<MealEntry, "id">) => void;
  updateMeal: (id: string, patch: Partial<Omit<MealEntry, "id">>) => void;
  removeMeal: (id: string) => void;
  exportMealsData: () => void;
  importMealsData: (file: File) => Promise<void>;
  clearMealsData: () => void;
  addSchoolSubject: (subject: Omit<SchoolSubject, "id">) => void;
  updateSchoolSubject: (id: string, patch: Partial<Omit<SchoolSubject, "id">>) => void;
  removeSchoolSubject: (id: string) => void;
  exportSchoolData: () => void;
  importSchoolData: (file: File) => Promise<void>;
  clearSchoolData: () => void;
};

const PlanStoreContext = createContext<PlanStore | null>(null);

export function PlanStoreProvider({ children }: { children: ReactNode }) {
  const [plan, setPlan] = useState<PlanData>(EMPTY_PLAN);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // localStorage isn't available during server rendering, so the first
    // render must match the server (EMPTY_PLAN) and only then swap in the
    // real, possibly-different client-only value — an unavoidable one-time
    // setState-in-effect for this exact SSR-hydration pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setPlan(loadFromStorage());
    setHydrated(true);
  }, []);

  // Gated on `hydrated` state (not a ref): a ref mutated inside the effect
  // above would already read as true by the time this effect's closure runs
  // in the SAME initial commit, while `plan` in that same closure is still
  // last render's EMPTY_PLAN — clobbering real data with an empty plan
  // before the hydrated state/plan pair ever gets committed together. State
  // closures stay pinned to their own render, so this can't race.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
    } catch {
      // Storage can be unavailable (private browsing, quota) — the in-memory
      // plan still works for the current session, just won't survive reload.
    }
  }, [plan, hydrated]);

  const store: PlanStore = {
    plan,
    hydrated,
    setFamilyName: (name) => setPlan((p) => ({ ...p, familyName: name })),
    setNotes: (scope, value) =>
      setPlan((p) => ({ ...p, notes: { ...p.notes, [scope]: value } })),
    addKid: (kid) => setPlan((p) => ({ ...p, kids: [...p.kids, { ...kid, id: newId() }] })),
    updateKid: (id, patch) =>
      setPlan((p) => ({
        ...p,
        kids: p.kids.map((k) => (k.id === id ? { ...k, ...patch } : k)),
      })),
    removeKid: (id) =>
      setPlan((p) => ({
        ...p,
        kids: p.kids.filter((k) => k.id !== id),
        activities: p.activities
          .map((a) => ({ ...a, kidIds: a.kidIds.filter((k) => k !== id) }))
          .filter((a) => a.kidIds.length > 0),
        exceptions: p.exceptions
          .map((e) => ({ ...e, kidIds: e.kidIds.filter((k) => k !== id) }))
          .filter((e) => e.kidIds.length > 0),
        // A family-wide meal (empty kidIds) is left alone — it was never
        // tied to specific kids. A per-kid meal is trimmed, and dropped
        // only if the removed kid was the sole kid it was scoped to.
        meals: p.meals.reduce<MealEntry[]>((acc, m) => {
          if (m.kidIds.length === 0) {
            acc.push(m);
            return acc;
          }
          const remaining = m.kidIds.filter((k) => k !== id);
          if (remaining.length > 0) acc.push({ ...m, kidIds: remaining });
          return acc;
        }, []),
        schoolSubjects: p.schoolSubjects
          .map((s) => ({ ...s, kidIds: s.kidIds.filter((k) => k !== id) }))
          .filter((s) => s.kidIds.length > 0),
      })),
    addActivity: (activity) =>
      setPlan((p) => ({
        ...p,
        activities: [...p.activities, { ...activity, id: newId(), excludeDates: [] }],
      })),
    updateActivitySeries: (seriesId, patch) =>
      setPlan((p) => ({
        ...p,
        activities: p.activities.map((a) => (a.seriesId === seriesId ? { ...a, ...patch } : a)),
      })),
    removeActivitySeries: (seriesId) =>
      setPlan((p) => ({
        ...p,
        activities: p.activities.filter((a) => a.seriesId !== seriesId),
      })),
    skipActivityOccurrence: (activityId, date) =>
      setPlan((p) => ({
        ...p,
        activities: p.activities.map((a) =>
          a.id === activityId ? { ...a, excludeDates: [...a.excludeDates, date] } : a
        ),
      })),
    addException: (exception) =>
      setPlan((p) => ({ ...p, exceptions: [...p.exceptions, { ...exception, id: newId() }] })),
    updateException: (id, patch) =>
      setPlan((p) => ({
        ...p,
        exceptions: p.exceptions.map((e) => (e.id === id ? { ...e, ...patch } : e)),
      })),
    removeException: (id) =>
      setPlan((p) => ({ ...p, exceptions: p.exceptions.filter((e) => e.id !== id) })),
    exportPlannerData: () =>
      downloadJson(
        {
          version: 1,
          kind: "planner",
          familyName: plan.familyName,
          kids: plan.kids,
          activities: plan.activities,
          exceptions: plan.exceptions,
          notes: plan.notes.planner,
        },
        `${safeFileNamePart(plan.familyName)}-planner.kiddoweek.json`
      ),
    importPlannerData: async (file) => {
      const parsed = JSON.parse(await file.text());
      if (!isPlannerExport(parsed)) throw new Error("invalid");
      setPlan((p) => ({
        ...p,
        familyName: p.familyName || parsed.familyName,
        kids: mergeKids(p.kids, parsed.kids),
        activities: normalizeActivities(parsed.activities),
        exceptions: parsed.exceptions,
        notes: { ...p.notes, planner: parsed.notes ?? "" },
      }));
    },
    clearPlannerData: () =>
      setPlan((p) => ({
        ...p,
        activities: [],
        exceptions: [],
        notes: { ...p.notes, planner: "" },
      })),
    addMeal: (meal) =>
      setPlan((p) => ({ ...p, meals: [...p.meals, { ...meal, id: newId() }] })),
    updateMeal: (id, patch) =>
      setPlan((p) => ({
        ...p,
        meals: p.meals.map((m) => (m.id === id ? { ...m, ...patch } : m)),
      })),
    removeMeal: (id) => setPlan((p) => ({ ...p, meals: p.meals.filter((m) => m.id !== id) })),
    exportMealsData: () =>
      downloadJson(
        {
          version: 1,
          kind: "meals",
          familyName: plan.familyName,
          kids: plan.kids,
          meals: plan.meals,
          notes: plan.notes.meals,
        },
        `${safeFileNamePart(plan.familyName)}-meals.kiddoweek.json`
      ),
    importMealsData: async (file) => {
      const parsed = JSON.parse(await file.text());
      if (!isMealsExport(parsed)) throw new Error("invalid");
      setPlan((p) => ({
        ...p,
        familyName: p.familyName || parsed.familyName,
        kids: mergeKids(p.kids, parsed.kids),
        meals: parsed.meals,
        notes: { ...p.notes, meals: parsed.notes ?? "" },
      }));
    },
    clearMealsData: () =>
      setPlan((p) => ({ ...p, meals: [], notes: { ...p.notes, meals: "" } })),
    addSchoolSubject: (subject) =>
      setPlan((p) => ({
        ...p,
        schoolSubjects: [...p.schoolSubjects, { ...subject, id: newId() }],
      })),
    updateSchoolSubject: (id, patch) =>
      setPlan((p) => ({
        ...p,
        schoolSubjects: p.schoolSubjects.map((s) => (s.id === id ? { ...s, ...patch } : s)),
      })),
    removeSchoolSubject: (id) =>
      setPlan((p) => ({
        ...p,
        schoolSubjects: p.schoolSubjects.filter((s) => s.id !== id),
      })),
    exportSchoolData: () =>
      downloadJson(
        {
          version: 1,
          kind: "school",
          familyName: plan.familyName,
          kids: plan.kids,
          schoolSubjects: plan.schoolSubjects,
          notes: plan.notes.school,
        },
        `${safeFileNamePart(plan.familyName)}-school.kiddoweek.json`
      ),
    importSchoolData: async (file) => {
      const parsed = JSON.parse(await file.text());
      if (!isSchoolExport(parsed)) throw new Error("invalid");
      setPlan((p) => ({
        ...p,
        familyName: p.familyName || parsed.familyName,
        kids: mergeKids(p.kids, parsed.kids),
        schoolSubjects: parsed.schoolSubjects,
        notes: { ...p.notes, school: parsed.notes ?? "" },
      }));
    },
    clearSchoolData: () =>
      setPlan((p) => ({ ...p, schoolSubjects: [], notes: { ...p.notes, school: "" } })),
  };

  return <PlanStoreContext.Provider value={store}>{children}</PlanStoreContext.Provider>;
}

export function usePlanStore(): PlanStore {
  const ctx = useContext(PlanStoreContext);
  if (!ctx) throw new Error("usePlanStore must be used within PlanStoreProvider");
  return ctx;
}
