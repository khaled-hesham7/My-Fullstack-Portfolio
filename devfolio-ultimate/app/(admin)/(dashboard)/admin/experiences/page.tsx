"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Modal } from "../../../components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import { getApiBaseUrl } from "@/lib/utils";

interface ExperienceItem {
  id: number;
  type?: string | null;
  job_title: string;
  company: string | null;
  location: string | null;
  duration: string;
  tasks: string[] | null;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<ExperienceItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "job" | "internship" | "current">("all");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [type, setType] = useState<"Job" | "Internship" | "Freelance">("Job");
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [tasks, setTasks] = useState<string[]>([""]);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("admin_token");
      setToken(storedToken);
    }
  }, []);

  const fetchExperiences = async (page: number) => {
    setIsLoading(true);
    setGlobalError("");
    try {
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/experiences?page=${page}`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const payload = await response.json();
      if (payload.success) {
        const paginatedData = payload.data;
        if (paginatedData && paginatedData.data) {
          setExperiences(paginatedData.data);
          setMeta({
            current_page: paginatedData.current_page,
            last_page: paginatedData.last_page,
            total: paginatedData.total,
            per_page: paginatedData.per_page,
          });
        } else {
          setExperiences(payload.data || []);
          setMeta(null);
        }
      }
    } catch (err: any) {
      console.error("Fetch experiences failed:", err);
      setGlobalError("Failed to load experiences. Ensure backend server is online.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchExperiences(currentPage);
  }, [currentPage]);

  // Filtered experiences
  const filteredExperiences = useMemo(() => {
    return experiences.filter((exp) => {
      const matchesSearch =
        !searchQuery ||
        exp.job_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (exp.company && exp.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (exp.tasks && exp.tasks.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      if (!matchesSearch) return false;

      if (filterType === "job") {
        return (exp.type || "Job").toLowerCase() === "job";
      }
      if (filterType === "internship") {
        return (exp.type || "").toLowerCase() === "internship";
      }
      if (filterType === "current") {
        return (
          exp.duration.toLowerCase().includes("present") ||
          exp.duration.includes("الآن") ||
          exp.duration.includes("الان")
        );
      }
      return true;
    });
  }, [experiences, searchQuery, filterType]);

  // Metrics
  const stats = useMemo(() => {
    const total = meta?.total ?? experiences.length;
    const jobs = experiences.filter((e) => (e.type || "Job").toLowerCase() === "job").length;
    const internships = experiences.filter((e) => (e.type || "").toLowerCase() === "internship").length;
    const current = experiences.filter(
      (e) =>
        e.duration.toLowerCase().includes("present") ||
        e.duration.includes("الآن") ||
        e.duration.includes("الان")
    ).length;
    return { total, jobs, internships, current };
  }, [experiences, meta]);

  const handleCurrentJobToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setIsCurrentJob(checked);
    if (checked) {
      if (!duration || duration.trim() === "") {
        const currentYear = new Date().getFullYear();
        setDuration(`${currentYear} - Present`);
      } else if (duration.includes("-")) {
        const parts = duration.split("-");
        setDuration(`${parts[0].trim()} - Present`);
      } else {
        setDuration(`${duration.trim()} - Present`);
      }
    } else {
      if (
        duration.toLowerCase().includes("present") ||
        duration.includes("الآن") ||
        duration.includes("الان")
      ) {
        const parts = duration.split("-");
        setDuration(parts[0].trim());
      }
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setType("Job");
    setJobTitle("");
    setCompany("");
    setLocation("");
    setDuration("");
    setIsCurrentJob(false);
    setTasks([""]);
    setErrors({});
    setGlobalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (exp: ExperienceItem) => {
    setIsEditing(true);
    setEditingId(exp.id);
    setType((exp.type as any) || "Job");
    setJobTitle(exp.job_title);
    setCompany(exp.company || "");
    setLocation(exp.location || "");
    setDuration(exp.duration);
    const isPresent =
      exp.duration.toLowerCase().includes("present") ||
      exp.duration.includes("الآن") ||
      exp.duration.includes("الان");
    setIsCurrentJob(isPresent);
    setTasks(exp.tasks && exp.tasks.length > 0 ? [...exp.tasks] : [""]);
    setErrors({});
    setGlobalError("");
    setIsModalOpen(true);
  };

  const handleFieldChange = (
    field: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(value);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleTaskChange = (index: number, value: string) => {
    const nextTasks = [...tasks];
    nextTasks[index] = value;
    setTasks(nextTasks);

    if (errors.tasks || errors[`tasks.${index}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.tasks;
        delete next[`tasks.${index}`];
        return next;
      });
    }
  };

  const addTaskField = () => {
    setTasks([...tasks, ""]);
  };

  const removeTaskField = (index: number) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    setFormLoading(true);

    try {
      const activeToken = token || localStorage.getItem("admin_token");
      const apiBase = getApiBaseUrl();

      const cleanedTasks = tasks.map((t) => t.trim()).filter((t) => t.length > 0);

      const payloadBody = {
        type: type,
        job_title: jobTitle,
        company: company.trim() === "" ? null : company,
        location: location.trim() === "" ? null : location,
        duration: duration,
        tasks: cleanedTasks.length > 0 ? cleanedTasks : null,
      };

      const url = isEditing
        ? `${apiBase}/experiences/${editingId}`
        : `${apiBase}/experiences`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payloadBody),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 422) {
          setErrors(errData.errors || {});
          setGlobalError(errData.message || "Please check validation errors.");
          return;
        }
        if (response.status === 401) {
          setGlobalError("Session expired (401). Please log in again to save.");
          return;
        }
        throw new Error(errData.message || `Server returned status ${response.status}`);
      }

      const payload = await response.json();
      if (payload.success) {
        setIsModalOpen(false);
        fetchExperiences(currentPage);
      }
    } catch (err: any) {
      console.error("Experience form submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this experience record?")) return;

    try {
      const apiBase = getApiBaseUrl();
      const activeToken = token || localStorage.getItem("admin_token");
      const response = await fetch(`${apiBase}/experiences/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete experience record.");
      }

      const payload = await response.json();
      if (payload.success) {
        if (experiences.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchExperiences(currentPage);
        }
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "Could not delete experience record.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Studio Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-emerald-500/10 to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              Career & Training Timeline
            </span>
            <span className="text-xs text-slate-400">Track Record</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Work Experience & <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Internships</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your employment roles, industry internships (تدريب صيفي/عملي), and freelance contracts.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all duration-200 shadow-lg shadow-emerald-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Experience / Internship
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Records</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">
              💼
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Jobs / Full-time</span>
            <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400 text-xs">
              🏢
            </div>
          </div>
          <p className="text-2xl font-bold text-teal-400 mt-2">{stats.jobs}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Internships</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
              🎓
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">{stats.internships}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Active / Present</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">
              🟢
            </div>
          </div>
          <p className="text-2xl font-bold text-cyan-400 mt-2">{stats.current}</p>
        </div>
      </div>

      {/* Global Error */}
      {globalError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{globalError}</span>
        </div>
      )}

      {/* Search & Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search experiences by title, company, tasks..."
            className="w-full h-9.5 pl-9 pr-8 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: "all", label: "All Records" },
              { key: "job", label: "💼 Jobs" },
              { key: "internship", label: "🎓 Internships" },
              { key: "current", label: "🟢 Present" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 ${
                filterType === tab.key
                  ? "bg-emerald-500 text-slate-950 font-semibold shadow-md shadow-emerald-500/20"
                  : "bg-slate-800/60 text-slate-400 hover:text-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-full divide-y divide-slate-800/60">
            <TableHeader className="bg-slate-950/60">
              <TableRow>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Role & Company
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Type / Category
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Location & Duration
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Core Highlights
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-800/40 bg-transparent">
              {isLoading ? (
                <TableRow>
                  <TableCell className="px-5 py-12 text-center text-slate-400" colSpan={5}>
                    <div className="flex justify-center items-center gap-2">
                      <span className="w-5 h-5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin"></span>
                      <span className="text-sm">Loading career & internship history...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredExperiences.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-12 text-center text-slate-400" colSpan={5}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">💼</span>
                      <p className="text-sm font-medium text-slate-300">No records match criteria</p>
                      <p className="text-xs text-slate-500">Click &quot;Add Experience / Internship&quot; to register your work history.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredExperiences.map((exp) => {
                  const isPresent =
                    exp.duration.toLowerCase().includes("present") ||
                    exp.duration.includes("الآن") ||
                    exp.duration.includes("الان");

                  const expType = exp.type || "Job";

                  return (
                    <TableRow key={exp.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Job Title & Company */}
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-start gap-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-base shrink-0 mt-0.5 border ${
                            expType === "Internship"
                              ? "bg-purple-500/10 border-purple-500/20 text-purple-400"
                              : expType === "Freelance"
                              ? "bg-cyan-500/10 border-cyan-500/20 text-cyan-400"
                              : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          }`}>
                            {expType === "Internship" ? "🎓" : expType === "Freelance" ? "💻" : "💼"}
                          </div>
                          <div>
                            <span className="font-semibold text-white text-sm block">
                              {exp.job_title}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {exp.company || "Independent / Contract"}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Type Badge */}
                      <TableCell className="px-5 py-3.5">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                          expType === "Internship"
                            ? "bg-purple-500/10 text-purple-300 border-purple-500/30"
                            : expType === "Freelance"
                            ? "bg-cyan-500/10 text-cyan-300 border-cyan-500/30"
                            : "bg-emerald-500/10 text-emerald-300 border-emerald-500/30"
                        }`}>
                          {expType === "Internship" && "🎓 Internship"}
                          {expType === "Freelance" && "💻 Freelance"}
                          {expType === "Job" && "💼 Work Job"}
                        </span>
                      </TableCell>

                      {/* Location & Duration */}
                      <TableCell className="px-5 py-3.5">
                        <div className="space-y-1">
                          <div>
                            {isPresent ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                {exp.duration}
                              </span>
                            ) : (
                              <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] bg-slate-800 text-slate-300 font-mono">
                                {exp.duration}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1">
                            <span>📍</span> {exp.location || "Remote"}
                          </p>
                        </div>
                      </TableCell>

                      {/* Tasks */}
                      <TableCell className="px-5 py-3.5 max-w-[320px]">
                        {exp.tasks && exp.tasks.length > 0 ? (
                          <ul className="space-y-1">
                            {exp.tasks.slice(0, 3).map((task, idx) => (
                              <li key={idx} className="text-xs text-slate-300 flex items-start gap-1.5 line-clamp-1">
                                <span className="text-emerald-400 mt-1 text-[8px]">●</span>
                                <span className="truncate">{task}</span>
                              </li>
                            ))}
                            {exp.tasks.length > 3 && (
                              <span className="text-[10px] text-slate-500 font-mono">
                                +{exp.tasks.length - 3} more highlights
                              </span>
                            )}
                          </ul>
                        ) : (
                          <span className="text-xs text-slate-600 italic">No tasks specified</span>
                        )}
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(exp)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 border border-transparent hover:border-emerald-500/20 transition-all"
                            title="Edit Record"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(exp.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                            title="Delete Record"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-950/40">
            <span className="text-xs text-slate-400">
              Page <span className="font-semibold text-white">{meta.current_page}</span> of{" "}
              <span className="font-semibold text-white">{meta.last_page}</span> ({meta.total} records)
            </span>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === 1 || isLoading}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={currentPage === meta.last_page || isLoading}
                onClick={() => setCurrentPage((p) => Math.min(p + 1, meta.last_page))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showCloseButton={false}
        className="max-w-2xl border border-slate-800 bg-slate-950/95 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-sm">
                {type === "Internship" ? "🎓" : isEditing ? "✏️" : "💼"}
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isEditing ? "Edit Career / Internship" : "Add Experience or Internship"}
                </h3>
                <p className="text-xs text-slate-400">
                  Select category, employer/host, duration, and key highlights
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsModalOpen(false)}
              className="w-8 h-8 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors text-sm"
              title="Close modal"
            >
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
            {globalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {globalError}
              </div>
            )}

            <form id="experience-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selection Pills */}
              <div>
                <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                  Category / Classification <span className="text-emerald-400">*</span>
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "Job", label: "💼 Work Experience / Job" },
                    { key: "Internship", label: "🎓 Internship (تدريب)" },
                    { key: "Freelance", label: "💻 Freelance / Contract" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setType(t.key as any)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        type === t.key
                          ? t.key === "Internship"
                            ? "bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-sm"
                            : t.key === "Freelance"
                            ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-sm"
                            : "bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-sm"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Title & Company */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                    {type === "Internship" ? "Internship Title" : "Job Title / Role"} <span className="text-emerald-400">*</span>
                  </Label>
                  <input
                    type="text"
                    required
                    value={jobTitle}
                    onChange={(e) => handleFieldChange("job_title", e.target.value, setJobTitle)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    placeholder={type === "Internship" ? "e.g. Backend Engineering Intern" : "e.g. Senior Fullstack Engineer"}
                  />
                  {errors.job_title && <p className="mt-1 text-xs text-rose-400">{errors.job_title[0]}</p>}
                </div>

                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                    {type === "Internship" ? "Host Organization / Company" : "Company / Organization"}
                  </Label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => handleFieldChange("company", e.target.value, setCompany)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    placeholder="e.g. Google / ITI / Upwork"
                  />
                </div>
              </div>

              {/* Location & Duration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                    Location / Model
                  </Label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => handleFieldChange("location", e.target.value, setLocation)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    placeholder="e.g. Cairo, Egypt (Remote)"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <Label className="text-xs font-semibold text-slate-300">
                      Duration <span className="text-emerald-400">*</span>
                    </Label>
                    <label className="flex items-center gap-1.5 text-[11px] text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isCurrentJob}
                        onChange={handleCurrentJobToggle}
                        className="rounded border-slate-700 bg-slate-800 text-emerald-500 focus:ring-emerald-500/30"
                      />
                      <span>Active / Present</span>
                    </label>
                  </div>
                  <input
                    type="text"
                    required
                    value={duration}
                    onChange={(e) => handleFieldChange("duration", e.target.value, setDuration)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all font-mono"
                    placeholder="e.g. Jul 2024 - Sep 2024"
                  />
                  {errors.duration && <p className="mt-1 text-xs text-rose-400">{errors.duration[0]}</p>}
                </div>
              </div>

              {/* Dynamic Tasks / Highlights */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold text-slate-300">
                    Key Achievements & Projects Handled
                  </Label>
                  <button
                    type="button"
                    onClick={addTaskField}
                    className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition-colors"
                  >
                    <span>+ Add Highlight</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                  {tasks.map((task, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 text-xs font-mono flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        value={task}
                        onChange={(e) => handleTaskChange(index, e.target.value)}
                        className="w-full h-10 px-3.5 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                        placeholder="e.g. Developed RESTful APIs and performed database optimizations"
                      />
                      {tasks.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeTaskField(index)}
                          className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 transition-colors"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-800/80 bg-slate-900/50">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={formLoading}
              className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="experience-form"
              disabled={formLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
            >
              {formLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isEditing ? "Save Changes" : "Publish Record"}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
