"use client";

import { ACTIVITY_COLORS } from "@/lib/activity-colors";

type Props = {
  /** Form field name — pass this for an uncontrolled picker inside a plain <form>. */
  name?: string;
  /** Current value for a controlled picker ("" means "auto/match kid color"). */
  value?: string;
  onChange?: (value: string) => void;
  /** Initial selection for an uncontrolled picker. */
  defaultValue?: string;
  autoTitle: string;
};

function AutoSwatch({
  autoTitle,
  checked,
  ...inputProps
}: {
  autoTitle: string;
  checked?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="cursor-pointer" title={autoTitle}>
      <input type="radio" value="" checked={checked} className="peer sr-only" {...inputProps} />
      <span
        className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-dashed border-gray-300 text-gray-400 ring-offset-2 peer-checked:border-gray-900 peer-checked:ring-2 peer-checked:ring-gray-900 dark:border-gray-600 dark:text-gray-500 dark:ring-offset-gray-900 dark:peer-checked:border-gray-100 dark:peer-checked:ring-gray-100"
        aria-hidden
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" strokeDasharray="3 3" />
        </svg>
      </span>
    </label>
  );
}

export function ColorPicker({ name, value, onChange, defaultValue = "", autoTitle }: Props) {
  const controlled = onChange !== undefined;

  return (
    <div className="flex flex-wrap gap-2">
      {controlled ? (
        <AutoSwatch autoTitle={autoTitle} checked={value === ""} onChange={() => onChange("")} />
      ) : (
        <AutoSwatch
          autoTitle={autoTitle}
          name={name}
          defaultChecked={defaultValue === ""}
          onChange={() => {}}
        />
      )}
      {ACTIVITY_COLORS.map((color) => (
        <label key={color} className="cursor-pointer">
          <input
            type="radio"
            name={controlled ? undefined : name}
            value={color}
            checked={controlled ? value === color : undefined}
            defaultChecked={controlled ? undefined : defaultValue === color}
            onChange={controlled ? () => onChange(color) : () => {}}
            className="peer sr-only"
          />
          <span
            className="block h-8 w-8 rounded-full ring-1 ring-gray-200 ring-offset-2 peer-checked:ring-2 peer-checked:ring-gray-900 dark:ring-offset-gray-900 dark:peer-checked:ring-gray-100"
            style={{ backgroundColor: color }}
            aria-hidden
          />
        </label>
      ))}
    </div>
  );
}
