"use client";

import { useRef } from "react";
import { setActiveFamilyAction } from "@/lib/actions/family-actions";

type Membership = {
  familyId: string;
  family: { name: string };
};

export function FamilySwitcher({ memberships }: { memberships: Membership[] }) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={setActiveFamilyAction}>
      <select
        name="familyId"
        defaultValue=""
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        aria-label="Switch family"
      >
        <option value="" disabled>
          Switch family…
        </option>
        {memberships.map((m) => (
          <option key={m.familyId} value={m.familyId}>
            {m.family.name}
          </option>
        ))}
      </select>
    </form>
  );
}
