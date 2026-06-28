"use client";

import React, { useEffect, useState } from "react";
import { Modal } from "../../../components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import { getApiBaseUrl } from "@/lib/utils";

interface ExperienceItem {
  id: number;
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

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [duration, setDuration] = useState("");
  const [isCurrentJob, setIsCurrentJob] = useState(false);
  const [tasks, setTasks] = useState<string[]>([]);

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
      if (duration.toLowerCase().includes("present") || duration.includes("الآن") || duration.includes("الان")) {
        const parts = duration.split("-");
        setDuration(parts[0].trim());
      }
    }
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setJobTitle("");
    setCompany("");
    setLocation("");
    setDuration("");
    setIsCurrentJob(false);
    setTasks([""]); // Initial empty task input
    setErrors({});
    setGlobalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (exp: ExperienceItem) => {
    setIsEditing(true);
    setEditingId(exp.id);
    setJobTitle(exp.job_title);
    setCompany(exp.company || "");
    setLocation(exp.location || "");
    setDuration(exp.duration);
    const isPresent = exp.duration.toLowerCase().includes("present") || exp.duration.includes("الآن") || exp.duration.includes("الان");
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
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-theme-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Experiences Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, view, edit and delete your professional job experiences.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="flex items-center gap-2">
          <span>Add Experience</span>
        </Button>
      </div>

      {globalError && (
        <div className="mb-4 p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-sm flex items-center justify-between gap-3">
          <span>{globalError}</span>
          {globalError.includes("401") && (
            <a
              href="/admin/login"
              className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs whitespace-nowrap transition-colors shadow-md shadow-cyan-500/20"
            >
              Log In Again
            </a>
          )}
        </div>
      )}

      {/* Experience Table */}
      <div className="overflow-x-auto w-full">
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <TableHeader className="bg-gray-50 dark:bg-gray-800/40">
            <TableRow>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Job Title
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Company
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Location
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Duration
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Tasks
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800 bg-transparent">
            {isLoading ? (
              <TableRow>
                <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={6}>
                  <div className="flex justify-center items-center gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                    <span>Loading experiences...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : experiences.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={6}>
                  No experiences found. Click &quot;Add Experience&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              experiences.map((exp) => (
                <TableRow key={exp.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                  <TableCell className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                    {exp.job_title}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {exp.company || <span className="text-gray-300 dark:text-gray-600">N/A</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {exp.location || <span className="text-gray-300 dark:text-gray-600">N/A</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {exp.duration}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[240px]">
                    {exp.tasks && exp.tasks.length > 0 ? (
                      <ul className="list-disc pl-4 text-xs space-y-0.5 max-h-24 overflow-y-auto">
                        {exp.tasks.map((task, idx) => (
                          <li key={idx} className="truncate">
                            {task}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">No tasks defined</span>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openEditModal(exp)}
                        className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(exp.id)}
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
            Showing Page {meta.current_page} of {meta.last_page} ({meta.total} records total)
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
            {isEditing ? "Edit Experience" : "Add New Experience"}
          </h3>

          {globalError && (
            <div className="mb-4 p-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl text-xs flex items-center justify-between gap-3">
              <span>{globalError}</span>
              {globalError.includes("401") && (
                <a
                  href="/admin/login"
                  className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs whitespace-nowrap transition-colors shadow-md shadow-cyan-500/20"
                >
                  Log In Again
                </a>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Job Title */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Job Title <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                required
                value={jobTitle}
                onChange={(e) => handleFieldChange("job_title", e.target.value, setJobTitle)}
                className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                  errors.job_title
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                }`}
                placeholder="E.g. Senior Software Engineer"
              />
              {errors.job_title && (
                <p className="mt-1 text-xs text-red-500">{errors.job_title[0]}</p>
              )}
            </div>

            {/* Company & Location Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Company */}
              <div>
                <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                  Company
                </Label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => handleFieldChange("company", e.target.value, setCompany)}
                  className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                    errors.company
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                  }`}
                  placeholder="E.g. Google"
                />
                {errors.company && (
                  <p className="mt-1 text-xs text-red-500">{errors.company[0]}</p>
                )}
              </div>

              {/* Location */}
              <div>
                <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                  Location
                </Label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => handleFieldChange("location", e.target.value, setLocation)}
                  className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                    errors.location
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                  }`}
                  placeholder="E.g. Mountain View, CA"
                />
                {errors.location && (
                  <p className="mt-1 text-xs text-red-500">{errors.location[0]}</p>
                )}
              </div>
            </div>

            {/* Duration */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <Label className="text-sm font-semibold block text-gray-700 dark:text-gray-300">
                  Duration <span className="text-red-500">*</span>
                </Label>
                <label className="flex items-center gap-2 text-xs font-semibold text-brand-500 dark:text-cyan-400 cursor-pointer select-none bg-brand-500/10 dark:bg-cyan-500/10 hover:bg-brand-500/20 dark:hover:bg-cyan-500/20 px-3 py-1 rounded-lg transition-colors border border-brand-500/20 dark:border-cyan-500/20">
                  <input
                    type="checkbox"
                    checked={isCurrentJob}
                    onChange={handleCurrentJobToggle}
                    className="w-4 h-4 rounded border-cyan-500/30 bg-gray-900 text-cyan-500 focus:ring-cyan-400 accent-cyan-500 cursor-pointer"
                  />
                  <span>Currently working here</span>
                </label>
              </div>
              <input
                type="text"
                required
                value={duration}
                onChange={(e) => {
                  const val = e.target.value;
                  handleFieldChange("duration", val, setDuration);
                  setIsCurrentJob(val.toLowerCase().includes("present") || val.includes("الآن") || val.includes("الان"));
                }}
                className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                  errors.duration
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                }`}
                placeholder="E.g. 2022 - Present or 2022 - 2024"
              />
              {errors.duration && (
                <p className="mt-1 text-xs text-red-500">{errors.duration[0]}</p>
              )}
            </div>

            {/* Dynamic Tasks Array Builder */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Responsibilities / Key Tasks
              </Label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {tasks.map((task, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <input
                      type="text"
                      value={task}
                      onChange={(e) => handleTaskChange(index, e.target.value)}
                      className={`w-full h-10 px-3 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:border-brand-500 ${
                        errors[`tasks.${index}`] ? "border-red-500" : "border-gray-300 dark:border-gray-700"
                      }`}
                      placeholder={`Task #${index + 1}`}
                    />
                    {tasks.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTaskField(index)}
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
                onClick={addTaskField}
                className="mt-2 text-xs font-semibold text-primary hover:text-primary/80 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <span>+ Add Responsibility Task</span>
              </button>
              {errors.tasks && (
                <p className="mt-1 text-xs text-red-500">{errors.tasks[0]}</p>
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
                {formLoading ? "Saving..." : "Save Experience"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
