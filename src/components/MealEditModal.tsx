"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { usePlanStore, type MealEntry } from "@/lib/plan-store";
import { ColorPicker } from "@/components/ColorPicker";

type Props = {
  meal: MealEntry;
  onClose: () => void;
};

export function MealEditModal({ meal, onClose }: Props) {
  const t = useTranslations("Meals");
  const tPlanner = useTranslations("Planner");
  const { plan, updateMeal, removeMeal } = usePlanStore();

  const [title, setTitle] = useState(meal.title);
  const [color, setColor] = useState(meal.color ?? "");
  const [kidIds, setKidIds] = useState<string[]>(meal.kidIds);

  function handleSave() {
    if (!title.trim()) return;
    updateMeal(meal.id, { title: title.trim(), color: color || null, kidIds });
    onClose();
  }

  function handleDelete() {
    removeMeal(meal.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white p-5 dark:bg-gray-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold">{t("editMeal")}</h2>

        <div className="mt-4 flex flex-col gap-3 text-sm">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
          />

          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1">{tPlanner("color")}</legend>
            <ColorPicker value={color} onChange={setColor} autoTitle={tPlanner("colorAuto")} />
          </fieldset>

          {plan.kids.length > 0 && (
            <fieldset className="flex flex-col gap-1">
              <legend className="mb-1">{t("kidsOptional")}</legend>
              <div className="flex flex-wrap gap-3">
                {plan.kids.map((kid) => (
                  <label key={kid.id} className="flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      checked={kidIds.includes(kid.id)}
                      onChange={(e) =>
                        setKidIds((prev) =>
                          e.target.checked ? [...prev, kid.id] : prev.filter((id) => id !== kid.id)
                        )
                      }
                    />
                    {kid.name}
                  </label>
                ))}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t("kidsOptionalHint")}
              </p>
            </fieldset>
          )}
        </div>

        <div className="mt-5 flex flex-col gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="flex-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              {t("save")}
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 dark:border-red-900 dark:hover:bg-red-950/40"
            >
              {t("delete")}
            </button>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md px-3 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {t("cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}
