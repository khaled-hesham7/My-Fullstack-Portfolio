"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/app/context/SidebarContext";
import { getApiBaseUrl } from "@/lib/utils";

const routeTitles: Record<string, { title: string; subtitle?: string; icon: string }> = {
  "/admin": { title: "Overview & Analytics", subtitle: "System metrics & recent activity", icon: "📊" },
  "/admin/projects": { title: "Projects Showcase", subtitle: "Manage featured works & case studies", icon: "💼" },
  "/admin/articles": { title: "Articles & Blog", subtitle: "Technical writing & personal notes", icon: "✍️" },
  "/admin/skills": { title: "Skills & Tech Stack", subtitle: "Core technologies & proficiency levels", icon: "⚡" },
  "/admin/experiences": { title: "Work Experience", subtitle: "Career milestones & professional roles", icon: "🏢" },
  "/admin/education": { title: "Education & Certifications", subtitle: "Academic background & achievements", icon: "🎓" },
  "/admin/profile": { title: "Profile & Identity", subtitle: "Executive bio, avatar & personal details", icon: "👤" },
  "/admin/cvs": { title: "CVs & Resumes", subtitle: "Downloadable documents for recruiters", icon: "📄" },
  "/admin/socials": { title: "Social Links", subtitle: "External developer & professional accounts", icon: "🔗" },
  "/admin/contact": { title: "Contact Messages", subtitle: "Client inquiries & messages", icon: "📬" },
  "/admin/about-settings": { title: "About Settings", subtitle: "Detailed story & technical background", icon: "⚙️" },
};

const AppHeader: React.FC = () => {
  const { toggleSidebar, toggleMobileSidebar } = useSidebar();
  const pathname = usePathname();
  const [adminName, setAdminName] = useState<string>("Khaled Hesham");

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("admin_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        if (parsed?.name) {
          setAdminName(parsed.name);
        }
      }
    } catch {
      // Fallback to default
    }
  }, []);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem("admin_token");
      if (token) {
        const apiBase = getApiBaseUrl();
        await fetch(`${apiBase}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }).catch(() => {});
      }
    } finally {
      localStorage.removeItem("admin_token");
      localStorage.removeItem("admin_user");
      window.location.href = "/admin/login";
    }
  };

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const currentRoute = routeTitles[pathname] || {
    title: "Admin Console",
    subtitle: "Management Workspace",
    icon: "⚡",
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800/80 bg-slate-900/90 px-4 backdrop-blur-md sm:px-6 lg:px-8">
      {/* Left: Sidebar Toggle + Dynamic Breadcrumb */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={handleToggle}
          aria-label="Toggle Sidebar"
          className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 text-slate-300 transition-all hover:border-cyan-500/50 hover:bg-slate-800 hover:text-cyan-400 cursor-pointer shadow-xs"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:inline-flex text-base">{currentRoute.icon}</span>
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider hidden sm:inline">
                Admin
              </span>
              <span className="text-slate-600 hidden sm:inline">/</span>
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight truncate max-w-[140px] sm:max-w-none">
                {currentRoute.title}
              </span>
            </div>
            {currentRoute.subtitle && (
              <span className="hidden md:inline text-[11px] text-slate-400 -mt-0.5">
                {currentRoute.subtitle}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Live Site Link + Admin Badge + Logout Button */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Quick link to live public site */}
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-cyan-300 bg-slate-950/60 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 rounded-xl transition-all shadow-xs"
          title="Open live portfolio in a new tab"
        >
          <span className="text-cyan-400 text-sm">🌐</span>
          <span>Live Site</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-70"
          >
            <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
          </svg>
        </Link>

        {/* Admin User Badge */}
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-300">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold text-white/90">{adminName}</span>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-500 border border-rose-500/20 hover:border-rose-500 rounded-xl transition-all duration-200 cursor-pointer shadow-xs"
          title="Sign out of admin console"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l3 3m0 0l-3 3m3-3H9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};

export default AppHeader;
