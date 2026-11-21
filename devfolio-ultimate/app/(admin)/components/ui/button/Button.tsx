import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps {
  children: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  isLoading?: boolean;
  className?: string;
  type?: "button" | "submit" | "reset";
  title?: string;
}

const Button: React.FC<ButtonProps> = ({
  children,
  size = "md",
  variant = "primary",
  startIcon,
  endIcon,
  onClick,
  className = "",
  disabled = false,
  isLoading = false,
  type = "button",
  title,
}) => {
  // Proportional, balanced size tokens
  const sizeClasses = {
    sm: "h-9 px-3.5 text-xs rounded-xl font-medium",
    md: "h-11 px-5 text-sm rounded-xl font-semibold",
    lg: "h-12 px-6 text-base rounded-xl font-bold",
  };

  // Cohesive visual variants (Deep Slate + Cyan / Cobalt)
  const variantClasses = {
    primary:
      "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100",
    secondary:
      "bg-slate-800/90 hover:bg-slate-700/90 text-slate-200 hover:text-white border border-slate-700/80 shadow-sm active:scale-[0.98]",
    outline:
      "bg-transparent hover:bg-slate-800/60 text-slate-300 hover:text-white border border-slate-700/80 hover:border-cyan-500/50 active:scale-[0.98]",
    ghost:
      "bg-transparent hover:bg-slate-800/60 text-slate-400 hover:text-white border-transparent",
    danger:
      "bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 active:scale-[0.98]",
  };

  const isBtnDisabled = disabled || isLoading;

  return (
    <button
      className={twMerge(
        "inline-flex items-center justify-center gap-2 select-none transition-all duration-200 cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      onClick={onClick}
      disabled={isBtnDisabled}
      type={type}
      title={title}
    >
      {isLoading ? (
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      ) : (
        startIcon && <span className="flex items-center shrink-0">{startIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && endIcon && <span className="flex items-center shrink-0">{endIcon}</span>}
    </button>
  );
};

export default Button;
