import React, { forwardRef } from "react";
import { twMerge } from "tailwind-merge";

export interface TextareaProps {
  placeholder?: string;
  rows?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  className?: string;
  disabled?: boolean;
  error?: boolean;
  hint?: string;
  id?: string;
  name?: string;
}

const TextArea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      placeholder = "Enter your message",
      rows = 3,
      value,
      defaultValue,
      onChange,
      className = "",
      disabled = false,
      error = false,
      hint = "",
      id,
      name,
      ...rest
    },
    ref
  ) => {
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    const baseClasses =
      "w-full rounded-xl border px-4 py-2.5 text-sm transition-all duration-200 outline-none resize-y";

    let stateClasses =
      "bg-slate-900/80 border-slate-700/80 text-slate-100 placeholder:text-slate-500 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20";

    if (disabled) {
      stateClasses =
        "opacity-50 cursor-not-allowed bg-slate-950/60 border-slate-800 text-slate-500 placeholder:text-slate-600";
    } else if (error) {
      stateClasses =
        "bg-slate-900/80 border-rose-500/80 text-rose-300 placeholder:text-rose-400/50 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20";
    }

    return (
      <div className="relative w-full">
        <textarea
          ref={ref}
          id={id}
          name={name}
          placeholder={placeholder}
          rows={rows}
          value={value}
          defaultValue={defaultValue}
          onChange={handleChange}
          disabled={disabled}
          className={twMerge(baseClasses, stateClasses, className)}
          {...rest}
        />
        {hint && (
          <p
            className={`mt-1.5 text-xs ${
              error ? "text-rose-400" : "text-slate-400"
            }`}
          >
            {hint}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
