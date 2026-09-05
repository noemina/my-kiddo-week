"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Kid = { id: string; name: string; color: string };

export type Activity = {
  id: string;
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

export type PlanData = {
  version: 1;
  familyName: string;
  kids: Kid[];
  activities: Activity[];
  exceptions: ActivityException[];
};

export const EMPTY_PLAN: PlanData = {
  version: 1,
  familyName: "",
  kids: [],
  activities: [],
  exceptions: [],
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

function loadFromStorage(): PlanData {
  if (typeof window === "undefined") return EMPTY_PLAN;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_PLAN;
    const parsed = JSON.parse(raw);
    return isPlanData(parsed) ? parsed : EMPTY_PLAN;
  } catch {
    return EMPTY_PLAN;
  }
}

function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export type PlanStore = {
  plan: PlanData;
  hydrated: boolean;
  setFamilyName: (name: string) => void;
  addKid: (kid: Omit<Kid, "id">) => void;
  removeKid: (id: string) => void;
  addActivity: (activity: Omit<Activity, "id">) => void;
  removeActivity: (id: string) => void;
  addException: (exception: Omit<ActivityException, "id">) => void;
  removeException: (id: string) => void;
  exportPlan: () => void;
  importPlan: (file: File) => Promise<void>;
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
    addKid: (kid) => setPlan((p) => ({ ...p, kids: [...p.kids, { ...kid, id: newId() }] })),
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
      })),
    addActivity: (activity) =>
      setPlan((p) => ({ ...p, activities: [...p.activities, { ...activity, id: newId() }] })),
    removeActivity: (id) =>
      setPlan((p) => ({ ...p, activities: p.activities.filter((a) => a.id !== id) })),
    addException: (exception) =>
      setPlan((p) => ({ ...p, exceptions: [...p.exceptions, { ...exception, id: newId() }] })),
    removeException: (id) =>
      setPlan((p) => ({ ...p, exceptions: p.exceptions.filter((e) => e.id !== id) })),
    exportPlan: () => {
      const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const safeName = (plan.familyName || "my-kiddo-week").trim().replace(/[^a-z0-9-_]+/gi, "-");
      a.download = `${safeName || "my-kiddo-week"}.kiddoweek.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    },
    importPlan: async (file) => {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!isPlanData(parsed)) throw new Error("invalid");
      setPlan(parsed);
    },
  };

  return <PlanStoreContext.Provider value={store}>{children}</PlanStoreContext.Provider>;
}

export function usePlanStore(): PlanStore {
  const ctx = useContext(PlanStoreContext);
  if (!ctx) throw new Error("usePlanStore must be used within PlanStoreProvider");
  return ctx;
}
