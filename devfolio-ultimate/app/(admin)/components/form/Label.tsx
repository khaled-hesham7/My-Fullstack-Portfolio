import React, { FC, ReactNode } from "react";
import { twMerge } from "tailwind-merge";

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

const Label: FC<LabelProps> = ({ htmlFor, children, className }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={twMerge(
        "mb-1.5 block text-xs font-semibold text-slate-300 tracking-wide",
        className
      )}
    >
      {children}
    </label>
  );
};

export default Label;
