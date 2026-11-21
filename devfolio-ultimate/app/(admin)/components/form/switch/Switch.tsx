"use client";
import React, { useState } from "react";
import { twMerge } from "tailwind-merge";

interface SwitchProps {
  label?: string;
  defaultChecked?: boolean;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
  color?: "blue" | "cyan" | "gray";
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  label,
  defaultChecked = false,
  checked,
  disabled = false,
  onChange,
  color = "cyan",
  className = "",
}) => {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isChecked = checked !== undefined ? checked : internalChecked;

  const handleToggle = () => {
    if (disabled) return;
    const nextVal = !isChecked;
    if (checked === undefined) {
      setInternalChecked(nextVal);
    }
    if (onChange) {
      onChange(nextVal);
    }
  };

  const activeColorClasses =
    color === "gray"
      ? "bg-slate-700"
      : color === "blue"
      ? "bg-blue-600"
      : "bg-cyan-500";

  return (
    <label
      className={twMerge(
        "inline-flex cursor-pointer select-none items-center gap-3 text-sm font-medium",
        disabled ? "cursor-not-allowed opacity-50" : "",
        className
      )}
      onClick={handleToggle}
    >
      <div className="relative">
        <div
          className={twMerge(
            "block h-6 w-11 rounded-full transition-colors duration-200",
            isChecked ? activeColorClasses : "bg-slate-800 border border-slate-700"
          )}
        />
        <div
          className={twMerge(
            "absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 shadow-sm",
            isChecked ? "translate-x-5" : "translate-x-0"
          )}
        />
      </div>
      {label && <span className="text-sm font-medium text-slate-300">{label}</span>}
    </label>
  );
};

export default Switch;
