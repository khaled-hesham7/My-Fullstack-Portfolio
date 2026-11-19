"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Modal } from "../../../components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import { getApiBaseUrl } from "@/lib/utils";

interface EducationItem {
  id: number;
  type?: string | null;
  degree: string;
  university: string | null;
  location: string | null;
  duration: string | null;
  grade: string | null;
  description: string | null;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export default function AdminEducationPage() {
  const [educationList, setEducationList] = useState<EducationItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<"all" | "Education" | "Certificate" | "Course">("all");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [type, setType] = useState("Education");
  const [degree, setDegree] = useState("");
  const [university, setUniversity] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [grade, setGrade] = useState("");
  const [description, setDescription] = useState("");

  // Errors state
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("admin_token");
      setToken(storedToken);
    }
  }, []);

  const fetchEducation = async (page: number) => {
    setIsLoading(true);
    setGlobalError("");
    try {
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/education?page=${page}`, {
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
          setEducationList(paginatedData.data);
          setMeta({
            current_page: paginatedData.current_page,
            last_page: paginatedData.last_page,
            total: paginatedData.total,
            per_page: paginatedData.per_page,
          });
        } else {
          setEducationList(payload.data || []);
          setMeta(null);
        }
      }
    } catch (err: any) {
      console.error("Fetch education failed:", err);
      setGlobalError("Failed to load education records. Ensure backend server is online.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEducation(currentPage);
  }, [currentPage]);

  // Filtered list
  const filteredEducation = useMemo(() => {
    return educationList.filter((item) => {
      const matchesSearch =
        !searchQuery ||
        item.degree.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.university && item.university.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      if (selectedTypeFilter !== "all") {
        return (item.type || "Education").toLowerCase() === selectedTypeFilter.toLowerCase();
      }
      return true;
    });
  }, [educationList, searchQuery, selectedTypeFilter]);

  // Metrics
  const stats = useMemo(() => {
    const total = meta?.total ?? educationList.length;
    const degrees = educationList.filter((e) => (e.type || "Education") === "Education").length;
    const certs = educationList.filter((e) => (e.type || "").toLowerCase().includes("cert") || (e.type || "").toLowerCase().includes("course")).length;
    return { total, degrees, certs };
  }, [educationList, meta]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setType("Education");
    setDegree("");
    setUniversity("");
    setLocation("");
    setDuration("");
    setGrade("");
    setDescription("");
    setErrors({});
    setGlobalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (edu: EducationItem) => {
    setIsEditing(true);
    setEditingId(edu.id);
    setType(edu.type || "Education");
    setDegree(edu.degree);
    setUniversity(edu.university || "");
    setLocation(edu.location || "");
    setDuration(edu.duration || "");
    setGrade(edu.grade || "");
    setDescription(edu.description || "");
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    setFormLoading(true);

    try {
      const activeToken = token || localStorage.getItem("admin_token");
      const apiBase = getApiBaseUrl();

      const payloadBody = {
        type: type,
        degree: degree,
        university: university.trim() === "" ? null : university,
        location: location.trim() === "" ? null : location,
        duration: duration.trim() === "" ? null : duration,
        grade: grade.trim() === "" ? null : grade,
        description: description.trim() === "" ? null : description,
      };

      const url = isEditing
        ? `${apiBase}/education/${editingId}`
        : `${apiBase}/education`;

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
        fetchEducation(currentPage);
      }
    } catch (err: any) {
      console.error("Education form submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this education record?")) return;

    try {
      const apiBase = getApiBaseUrl();
      const activeToken = token || localStorage.getItem("admin_token");
      const response = await fetch(`${apiBase}/education/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete education record.");
      }

      const payload = await response.json();
      if (payload.success) {
        if (educationList.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchEducation(currentPage);
        }
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "Could not delete education record.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Studio Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-blue-500/10 to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full">
              Credentials & Qualifications
            </span>
            <span className="text-xs text-slate-400">Academic Manager</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Education & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Certificates</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Showcase university degrees, professional certificates, bootcamps, and technical courses.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 transition-all duration-200 shadow-lg shadow-blue-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Qualification
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Credentials</span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-xs">
              🎓
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Academic Degrees</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">
              🏛️
            </div>
          </div>
          <p className="text-2xl font-bold text-indigo-400 mt-2">{stats.degrees}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Courses & Certs</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">
              📜
            </div>
          </div>
          <p className="text-2xl font-bold text-cyan-400 mt-2">{stats.certs}</p>
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
            placeholder="Search degrees, university, grade..."
            className="w-full h-9.5 pl-9 pr-8 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/30 transition-all"
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
              { key: "all", label: "All Credentials" },
              { key: "Education", label: "🎓 Degrees" },
              { key: "Certificate", label: "📜 Certificates" },
              { key: "Course", label: "💻 Courses" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setSelectedTypeFilter(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 ${
                selectedTypeFilter === tab.key
                  ? "bg-blue-500 text-white font-semibold shadow-md shadow-blue-500/20"
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
                  Degree / Certificate
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Type & Category
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Institution & Duration
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Grade / Description
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
                      <span className="w-5 h-5 rounded-full border-2 border-blue-400 border-t-transparent animate-spin"></span>
                      <span className="text-sm">Loading qualifications...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredEducation.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-12 text-center text-slate-400" colSpan={5}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">🎓</span>
                      <p className="text-sm font-medium text-slate-300">No education records found</p>
                      <p className="text-xs text-slate-500">Click &quot;Add Qualification&quot; to register your studies.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredEducation.map((edu) => (
                  <TableRow key={edu.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Degree */}
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-base shrink-0">
                          {(edu.type || "").toLowerCase().includes("cert") ? "📜" : "🎓"}
                        </div>
                        <div>
                          <span className="font-semibold text-white text-sm block">
                            {edu.degree}
                          </span>
                          <span className="text-xs text-slate-400">
                            {edu.university || "Accredited Institution"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Type Badge */}
                    <TableCell className="px-5 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 border border-blue-500/20 text-blue-300">
                        {edu.type || "Education"}
                      </span>
                    </TableCell>

                    {/* Location & Duration */}
                    <TableCell className="px-5 py-3.5">
                      <div className="space-y-0.5">
                        <p className="text-xs text-slate-200 font-mono">
                          {edu.duration || "N/A"}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {edu.location || "Online"}
                        </p>
                      </div>
                    </TableCell>

                    {/* Grade & Description */}
                    <TableCell className="px-5 py-3.5 max-w-[260px]">
                      {edu.grade && (
                        <span className="inline-block px-2 py-0.5 text-[11px] font-mono rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-1">
                          Grade: {edu.grade}
                        </span>
                      )}
                      <p className="text-xs text-slate-400 line-clamp-2">
                        {edu.description || "—"}
                      </p>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(edu)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 border border-transparent hover:border-blue-500/20 transition-all"
                          title="Edit Record"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(edu.id)}
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
                ))
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
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 text-sm">
                {isEditing ? "✏️" : "🎓"}
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isEditing ? "Edit Qualification" : "Add New Qualification"}
                </h3>
                <p className="text-xs text-slate-400">
                  Register academic degrees or professional course certificates
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

            <form id="education-form" onSubmit={handleSubmit} className="space-y-4">
              {/* Type Selector Pills */}
              <div>
                <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                  Credential Type
                </Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: "Education", label: "🎓 Academic Degree" },
                    { key: "Certificate", label: "📜 Certificate" },
                    { key: "Course", label: "💻 Bootcamp / Course" },
                  ].map((t) => (
                    <button
                      key={t.key}
                      type="button"
                      onClick={() => setType(t.key)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        type === t.key
                          ? "bg-blue-500/20 border-blue-500/50 text-blue-300 shadow-sm"
                          : "bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Degree / Certificate Title */}
              <div>
                <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                  Degree / Certificate Name <span className="text-blue-400">*</span>
                </Label>
                <input
                  type="text"
                  required
                  value={degree}
                  onChange={(e) => handleFieldChange("degree", e.target.value, setDegree)}
                  className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  placeholder="e.g. Bachelor of Science in Computer Science"
                />
                {errors.degree && <p className="mt-1 text-xs text-rose-400">{errors.degree[0]}</p>}
              </div>

              {/* University & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                    University / Institute / Issuer
                  </Label>
                  <input
                    type="text"
                    value={university}
                    onChange={(e) => handleFieldChange("university", e.target.value, setUniversity)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    placeholder="e.g. Cairo University / Coursera / AWS"
                  />
                </div>

                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                    Location
                  </Label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => handleFieldChange("location", e.target.value, setLocation)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                    placeholder="e.g. Cairo, Egypt or Online"
                  />
                </div>
              </div>

              {/* Duration & Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                    Duration / Year
                  </Label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => handleFieldChange("duration", e.target.value, setDuration)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                    placeholder="e.g. 2018 - 2022"
                  />
                </div>

                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                    Grade / GPA / Honors (Optional)
                  </Label>
                  <input
                    type="text"
                    value={grade}
                    onChange={(e) => handleFieldChange("grade", e.target.value, setGrade)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all font-mono"
                    placeholder="e.g. 3.8 / 4.0 or Excellent with Honors"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                  Description / Major Focus
                </Label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => handleFieldChange("description", e.target.value, setDescription)}
                  className="w-full px-4 py-2.5 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/30 transition-all"
                  placeholder="Key coursework, graduation project, algorithms, or specialization details..."
                />
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
              form="education-form"
              disabled={formLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {formLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isEditing ? "Save Qualification" : "Publish Qualification"}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
