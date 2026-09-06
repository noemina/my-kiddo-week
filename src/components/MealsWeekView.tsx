"use client";

import { useLocale } from "next-intl";
import { formatDayHeader, weekdayName } from "@/lib/week";
import type { MealsWeekDay } from "@/lib/meals-data";
import type { Kid, MealEntry } from "@/lib/plan-store";

function MealRow({
  meals,
  kids,
  onClick,
}: {
  meals: MealEntry[];
  kids: Kid[];
  onClick?: (meal: MealEntry) => void;
}) {
  return (
    <ul className="flex flex-col gap-1">
      {meals.map((meal) => (
        <li
          key={meal.id}
          className="cursor-pointer rounded-md border-l-4 bg-gray-50 px-2 py-1.5 text-xs leading-tight hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
          style={{ borderLeftColor: meal.color ?? "#6366f1" }}
          onClick={() => onClick?.(meal)}
        >
          <p className="font-medium text-gray-900 dark:text-gray-100">{meal.title}</p>
          {meal.kidIds.length > 0 && (
            <p className="text-gray-500 dark:text-gray-400">
              {meal.kidIds
                .map((id) => kids.find((k) => k.id === id)?.name)
                .filter(Boolean)
                .join(" & ")}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}

export function MealsWeekView({
  days,
  kids,
  mealLabels,
  onEntryClick,
}: {
  days: MealsWeekDay[];
  kids: Kid[];
  mealLabels: { lunch: string; dinner: string };
  onEntryClick?: (meal: MealEntry) => void;
}) {
  const locale = useLocale();

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-7 sm:gap-2">
      {days.map((day, dayIndex) => (
        <div key={dayIndex} className="flex flex-col gap-2">
          <div className="border-b border-gray-200 pb-1 text-center dark:border-gray-800">
            <p className="text-sm font-semibold">{weekdayName(dayIndex, locale)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatDayHeader(day.date, locale)}
            </p>
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {mealLabels.lunch}
            </p>
            <MealRow meals={day.lunch} kids={kids} onClick={onEntryClick} />
          </div>

          <div className="flex flex-col gap-1">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {mealLabels.dinner}
            </p>
            <MealRow meals={day.dinner} kids={kids} onClick={onEntryClick} />
          </div>
        </div>
      ))}
    </div>
  );
}
