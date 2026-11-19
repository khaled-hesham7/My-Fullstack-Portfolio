"use client";

import React, { useEffect, useState, useMemo } from "react";
import { SKILL_ICON_LIST, SKILL_ICON_MAP, getSkillIcon } from "@/lib/skillIcons";
import { Modal } from "../../../components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import { getApiBaseUrl } from "@/lib/utils";

// ─── Modern Icon Picker Component ─────────────────────────────────────────────
function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (icon: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = useMemo(
    () =>
      SKILL_ICON_LIST.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const SelectedIcon = value ? getSkillIcon(value) : null;

  return (
    <div className="relative space-y-2">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-900/80 hover:bg-slate-900 text-sm text-left transition-all group"
      >
        <div className="flex items-center gap-3">
          {SelectedIcon ? (
            <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-base">
              <SelectedIcon size={16} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-slate-500 flex items-center justify-center text-xs">
              ⚡
            </div>
          )}
          <div>
            <span className="font-mono text-xs font-semibold text-white block">
              {value || "Select Icon from Library"}
            </span>
            <span className="text-[10px] text-slate-500">
              {value ? "Click to change icon" : "FontAwesome icon set"}
            </span>
          </div>
        </div>

        <svg
          className={`w-4 h-4 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div className="absolute z-50 left-0 right-0 top-full mt-2 rounded-xl border border-slate-800 bg-slate-950/95 backdrop-blur-2xl shadow-2xl p-3 space-y-3">
          {/* Search inside picker */}
          <div className="relative">
            <svg
              className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons (e.g. react, code, docker)..."
              className="w-full h-8 pl-8 pr-3 text-xs rounded-lg bg-slate-900 border border-slate-800 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
              autoFocus
            />
          </div>

          {/* Grid of Icons */}
          <div className="grid grid-cols-6 sm:grid-cols-8 gap-1.5 max-h-48 overflow-y-auto custom-scrollbar p-1">
            {filtered.map((name) => {
              const Ico = SKILL_ICON_MAP[name];
              if (!Ico) return null;
              const isSelected = value === name;

              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                  }}
                  title={name}
                  className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
                    isSelected
                      ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/60 border border-transparent"
                  }`}
                >
                  <Ico size={16} />
                  <span className="text-[9px] font-mono truncate max-w-[42px] mt-1 text-slate-400">
                    {name.replace(/^Fa/, "")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Clear Button */}
          {value && (
            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setOpen(false);
                }}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium transition-colors"
              >
                Clear Selected Icon
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual input fallback */}
      <div className="flex items-center gap-2">
        <span className="text-[11px] text-slate-500 shrink-0">Or manual class:</span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="FaReact, FaPhp, FaNodeJs..."
          className="flex-1 h-8 px-3 text-xs font-mono rounded-lg bg-slate-900 border border-slate-800 text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500"
        />
      </div>
    </div>
  );
}

interface SkillGroupItem {
  id: number;
  title: string;
  icon: string | null;
  skills: string[];
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export default function AdminSkillsPage() {
  const [skillGroups, setSkillGroups] = useState<SkillGroupItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Search filter
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [skills, setSkills] = useState<string[]>([""]);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("admin_token");
      setToken(storedToken);
    }
  }, []);

  const fetchSkillGroups = async (page: number) => {
    setIsLoading(true);
    setGlobalError("");
    try {
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/skills?page=${page}`, {
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
          setSkillGroups(paginatedData.data);
          setMeta({
            current_page: paginatedData.current_page,
            last_page: paginatedData.last_page,
            total: paginatedData.total,
            per_page: paginatedData.per_page,
          });
        } else {
          setSkillGroups(payload.data || []);
          setMeta(null);
        }
      }
    } catch (err: any) {
      console.error("Fetch skills failed:", err);
      setGlobalError("Failed to load skills. Ensure backend server is online.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillGroups(currentPage);
  }, [currentPage]);

  // Filtered skills
  const filteredSkillGroups = useMemo(() => {
    if (!searchQuery) return skillGroups;
    return skillGroups.filter((group) => {
      const inTitle = group.title.toLowerCase().includes(searchQuery.toLowerCase());
      const inSkills = group.skills && group.skills.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return inTitle || inSkills;
    });
  }, [skillGroups, searchQuery]);

  // Metrics
  const stats = useMemo(() => {
    const totalGroups = meta?.total ?? skillGroups.length;
    const totalSkillsCount = skillGroups.reduce((acc, g) => acc + (g.skills?.length || 0), 0);
    return { totalGroups, totalSkillsCount };
  }, [skillGroups, meta]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle("");
    setIcon("");
    setSkills([""]);
    setErrors({});
    setGlobalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (group: SkillGroupItem) => {
    setIsEditing(true);
    setEditingId(group.id);
    setTitle(group.title);
    setIcon(group.icon || "");
    setSkills(group.skills && group.skills.length > 0 ? [...group.skills] : [""]);
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

  const handleSkillChange = (index: number, value: string) => {
    const nextSkills = [...skills];
    nextSkills[index] = value;
    setSkills(nextSkills);

    if (errors.skills || errors[`skills.${index}`]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.skills;
        delete next[`skills.${index}`];
        return next;
      });
    }
  };

  const addSkillField = () => {
    setSkills([...skills, ""]);
  };

  const removeSkillField = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    setFormLoading(true);

    try {
      const activeToken = token || localStorage.getItem("admin_token");
      const apiBase = getApiBaseUrl();

      const cleanedSkills = skills.map((s) => s.trim()).filter((s) => s.length > 0);

      const payloadBody = {
        title: title,
        icon: icon.trim() === "" ? null : icon,
        skills: cleanedSkills,
      };

      const url = isEditing
        ? `${apiBase}/skills/${editingId}`
        : `${apiBase}/skills`;

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
        fetchSkillGroups(currentPage);
      }
    } catch (err: any) {
      console.error("Skill group submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this skill group?")) return;

    try {
      const apiBase = getApiBaseUrl();
      const activeToken = token || localStorage.getItem("admin_token");
      const response = await fetch(`${apiBase}/skills/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete skill group.");
      }

      const payload = await response.json();
      if (payload.success) {
        if (skillGroups.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchSkillGroups(currentPage);
        }
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "Could not delete skill group.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Studio Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
              Expertise & Tech Stack
            </span>
            <span className="text-xs text-slate-400">Competency Manager</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Skills <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Studio</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Group your core proficiencies (Backend, Frontend, DevOps) and list individual tools.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Skill Group
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Skill Groups</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">
              📂
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.totalGroups}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Technologies</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">
              ⚡
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{stats.totalSkillsCount}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Stack Health</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
              🎯
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">Active</p>
        </div>
      </div>

      {/* Global Error Banner */}
      {globalError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{globalError}</span>
        </div>
      )}

      {/* Search Toolbar */}
      <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800/80 backdrop-blur-xl">
        <div className="relative flex-1 max-w-md">
          <svg className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search skill groups or specific tools (e.g. Docker, PHP)..."
            className="w-full h-9.5 pl-9 pr-8 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all"
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
        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
          {filteredSkillGroups.length} groups found
        </span>
      </div>

      {/* Skills Table Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-full divide-y divide-slate-800/60">
            <TableHeader className="bg-slate-950/60">
              <TableRow>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Group & Icon
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Icon Identifier
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Technologies / Skills
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-800/40 bg-transparent">
              {isLoading ? (
                <TableRow>
                  <TableCell className="px-5 py-12 text-center text-slate-400" colSpan={4}>
                    <div className="flex justify-center items-center gap-2">
                      <span className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></span>
                      <span className="text-sm">Loading skills studio...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredSkillGroups.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-12 text-center text-slate-400" colSpan={4}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">🧩</span>
                      <p className="text-sm font-medium text-slate-300">No skill groups found</p>
                      <p className="text-xs text-slate-500">Click &quot;Add Skill Group&quot; to configure your stack.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredSkillGroups.map((group) => {
                  const IconComp = group.icon ? getSkillIcon(group.icon) : null;
                  return (
                    <TableRow key={group.id} className="hover:bg-slate-800/30 transition-colors">
                      {/* Title & Icon Preview */}
                      <TableCell className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-base shrink-0">
                            {IconComp ? <IconComp size={18} /> : <span>⚡</span>}
                          </div>
                          <div>
                            <span className="font-semibold text-white text-sm block">
                              {group.title}
                            </span>
                            <span className="text-[11px] text-slate-500">
                              {group.skills?.length || 0} skills registered
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      {/* Icon code */}
                      <TableCell className="px-5 py-3.5">
                        {group.icon ? (
                          <span className="inline-block px-2.5 py-1 rounded-md bg-slate-950 border border-slate-800 font-mono text-xs text-cyan-300">
                            {group.icon}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600 font-mono">None</span>
                        )}
                      </TableCell>

                      {/* Skills tags */}
                      <TableCell className="px-5 py-3.5 max-w-[360px]">
                        <div className="flex flex-wrap gap-1.5">
                          {group.skills && group.skills.length > 0 ? (
                            group.skills.map((skill, idx) => (
                              <span
                                key={idx}
                                className="inline-block px-2.5 py-0.5 text-xs rounded-md bg-slate-800/90 text-slate-200 border border-slate-700/60 font-mono hover:border-cyan-500/40 transition-colors"
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-600 italic">No skills listed</span>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(group)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all"
                            title="Edit Skill Group"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(group.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                            title="Delete Skill Group"
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

        {/* Pagination Bar */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-950/40">
            <span className="text-xs text-slate-400">
              Page <span className="font-semibold text-white">{meta.current_page}</span> of{" "}
              <span className="font-semibold text-white">{meta.last_page}</span> ({meta.total} groups)
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

      {/* Modern Modal */}
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
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">
                {isEditing ? "✏️" : "🧩"}
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isEditing ? "Edit Skill Group" : "Create New Skill Group"}
                </h3>
                <p className="text-xs text-slate-400">
                  Organize and group technologies with a dedicated icon
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

            <form id="skill-group-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Group Title */}
              <div>
                <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                  Group Title <span className="text-cyan-400">*</span>
                </Label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleFieldChange("title", e.target.value, setTitle)}
                  className={`w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 outline-none transition-all ${
                    errors.title
                      ? "border-rose-500 focus:border-rose-500"
                      : "border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                  }`}
                  placeholder="e.g. Backend Architecture & Microservices"
                />
                {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title[0]}</p>}
              </div>

              {/* Icon Picker */}
              <div>
                <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                  Group Icon
                </Label>
                <IconPicker
                  value={icon}
                  onChange={(val) => handleFieldChange("icon", val, setIcon)}
                />
                {errors.icon && <p className="mt-1 text-xs text-rose-400">{errors.icon[0]}</p>}
              </div>

              {/* Dynamic Skills Items */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs font-semibold text-slate-300">
                    Included Skills / Technologies <span className="text-cyan-400">*</span>
                  </Label>
                  <button
                    type="button"
                    onClick={addSkillField}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
                  >
                    <span>+ Add Skill</span>
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar pr-1">
                  {skills.map((skill, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <div className="w-6 h-6 rounded-md bg-slate-800 text-slate-400 text-xs font-mono flex items-center justify-center shrink-0">
                        {index + 1}
                      </div>
                      <input
                        type="text"
                        required
                        value={skill}
                        onChange={(e) => handleSkillChange(index, e.target.value)}
                        className={`w-full h-10 px-3.5 text-xs rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 outline-none transition-all font-mono ${
                          errors[`skills.${index}`]
                            ? "border-rose-500"
                            : "border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                        }`}
                        placeholder={`e.g. Node.js, GraphQL, Docker`}
                      />
                      {skills.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeSkillField(index)}
                          className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 transition-colors"
                          title="Remove item"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {errors.skills && <p className="mt-1 text-xs text-rose-400">{errors.skills[0]}</p>}
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
              form="skill-group-form"
              disabled={formLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {formLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isEditing ? "Save Skill Group" : "Create Group"}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
