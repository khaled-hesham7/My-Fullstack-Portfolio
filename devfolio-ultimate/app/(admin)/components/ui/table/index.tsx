import React, { ReactNode } from "react";
import { twMerge } from "tailwind-merge";

// Props for Table
interface TableProps {
  children: ReactNode;
  className?: string;
}

// Props for TableHeader
interface TableHeaderProps {
  children: ReactNode;
  className?: string;
}

// Props for TableBody
interface TableBodyProps {
  children: ReactNode;
  className?: string;
}

// Props for TableRow
interface TableRowProps {
  children: ReactNode;
  className?: string;
}

// Props for TableCell
interface TableCellProps {
  children: ReactNode;
  isHeader?: boolean;
  className?: string;
  colSpan?: number;
}

// Table Component
const Table: React.FC<TableProps> = ({ children, className }) => {
  return (
    <div className="w-full overflow-x-auto custom-scrollbar">
      <table className={twMerge("min-w-full text-left text-sm text-slate-300", className)}>
        {children}
      </table>
    </div>
  );
};

// TableHeader Component
const TableHeader: React.FC<TableHeaderProps> = ({ children, className }) => {
  return (
    <thead
      className={twMerge(
        "bg-slate-900/60 border-b border-slate-800/80 text-xs uppercase tracking-wider text-slate-400 font-semibold",
        className
      )}
    >
      {children}
    </thead>
  );
};

// TableBody Component
const TableBody: React.FC<TableBodyProps> = ({ children, className }) => {
  return (
    <tbody className={twMerge("divide-y divide-slate-800/60 text-slate-300", className)}>
      {children}
    </tbody>
  );
};

// TableRow Component
const TableRow: React.FC<TableRowProps> = ({ children, className }) => {
  return (
    <tr
      className={twMerge(
        "hover:bg-slate-800/30 transition-colors duration-150",
        className
      )}
    >
      {children}
    </tr>
  );
};

// TableCell Component
const TableCell: React.FC<TableCellProps> = ({
  children,
  isHeader = false,
  className,
  colSpan,
}) => {
  const CellTag = isHeader ? "th" : "td";
  return (
    <CellTag
      className={twMerge(
        isHeader
          ? "px-5 py-3.5 text-xs font-semibold text-slate-400 tracking-wider"
          : "px-5 py-4 text-sm text-slate-300",
        className
      )}
      colSpan={colSpan}
    >
      {children}
    </CellTag>
  );
};

export { Table, TableHeader, TableBody, TableRow, TableCell };
