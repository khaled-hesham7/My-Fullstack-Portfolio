import type React from "react";
import { twMerge } from "tailwind-merge";

interface CheckboxProps {
  label?: string;
  checked: boolean;
  className?: string;
  id?: string;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  id,
  onChange,
  className = "",
  disabled = false,
}) => {
  return (
    <label
      className={`inline-flex items-center gap-3 select-none ${
        disabled ? "cursor-not-allowed opacity-50" : "cursor-pointer"
      }`}
    >
      <div className="relative flex items-center justify-center w-5 h-5">
        <input
          id={id}
          type="checkbox"
          className={twMerge(
            "w-5 h-5 appearance-none rounded-lg border border-slate-700 bg-slate-900 transition-all duration-200 checked:bg-cyan-500 checked:border-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 cursor-pointer disabled:cursor-not-allowed",
            className
          )}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        {checked && (
          <svg
            className="absolute pointer-events-none w-3.5 h-3.5 text-white stroke-[2.5]"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
      {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
    </label>
  );
};

export default Checkbox;
