import React from "react";
import { twMerge } from "tailwind-merge";

interface ComponentCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  desc?: string;
}

const ComponentCard: React.FC<ComponentCardProps> = ({
  title,
  children,
  className = "",
  desc = "",
}) => {
  return (
    <div
      className={twMerge(
        "rounded-2xl border border-slate-800 bg-slate-900/40 backdrop-blur-sm text-slate-100 shadow-sm overflow-hidden",
        className
      )}
    >
      {/* Card Header */}
      <div className="px-6 py-5">
        <h3 className="text-base font-semibold text-slate-100">
          {title}
        </h3>
        {desc && (
          <p className="mt-1 text-sm text-slate-400">
            {desc}
          </p>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 border-t border-slate-800/80 sm:p-6">
        <div className="space-y-6">{children}</div>
      </div>
    </div>
  );
};

export default ComponentCard;
