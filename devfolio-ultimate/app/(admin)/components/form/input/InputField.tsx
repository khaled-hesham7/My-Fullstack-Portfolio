import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  success?: boolean;
  error?: boolean;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      type = "text",
      id,
      name,
      placeholder,
      defaultValue,
      value,
      onChange,
      className = "",
      min,
      max,
      step,
      disabled = false,
      success = false,
      error = false,
      hint,
      ...rest
    },
    ref
  ) => {
    const baseClasses =
      "h-11 w-full rounded-xl border appearance-none px-4 py-2.5 text-sm transition-all duration-200 outline-none";

    let stateClasses =
      "bg-slate-900/80 border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";

    if (disabled) {
      stateClasses =
        "opacity-50 cursor-not-allowed bg-slate-950/60 border-slate-800 text-slate-500 placeholder:text-slate-600";
    } else if (error) {
      stateClasses =
        "bg-slate-900/80 border-rose-500/80 text-rose-300 placeholder:text-rose-400/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20";
    } else if (success) {
      stateClasses =
        "bg-slate-900/80 border-emerald-500/80 text-emerald-300 placeholder:text-emerald-400/50 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20";
    }

    return (
      <div className="relative w-full">
        <input
          ref={ref}
          type={type}
          id={id}
          name={name}
          placeholder={placeholder}
          defaultValue={defaultValue}
          value={value}
          onChange={onChange}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={twMerge(baseClasses, stateClasses, className)}
          {...rest}
        />

        {hint && (
          <p
            className={`mt-1.5 text-xs ${
              error
                ? "text-rose-400"
                : success
                ? "text-emerald-400"
                : "text-slate-400"
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
