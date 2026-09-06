import { weekDays, isoDate } from "@/lib/week";
import type { PlanData, MealEntry } from "@/lib/plan-store";

export type MealsWeekDay = {
  date: Date;
  lunch: MealEntry[];
  dinner: MealEntry[];
};

/** Meals are dated, not recurring — a plain per-day lookup, no series/typical-week concept. */
export function getWeekMeals(plan: PlanData, weekStart: Date): MealsWeekDay[] {
  return weekDays(weekStart).map((date) => {
    const dateIso = isoDate(date);
    const dayMeals = plan.meals.filter((m) => m.date === dateIso);
    return {
      date,
      lunch: dayMeals.filter((m) => m.mealType === "lunch"),
      dinner: dayMeals.filter((m) => m.mealType === "dinner"),
    };
  });
}
