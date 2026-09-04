"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { setActiveFamilyAction } from "@/lib/actions/family-actions";

type Membership = {
  familyId: string;
  family: { name: string };
};

export function FamilySwitcher({ memberships }: { memberships: Membership[] }) {
  const formRef = useRef<HTMLFormElement>(null);
  const t = useTranslations("Nav");

  return (
    <form ref={formRef} action={setActiveFamilyAction}>
      <select
        name="familyId"
        defaultValue=""
        onChange={() => formRef.current?.requestSubmit()}
        className="rounded-md border border-gray-300 px-2 py-1 text-sm"
        aria-label={t("switchFamily")}
      >
        <option value="" disabled>
          {t("switchFamily")}
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
