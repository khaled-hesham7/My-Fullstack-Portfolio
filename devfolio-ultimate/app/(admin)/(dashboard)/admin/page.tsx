"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import {
  FaFolderOpen,
  FaFileAlt,
  FaBriefcase,
  FaEnvelope,
  FaHeart,
  FaEye,
  FaExternalLinkAlt,
  FaGithub,
  FaPlus,
  FaSyncAlt,
  FaArrowRight,
  FaUserGraduate,
  FaCode,
  FaLayerGroup,
  FaStar,
} from "react-icons/fa";
import { getApiBaseUrl } from "@/lib/utils";

interface DashboardMetrics {
  projects: {
    total: number;
    featured: number;
    with_demo: number;
    with_github: number;
  };
  articles: {
    total: number;
    technical: number;
    personal: number;
    featured: number;
    total_views: number;
    total_likes: number;
  };
  career: {
    skill_groups: number;
    experiences: number;
    jobs: number;
    internships: number;
    education: number;
    cvs: number;
  };
  inquiries: {
    total_messages: number;
  };
}

interface RecentArticle {
  id: number;
  title_en: string | null;
  title_ar: string | null;
  category: string | null;
  is_featured: boolean;
  views: number;
  likes: number;
  created_at: string;
}

interface RecentProject {
  id: number;
  title: string;
  is_featured: boolean;
  demo_link: string | null;
  github_link: string | null;
  created_at: string;
}

interface RecentContact {
  id: number;
  name: string;
  email: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [recentArticles, setRecentArticles] = useState<RecentArticle[]>([]);
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([]);
  const [recentContacts, setRecentContacts] = useState<RecentContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const [error, setError] = useState<string>("");

  const fetchStats = async () => {
    setIsLoading(true);
    setError("");
    try {
      const apiBase = getApiBaseUrl();
      const token = typeof window !== "undefined" ? localStorage.getItem("admin_token") : null;

      // 1. Try dedicated dashboard stats endpoint
      const res = await fetch(`${apiBase}/dashboard/stats`, {
        cache: "no-store",
        headers: {
          Accept: "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (res.ok) {
        const payload = await res.json();
        if (payload.success && payload.data) {
          setMetrics(payload.data.metrics);
          setRecentArticles(payload.data.recent?.articles || []);
          setRecentProjects(payload.data.recent?.projects || []);
          setRecentContacts(payload.data.recent?.contacts || []);
          setLastUpdated(new Date().toLocaleTimeString());
          setIsLoading(false);
          return;
        }
      }

      // 2. Client-side fallback aggregation if endpoint is offline
      const [artRes, projRes, portRes] = await Promise.all([
        fetch(`${apiBase}/articles?per_page=50`, { cache: "no-store" }).catch(() => null),
        fetch(`${apiBase}/projects?per_page=50`, { cache: "no-store" }).catch(() => null),
        fetch(`${apiBase}/portfolio-data`, { cache: "no-store" }).catch(() => null),
      ]);

      const artData = artRes && artRes.ok ? await artRes.json() : null;
      const projData = projRes && projRes.ok ? await projRes.json() : null;
      const portData = portRes && portRes.ok ? await portRes.json() : null;

      const rawArticles = artData?.data?.data || artData?.data || [];
      const rawProjects = projData?.data?.data || projData?.data || [];
      const rawSkills = portData?.data?.skills || [];
      const rawExp = portData?.data?.experience || [];
      const rawEdu = portData?.data?.education || [];
      const rawCvs = portData?.data?.cvs || [];

      const totalViews = rawArticles.reduce((acc: number, a: any) => acc + (a.views || a.stats?.views || 0), 0);
      const totalLikes = rawArticles.reduce((acc: number, a: any) => acc + (a.likes || a.stats?.likes || 0), 0);

      setMetrics({
        projects: {
          total: rawProjects.length,
          featured: rawProjects.filter((p: any) => p.is_featured).length,
          with_demo: rawProjects.filter((p: any) => Boolean(p.demo_link)).length,
          with_github: rawProjects.filter((p: any) => Boolean(p.github_link)).length,
        },
        articles: {
          total: rawArticles.length,
          technical: rawArticles.filter((a: any) => a.category !== "personal").length,
          personal: rawArticles.filter((a: any) => a.category === "personal").length,
          featured: rawArticles.filter((a: any) => a.is_featured).length,
          total_views: totalViews,
          total_likes: totalLikes,
        },
        career: {
          skill_groups: rawSkills.length,
          experiences: rawExp.length,
          jobs: rawExp.filter((e: any) => (e.type || "").toLowerCase() !== "internship").length,
          internships: rawExp.filter((e: any) => (e.type || "").toLowerCase() === "internship").length,
          education: rawEdu.length,
          cvs: rawCvs.length,
        },
        inquiries: {
          total_messages: 0,
        },
      });

      setRecentArticles(
        rawArticles.slice(0, 5).map((a: any) => ({
          id: a.id,
          title_en: a.title_en || a.title || "Untitled",
          title_ar: a.title_ar,
          category: a.category || "technical",
          is_featured: Boolean(a.is_featured),
          views: a.views || a.stats?.views || 0,
          likes: a.likes || a.stats?.likes || 0,
          created_at: a.created_at || a.date?.raw || "",
        }))
      );
      setRecentProjects(rawProjects.slice(0, 5));
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (err: any) {
      console.error("Dashboard stats fetch failed:", err);
      setError("Failed to load overview data. Please check connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8 animate-fade-in p-2 md:p-6 max-w-7xl mx-auto">
      {/* Top Welcome & Executive Studio Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-cyan-950/40 border border-slate-800/80 p-6 md:p-8 backdrop-blur-xl shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              Executive Dashboard &amp; Analytics
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
              Portfolio Overview &amp; Live Reports
            </h1>
            <p className="mt-2 text-sm text-slate-400 max-w-2xl leading-relaxed">
              Real-time telemetry across engineering projects, readership engagement, career milestones, and incoming inquiries.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
            <button
              onClick={fetchStats}
              disabled={isLoading}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all duration-200 disabled:opacity-50 shadow-sm"
              title="Refresh Analytics"
            >
              <FaSyncAlt className={`text-xs ${isLoading ? "animate-spin text-cyan-400" : ""}`} />
              <span>Refresh</span>
            </button>

            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-bold transition-all duration-200 shadow-lg shadow-cyan-500/20"
            >
              <span>Live Site</span>
              <FaExternalLinkAlt className="text-[10px]" />
            </Link>
          </div>
        </div>

        {lastUpdated && (
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-500">
            <span>Synchronized with MySQL &amp; Sanctum Engine</span>
            <span>Last sync: {lastUpdated}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={fetchStats}
            className="text-xs font-bold text-rose-400 underline hover:text-rose-200"
          >
            Retry
          </button>
        </div>
      )}

      {/* Bento Grid: 4 Primary KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Projects & Works */}
        <div className="relative group rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/40 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Projects &amp; Code
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <FaFolderOpen className="text-base" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {isLoading ? "-" : metrics?.projects.total ?? 0}
            </span>
            <span className="text-xs text-slate-400">Total Artifacts</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-3 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block">Featured</span>
              <span className="font-bold text-amber-400 flex items-center gap-1">
                <FaStar className="text-[10px]" />
                {isLoading ? "-" : metrics?.projects.featured ?? 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Live Demo</span>
              <span className="font-bold text-emerald-400">
                {isLoading ? "-" : metrics?.projects.with_demo ?? 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">GitHub</span>
              <span className="font-bold text-cyan-400">
                {isLoading ? "-" : metrics?.projects.with_github ?? 0}
              </span>
            </div>
          </div>
          <Link
            href="/admin/projects"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Manage Works</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {/* Card 2: Articles & Readership */}
        <div className="relative group rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-purple-500/40 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Articles &amp; Readership
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <FaFileAlt className="text-base" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {isLoading ? "-" : metrics?.articles.total ?? 0}
            </span>
            <span className="text-xs text-slate-400">Articles Published</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block">Total Views</span>
              <span className="font-bold text-cyan-300 flex items-center gap-1">
                <FaEye className="text-[10px]" />
                {isLoading ? "-" : metrics?.articles.total_views ?? 0}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Total Likes</span>
              <span className="font-bold text-rose-400 flex items-center gap-1">
                <FaHeart className="text-[10px]" />
                {isLoading ? "-" : metrics?.articles.total_likes ?? 0}
              </span>
            </div>
          </div>
          <Link
            href="/admin/articles"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span>Manage Publications</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {/* Card 3: Career & Experience */}
        <div className="relative group rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-emerald-500/40 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Career &amp; Experience
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <FaBriefcase className="text-base" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {isLoading ? "-" : metrics?.career.experiences ?? 0}
            </span>
            <span className="text-xs text-slate-400">Milestones</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block">Jobs vs Interns</span>
              <span className="font-bold text-emerald-400">
                {isLoading ? "-" : `${metrics?.career.jobs ?? 0} / ${metrics?.career.internships ?? 0}`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Skill Clusters</span>
              <span className="font-bold text-slate-300">
                {isLoading ? "-" : `${metrics?.career.skill_groups ?? 0} Groups`}
              </span>
            </div>
          </div>
          <Link
            href="/admin/experiences"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Track Milestones</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>

        {/* Card 4: Official CVs & Inquiries */}
        <div className="relative group rounded-2xl bg-slate-900/80 border border-slate-800/80 hover:border-amber-500/40 p-5 shadow-xl backdrop-blur-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Leads &amp; Official CVs
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <FaEnvelope className="text-base" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {isLoading ? "-" : metrics?.inquiries.total_messages ?? 0}
            </span>
            <span className="text-xs text-slate-400">Inbound Messages</span>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/60 grid grid-cols-2 gap-2 text-[11px]">
            <div>
              <span className="text-slate-500 block">Available CVs</span>
              <span className="font-bold text-cyan-400">
                {isLoading ? "-" : `${metrics?.career.cvs ?? 0} Documents`}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block">Education</span>
              <span className="font-bold text-slate-300">
                {isLoading ? "-" : `${metrics?.career.education ?? 0} Degrees`}
              </span>
            </div>
          </div>
          <Link
            href="/admin/contact"
            className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 hover:text-amber-300 transition-colors"
          >
            <span>Read Messages</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      </div>

      {/* Quick Launchpad Buttons */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800/80 p-5 backdrop-blur-md">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
          Quick Management Launchpad
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/admin/articles"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-purple-500/40 text-slate-200 hover:text-white transition-all text-xs font-semibold group"
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400 group-hover:scale-110 transition-transform">
              <FaPlus className="text-[10px]" />
            </div>
            <span>New Article</span>
          </Link>

          <Link
            href="/admin/projects"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-cyan-500/40 text-slate-200 hover:text-white transition-all text-xs font-semibold group"
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <FaCode className="text-[10px]" />
            </div>
            <span>Add Project</span>
          </Link>

          <Link
            href="/admin/cvs"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-amber-500/40 text-slate-200 hover:text-white transition-all text-xs font-semibold group"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
              <FaLayerGroup className="text-[10px]" />
            </div>
            <span>Manage CVs</span>
          </Link>

          <Link
            href="/admin/skills"
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 hover:border-emerald-500/40 text-slate-200 hover:text-white transition-all text-xs font-semibold group"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
              <FaUserGraduate className="text-[10px]" />
            </div>
            <span>Skills &amp; Stack</span>
          </Link>
        </div>
      </div>

      {/* Two-Column Feeds: Recent Publications & Featured Works */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Articles Feed */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Recent Publications</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Technical write-ups and thoughts
              </p>
            </div>
            <Link
              href="/admin/articles"
              className="text-xs font-semibold text-purple-400 hover:text-purple-300"
            >
              View All &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Loading publication metrics...
            </div>
          ) : recentArticles.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No articles published yet. Click &quot;New Article&quot; to begin.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50 space-y-3">
              {recentArticles.map((art) => (
                <div
                  key={art.id}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href="/admin/articles"
                      className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors truncate block"
                    >
                      {art.title_en || art.title_ar || "Untitled"}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-400 font-mono text-[10px]">
                        {art.category || "technical"}
                      </span>
                      <span className="flex items-center gap-1">
                        <FaEye className="text-slate-600 text-[10px]" />
                        <span>{art.views || 0}</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <FaHeart className="text-rose-500/80 text-[10px]" />
                        <span>{art.likes || 0}</span>
                      </span>
                    </div>
                  </div>

                  {art.is_featured && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 shrink-0">
                      Featured
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Total Reader Engagement:</span>
            <span className="font-semibold text-cyan-300">
              {metrics?.articles.total_views ?? 0} views &bull; {metrics?.articles.total_likes ?? 0} likes
            </span>
          </div>
        </div>

        {/* Featured Projects Feed */}
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-base font-bold text-white">Featured Works</h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Key production projects and demos
              </p>
            </div>
            <Link
              href="/admin/projects"
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300"
            >
              View All &rarr;
            </Link>
          </div>

          {isLoading ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              Loading engineering works...
            </div>
          ) : recentProjects.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              No projects added yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-800/50 space-y-3">
              {recentProjects.map((proj) => (
                <div
                  key={proj.id}
                  className="pt-3 first:pt-0 flex items-center justify-between gap-4"
                >
                  <div className="min-w-0 flex-1">
                    <Link
                      href="/admin/projects"
                      className="text-sm font-semibold text-white hover:text-cyan-400 transition-colors truncate block"
                    >
                      {proj.title}
                    </Link>
                    <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                      {proj.demo_link && proj.demo_link !== "#" ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <FaExternalLinkAlt className="text-[9px]" />
                          Live Demo Available
                        </span>
                      ) : (
                        <span className="text-slate-600">No Demo</span>
                      )}
                      {proj.github_link && proj.github_link !== "#" && (
                        <span className="text-slate-400 flex items-center gap-1">
                          <FaGithub className="text-[10px]" />
                          Source
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {proj.is_featured && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        Homepage
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-6 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
            <span>Portfolio Quality Index:</span>
            <span className="font-semibold text-emerald-400">
              {metrics?.projects.with_demo ?? 0} with Live Demos &bull; {metrics?.projects.with_github ?? 0} Open Source
            </span>
          </div>
        </div>
      </div>

      {/* Latest Messages Summary if available */}
      {recentContacts.length > 0 && (
        <div className="rounded-2xl bg-slate-900/80 border border-slate-800/80 p-6 shadow-xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <FaEnvelope className="text-amber-400 text-sm" />
              Latest Inquiries &amp; Messages
            </h2>
            <Link
              href="/admin/contact"
              className="text-xs font-semibold text-amber-400 hover:text-amber-300"
            >
              Open Inbox &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentContacts.slice(0, 3).map((c) => (
              <div
                key={c.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <div className="font-semibold text-white text-sm truncate">{c.name}</div>
                <div className="text-xs text-slate-400 truncate mt-0.5">{c.email}</div>
                <div className="text-[10px] text-slate-500 mt-2 font-mono">
                  {new Date(c.created_at).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
