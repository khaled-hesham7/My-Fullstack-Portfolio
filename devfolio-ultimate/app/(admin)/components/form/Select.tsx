import React, { useState } from "react";
import { twMerge } from "tailwind-merge";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  id?: string;
  name?: string;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
  id,
  name,
}) => {
  const [selectedValue, setSelectedValue] = useState<string>(defaultValue);
  const currentVal = value !== undefined ? value : selectedValue;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newVal = e.target.value;
    setSelectedValue(newVal);
    onChange(newVal);
  };

  return (
    <div className="relative w-full">
      <select
        id={id}
        name={name}
        className={twMerge(
          "h-11 w-full appearance-none rounded-xl border border-slate-700/80 bg-slate-900/80 px-4 py-2.5 pr-10 text-sm transition-all duration-200 outline-none text-slate-100 focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 cursor-pointer",
          !currentVal && "text-slate-500",
          className
        )}
        value={currentVal}
        onChange={handleChange}
      >
        {placeholder && (
          <option value="" disabled className="bg-slate-900 text-slate-500">
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-slate-900 text-slate-200"
          >
            {option.label}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3.5 text-slate-400">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  );
};

export default Select;
