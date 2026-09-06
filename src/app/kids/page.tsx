"use client";

import { type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { AppNav } from "@/components/AppNav";
import { usePlanStore } from "@/lib/plan-store";

const DEFAULT_COLORS = ["#6366f1", "#ec4899", "#10b981", "#f59e0b", "#3b82f6", "#ef4444"];

export default function KidsPage() {
  const t = useTranslations("Kids");
  const tStorage = useTranslations("Storage");
  const { plan, setFamilyName, addKid, removeKid } = usePlanStore();

  function handleAddKid(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    const name = String(data.get("name") ?? "").trim();
    const color = String(data.get("color") ?? DEFAULT_COLORS[0]);
    if (!name) return;
    addKid({ name, color });
    form.reset();
  }

  return (
    <>
      <AppNav active="kids" />
      <main className="mx-auto w-full max-w-2xl flex-1 px-6 py-8">
        <h1 className="text-lg font-semibold">{t("title")}</h1>
        <p className="mt-1 text-xs text-gray-500">{tStorage("hint")}</p>

        <label className="mt-4 flex flex-col gap-1 text-sm">
          {t("planName")}
          <input
            defaultValue={plan.familyName}
            onBlur={(e) => setFamilyName(e.target.value.trim())}
            placeholder={t("planNamePlaceholder")}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
        </label>

        <ul className="mt-6 flex flex-col gap-2">
          {plan.kids.map((kid) => (
            <li
              key={kid.id}
              className="flex items-center justify-between rounded-md border border-gray-200 px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <span
                  className="h-3 w-3 rounded-full"
                  style={{ backgroundColor: kid.color }}
                  aria-hidden
                />
                <span className="font-medium">{kid.name}</span>
              </div>
              <button
                type="button"
                onClick={() => removeKid(kid.id)}
                className="text-sm text-gray-400 hover:text-red-600"
              >
                {t("remove")}
              </button>
            </li>
          ))}
          {plan.kids.length === 0 && <p className="text-sm text-gray-500">{t("empty")}</p>}
        </ul>

        <form
          onSubmit={handleAddKid}
          className="mt-8 flex flex-col gap-3 rounded-md border border-gray-200 p-4 text-sm"
        >
          <h2 className="font-semibold">{t("addTitle")}</h2>
          <input
            name="name"
            required
            placeholder={t("namePlaceholder")}
            className="rounded-md border border-gray-300 px-3 py-2"
          />
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1">{t("color")}</legend>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_COLORS.map((color, i) => (
                <label key={color} className="cursor-pointer">
                  <input
                    type="radio"
                    name="color"
                    value={color}
                    defaultChecked={i === plan.kids.length % DEFAULT_COLORS.length}
                    className="peer sr-only"
                  />
                  <span
                    className="block h-8 w-8 rounded-full ring-1 ring-gray-200 ring-offset-2 peer-checked:ring-2 peer-checked:ring-gray-900"
                    style={{ backgroundColor: color }}
                    aria-hidden
                  />
                </label>
              ))}
            </div>
          </fieldset>
          <button
            type="submit"
            className="mt-1 rounded-md bg-indigo-600 px-4 py-2 font-medium text-white"
          >
            {t("addButton")}
          </button>
        </form>
      </main>
    </>
  );
}
