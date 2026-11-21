"use client";
import React from "react";
import { useSidebar } from "@/app/context/SidebarContext";

const Backdrop: React.FC = () => {
  const { isMobileOpen, toggleMobileSidebar } = useSidebar();

  if (!isMobileOpen) return null;

  return (
    <div
      className="fixed inset-0 z-35 bg-slate-950/70 backdrop-blur-xs lg:hidden transition-opacity"
      onClick={toggleMobileSidebar}
    />
  );
};

export default Backdrop;
