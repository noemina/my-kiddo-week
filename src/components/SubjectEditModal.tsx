"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { usePlanStore, type SchoolSubject } from "@/lib/plan-store";
import { ColorPicker } from "@/components/ColorPicker";
import { weekdayName } from "@/lib/week";

type Props = {
  subject: SchoolSubject;
  onClose: () => void;
};

export function SubjectEditModal({ subject, onClose }: Props) {
  const t = useTranslations("School");
  const tPlanner = useTranslations("Planner");
  const locale = useLocale();
  const { plan, updateSchoolSubject, removeSchoolSubject } = usePlanStore();

  const [title, setTitle] = useState(subject.title);
  const [color, setColor] = useState(subject.color ?? "");
  const [kidIds, setKidIds] = useState<string[]>(subject.kidIds);
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>(subject.daysOfWeek);
  const [startTime, setStartTime] = useState(subject.startTime);
  const [endTime, setEndTime] = useState(subject.endTime ?? "");
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (kidIds.length === 0) return setError(t("kidRequired"));
    if (daysOfWeek.length === 0) return setError(t("dayRequired"));
    if (!title.trim() || !startTime) return setError(t("invalidInput"));
    updateSchoolSubject(subject.id, {
      title: title.trim(),
      color: color || null,
      kidIds,
      daysOfWeek,
      startTime,
      endTime: endTime || null,
    });
    onClose();
  }

  function handleDelete() {
    removeSchoolSubject(subject.id);
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
        <h2 className="text-base font-semibold">{t("editSubject")}</h2>

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

          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1">{tPlanner("kids")}</legend>
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
          </fieldset>

          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1">{tPlanner("dayOfWeek")}</legend>
            <div className="flex flex-wrap gap-3">
              {Array.from({ length: 7 }, (_, i) => (
                <label key={i} className="flex items-center gap-1.5">
                  <input
                    type="checkbox"
                    checked={daysOfWeek.includes(i)}
                    onChange={(e) =>
                      setDaysOfWeek((prev) =>
                        e.target.checked ? [...prev, i] : prev.filter((d) => d !== i)
                      )
                    }
                  />
                  {weekdayName(i, locale)}
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1">
              {tPlanner("startTime")}
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1">
              {tPlanner("endTime")}
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="rounded-md border border-gray-300 px-3 py-2 dark:border-gray-700 dark:bg-gray-800"
              />
            </label>
          </div>

          {error && <p className="text-red-600">{error}</p>}
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
