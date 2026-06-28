"use client";

import React, { useEffect, useState, useMemo } from "react";
import * as FaIcons from "react-icons/fa";
import { Modal } from "../../../components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import { getApiBaseUrl } from "@/lib/utils";

// ─── Curated icon list (Font Awesome) ────────────────────────────────────────
const ICON_LIST = [
  // Development
  "FaCode", "FaLaptopCode", "FaTerminal", "FaCodeBranch", "FaBug",
  "FaServer", "FaDatabase", "FaCloud", "FaCloudUploadAlt", "FaDocker",
  "FaGitAlt", "FaGithub", "FaNpm", "FaNodeJs",
  // Languages & Frameworks
  "FaPhp", "FaPython", "FaJava", "FaSwift", "FaRust",
  "FaReact", "FaVuejs", "FaAngular", "FaLaravel", "FaWordpress",
  "FaSass", "FaHtml5", "FaCss3Alt", "FaJs",
  // Design
  "FaPalette", "FaPaintBrush", "FaFigma", "FaVectorSquare",
  "FaMobileAlt", "FaTabletAlt", "FaDesktop", "FaBezierCurve",
  // Infrastructure & Cloud
  "FaAws", "FaLinux", "FaUbuntu", "FaWindows",
  "FaNetworkWired", "FaShieldAlt", "FaLock", "FaKey",
  // Tools
  "FaTools", "FaWrench", "FaCog", "FaCogs", "FaRobot",
  "FaMicrochip", "FaCubes", "FaCube", "FaBoxes",
  // Data & Analytics  
  "FaChartBar", "FaChartLine", "FaChartPie", "FaBrainCircuit",
  "FaSearch", "FaFilter", "FaTable", "FaFileCode",
  // Testing & QA
  "FaVial", "FaFlask", "FaCheckCircle", "FaTasks", "FaClipboardList",
  // Communication & API
  "FaPlug", "FaExchangeAlt", "FaBolt", "FaBroadcastTower",
  "FaEnvelope", "FaComments", "FaPhone", "FaVideo",
  // Business & Management
  "FaProjectDiagram", "FaSitemap", "FaUsersCog", "FaLayerGroup",
  "FaBriefcase", "FaChalkboardTeacher", "FaGraduationCap", "FaCertificate",
] as const;

type FaIconKey = keyof typeof FaIcons;

// ─── Icon Picker Component ────────────────────────────────────────────────────
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
      ICON_LIST.filter((name) =>
        name.toLowerCase().includes(search.toLowerCase())
      ),
    [search]
  );

  const SelectedIcon = value ? (FaIcons[value as FaIconKey] as React.ComponentType<{ size?: number; color?: string }>) : null;

  return (
    <div style={{ position: "relative" }}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          gap: "0.75rem",
          padding: "0.625rem 1rem",
          borderRadius: "0.5rem",
          border: "1px solid #374151",
          background: "#111827",
          color: value ? "#f9fafb" : "#6b7280",
          cursor: "pointer",
          fontSize: "0.875rem",
          textAlign: "left",
          transition: "border-color 0.2s",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.borderColor = "#6366f1")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.borderColor = "#374151")
        }
      >
        {SelectedIcon ? (
          <>
            <span
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "0.375rem",
                background: "#312e81",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <SelectedIcon size={16} color="#a5b4fc" />
            </span>
            <span style={{ fontWeight: 600, color: "#a5b4fc", fontFamily: "monospace" }}>
              {value}
            </span>
          </>
        ) : (
          <span style={{ color: "#6b7280" }}>🎨 Click to pick an icon…</span>
        )}
        <span style={{ marginLeft: "auto", color: "#6b7280", fontSize: "0.75rem" }}>
          {open ? "▲" : "▼"}
        </span>
      </button>

      {/* Picker panel */}
      {open && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 6px)",
            left: 0,
            right: 0,
            zIndex: 50,
            background: "#0f172a",
            border: "1px solid #334155",
            borderRadius: "0.75rem",
            boxShadow: "0 20px 40px rgba(0,0,0,0.5)",
            overflow: "hidden",
          }}
        >
          {/* Search */}
          <div style={{ padding: "0.75rem", borderBottom: "1px solid #1e293b" }}>
            <input
              autoFocus
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search icons… (e.g. code, server, database)"
              style={{
                width: "100%",
                padding: "0.5rem 0.75rem",
                borderRadius: "0.5rem",
                border: "1px solid #334155",
                background: "#1e293b",
                color: "#f1f5f9",
                fontSize: "0.8125rem",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>

          {/* Icons grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(70px, 1fr))",
              gap: "0.25rem",
              padding: "0.75rem",
              maxHeight: "260px",
              overflowY: "auto",
            }}
          >
            {filtered.length === 0 && (
              <p
                style={{
                  gridColumn: "1/-1",
                  textAlign: "center",
                  color: "#475569",
                  fontSize: "0.8125rem",
                  padding: "1.5rem",
                }}
              >
                No icons found for &ldquo;{search}&rdquo;
              </p>
            )}
            {filtered.map((name) => {
              const Ico = FaIcons[name as FaIconKey] as React.ComponentType<{ size?: number; color?: string }>;
              if (!Ico) return null;
              const isSelected = value === name;
              return (
                <button
                  key={name}
                  type="button"
                  onClick={() => {
                    onChange(name);
                    setOpen(false);
                    setSearch("");
                  }}
                  title={name}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "0.375rem",
                    padding: "0.625rem 0.25rem",
                    borderRadius: "0.5rem",
                    border: `1px solid ${isSelected ? "#6366f1" : "transparent"}`,
                    background: isSelected ? "#312e8188" : "transparent",
                    cursor: "pointer",
                    transition: "all 0.15s",
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLButtonElement).style.background = "#1e293b";
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }}
                >
                  <Ico size={20} color={isSelected ? "#a5b4fc" : "#94a3b8"} />
                  <span
                    style={{
                      fontSize: "0.6rem",
                      color: isSelected ? "#a5b4fc" : "#64748b",
                      textAlign: "center",
                      lineHeight: 1.2,
                      wordBreak: "break-all",
                    }}
                  >
                    {name.replace(/^Fa/, "")}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Clear btn */}
          {value && (
            <div style={{ padding: "0.5rem 0.75rem", borderTop: "1px solid #1e293b" }}>
              <button
                type="button"
                onClick={() => { onChange(""); setOpen(false); }}
                style={{
                  fontSize: "0.75rem",
                  color: "#ef4444",
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  padding: 0,
                }}
              >
                ✕ Clear selection
              </button>
            </div>
          )}
        </div>
      )}

      {/* Manual input — always visible, stays in sync with the picker */}
      <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <span style={{ color: "#475569", fontSize: "0.75rem", whiteSpace: "nowrap" }}>
          أو اكتب يدوياً:
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="مثال: FaCode أو SiDocker أو FaRobot"
          style={{
            flex: 1,
            padding: "0.4rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid #334155",
            background: "#1e293b",
            color: "#f1f5f9",
            fontSize: "0.8125rem",
            outline: "none",
            fontFamily: "monospace",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#6366f1")}
          onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "#334155")}
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

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [icon, setIcon] = useState("");
  const [skills, setSkills] = useState<string[]>([]);

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
      console.error("Fetch skill groups failed:", err);
      setGlobalError("Failed to load skill groups. Ensure backend server is online.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSkillGroups(currentPage);
  }, [currentPage]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle("");
    setIcon("");
    setSkills([""]); // Initial empty skill input
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
        method: "POST", // In api.php, updates are Route::post('/skills/{id}')
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
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-theme-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Skills Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Group your skills and technologies (e.g. Backend, Frontend) and list their items.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="flex items-center gap-2">
          <span>Add Skill Group</span>
        </Button>
      </div>

      {globalError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm dark:bg-red-950/30 dark:text-red-400 dark:border-red-900">
          {globalError}
        </div>
      )}

      {/* Skills Table */}
      <div className="overflow-x-auto w-full">
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <TableHeader className="bg-gray-50 dark:bg-gray-800/40">
            <TableRow>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Group Title
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Icon Code
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Skills / Technologies
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800 bg-transparent">
            {isLoading ? (
              <TableRow>
                <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={4}>
                  <div className="flex justify-center items-center gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                    <span>Loading skill groups...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : skillGroups.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={4}>
                  No skill groups found. Click &quot;Add Skill Group&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              skillGroups.map((group) => (
                <TableRow key={group.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                  <TableCell className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                    {group.title}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {group.icon ? (
                      <code className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-mono text-xs text-brand-500">
                        {group.icon}
                      </code>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">N/A</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-wrap gap-1 max-w-[400px]">
                      {group.skills &&
                        group.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2.5 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-transparent dark:border-gray-700"
                          >
                            {skill}
                          </span>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openEditModal(group)}
                        className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(group.id)}
                        className="text-red-500 hover:text-red-400 transition-colors cursor-pointer"
                      >
                        Delete
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {meta && meta.last_page > 1 && (
        <div className="flex justify-between items-center mt-6">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing Page {meta.current_page} of {meta.last_page} ({meta.total} groups total)
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

      {/* Create/Edit Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-2xl">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-4">
            {isEditing ? "Edit Skill Group" : "Add New Skill Group"}
          </h3>

          {globalError && (
            <div className="mb-4 p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs dark:bg-red-950/30 dark:text-red-400 dark:border-red-900">
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Group Title */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Group Title <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleFieldChange("title", e.target.value, setTitle)}
                className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                  errors.title
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                }`}
                placeholder="E.g. Backend Development"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title[0]}</p>
              )}
            </div>

            {/* Icon Picker */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Icon (Optional)
              </Label>
              <IconPicker
                value={icon}
                onChange={(val) => handleFieldChange("icon", val, setIcon)}
              />
              {errors.icon && (
                <p className="mt-1 text-xs text-red-500">{errors.icon[0]}</p>
              )}
            </div>

            {/* Dynamic Skills Array Builder */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Skills / Technologies <span className="text-red-500">*</span>
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {skills.map((skill, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      required
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      className={`w-full h-10 px-3 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:border-brand-500 ${
                        errors[`skills.${index}`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                      }`}
                      placeholder={`Skill Item #${index + 1} (e.g. Node.js)`}
                    />
                    {skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSkillField(index)}
                        className="text-red-500 hover:text-red-400 p-1 cursor-pointer transition-colors"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={addSkillField}
                className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>+ Add Skill Item</span>
              </button>
              {errors.skills && (
                <p className="mt-1 text-xs text-red-500">{errors.skills[0]}</p>
              )}
            </div>

            {/* Submit Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-100 dark:border-gray-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsModalOpen(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Saving..." : "Save Skill Group"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
