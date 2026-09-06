"use client";

import { useRef } from "react";

type Props = {
  onSave: () => void;
  onLoad: (file: File) => Promise<void>;
  onClear: () => void;
  saveLabel: string;
  loadLabel: string;
  clearLabel: string;
  clearConfirmMessage: string;
  importErrorMessage: string;
};

// Reused identically on the Planner, Meals, and School pages — each one's
// own self-contained save/load/clear, deliberately not a single global
// "save everything" action.
export function DataControls({
  onSave,
  onLoad,
  onClear,
  saveLabel,
  loadLabel,
  clearLabel,
  clearConfirmMessage,
  importErrorMessage,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    try {
      await onLoad(file);
    } catch {
      alert(importErrorMessage);
    }
  }

  function handleClear() {
    if (window.confirm(clearConfirmMessage)) onClear();
  }

  return (
    <div className="flex items-center gap-4 text-sm font-medium">
      <button
        type="button"
        onClick={onSave}
        className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
      >
        {saveLabel}
      </button>
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-100"
      >
        {loadLabel}
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="application/json"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={handleClear}
        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
      >
        {clearLabel}
      </button>
    </div>
  );
}
