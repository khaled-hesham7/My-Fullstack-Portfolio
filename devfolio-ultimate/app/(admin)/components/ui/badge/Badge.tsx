import React from "react";
import { twMerge } from "tailwind-merge";

type BadgeVariant = "light" | "solid";
type BadgeSize = "sm" | "md";
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  color?: BadgeColor;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "light",
  color = "primary",
  size = "md",
  startIcon,
  endIcon,
  children,
  className,
}) => {
  const baseStyles =
    "inline-flex items-center px-2.5 py-0.5 justify-center gap-1.5 rounded-full font-medium border";

  const sizeStyles = {
    sm: "text-xs py-0.5 px-2",
    md: "text-xs py-1 px-3",
  };

  const variants = {
    light: {
      primary: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      error: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      warning: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      info: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      light: "bg-slate-800 text-slate-300 border-slate-700",
      dark: "bg-slate-900 text-slate-200 border-slate-800",
    },
    solid: {
      primary: "bg-cyan-600 text-white border-cyan-500",
      success: "bg-emerald-600 text-white border-emerald-500",
      error: "bg-rose-600 text-white border-rose-500",
      warning: "bg-amber-600 text-white border-amber-500",
      info: "bg-blue-600 text-white border-blue-500",
      light: "bg-slate-700 text-white border-slate-600",
      dark: "bg-slate-800 text-white border-slate-700",
    },
  };

  const sizeClass = sizeStyles[size];
  const colorStyles = variants[variant][color];

  return (
    <span className={twMerge(baseStyles, sizeClass, colorStyles, className)}>
      {startIcon && <span className="flex items-center shrink-0">{startIcon}</span>}
      {children}
      {endIcon && <span className="flex items-center shrink-0">{endIcon}</span>}
    </span>
  );
};

export default Badge;
