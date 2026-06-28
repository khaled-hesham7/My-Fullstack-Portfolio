"use client";

import React, { useEffect, useState } from "react";
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
        method: "POST", // Managed via Route::post in api.php
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
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-theme-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Education & Qualifications Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, view, edit and delete academic degrees, courses, internships and certificates.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="flex items-center gap-2">
          <span>Add Education</span>
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

      {/* Education Table */}
      <div className="overflow-x-auto w-full">
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <TableHeader className="bg-gray-50 dark:bg-gray-800/40">
            <TableRow>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Category
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Title / Program
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                University / Org
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Location
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Duration
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Grade
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800 bg-transparent">
            {isLoading ? (
              <TableRow>
                <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={7}>
                  <div className="flex justify-center items-center gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                    <span>Loading records...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : educationList.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={7}>
                  No records found. Click &quot;Add Education&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              educationList.map((edu) => (
                <TableRow key={edu.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                  <TableCell className="px-4 py-3 text-xs">
                    <span className="px-2 py-1 rounded-md font-semibold bg-brand-500/10 text-brand-500 dark:bg-cyan-500/10 dark:text-cyan-400 border border-brand-500/20 dark:border-cyan-500/20">
                      {edu.type || "Education"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                    {edu.degree}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {edu.university || <span className="text-gray-300 dark:text-gray-600">N/A</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {edu.location || <span className="text-gray-300 dark:text-gray-600">N/A</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {edu.duration || <span className="text-gray-300 dark:text-gray-600">N/A</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    {edu.grade || <span className="text-gray-300 dark:text-gray-600">N/A</span>}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openEditModal(edu)}
                        className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(edu.id)}
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
            {isEditing ? "Edit Education Record" : "Add New Education"}
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
            {/* Type / Category */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Category / Type <span className="text-red-500">*</span>
              </Label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-11 px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 text-sm dark:bg-gray-900 dark:text-white outline-none focus:border-brand-500 cursor-pointer"
              >
                <option value="Education">Education</option>
                <option value="Diploma">Diploma</option>
                <option value="Certification">Certification</option>
                <option value="Course">Course</option>
                <option value="Bootcamp">Bootcamp</option>
                <option value="Internship">Internship</option>
                <option value="Workshop">Workshop</option>
                <option value="Fellowship">Fellowship</option>
                <option value="Award & Honor">Award & Honor</option>
              </select>
            </div>

            {/* Degree */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Title / Degree / Program <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                required
                value={degree}
                onChange={(e) => handleFieldChange("degree", e.target.value, setDegree)}
                className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                  errors.degree
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                }`}
                placeholder="E.g. Bachelor of Computer Science or AWS Certified"
              />
              {errors.degree && (
                <p className="mt-1 text-xs text-red-500">{errors.degree[0]}</p>
              )}
            </div>

            {/* University */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                University / Organization / Platform <span className="text-xs text-gray-400 font-normal">(Optional)</span>
              </Label>
              <input
                type="text"
                value={university}
                onChange={(e) => handleFieldChange("university", e.target.value, setUniversity)}
                className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                  errors.university
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                }`}
                placeholder="E.g. Helwan University, Udemy, Coursera"
              />
              {errors.university && (
                <p className="mt-1 text-xs text-red-500">{errors.university[0]}</p>
              )}
            </div>

            {/* Location & Duration Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  placeholder="E.g. Cairo, Egypt"
                />
                {errors.location && (
                  <p className="mt-1 text-xs text-red-500">{errors.location[0]}</p>
                )}
              </div>

              {/* Duration */}
              <div>
                <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                  Duration
                </Label>
                <input
                  type="text"
                  value={duration}
                  onChange={(e) => handleFieldChange("duration", e.target.value, setDuration)}
                  className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                    errors.duration
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                  }`}
                  placeholder="E.g. 2020 - 2024"
                />
                {errors.duration && (
                  <p className="mt-1 text-xs text-red-500">{errors.duration[0]}</p>
                )}
              </div>
            </div>

            {/* Grade */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Grade / GPA
              </Label>
              <input
                type="text"
                value={grade}
                onChange={(e) => handleFieldChange("grade", e.target.value, setGrade)}
                className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                  errors.grade
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                }`}
                placeholder="E.g. Excellent or 3.8/4.0"
              />
              {errors.grade && (
                <p className="mt-1 text-xs text-red-500">{errors.grade[0]}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Description
              </Label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => handleFieldChange("description", e.target.value, setDescription)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                  errors.description
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                }`}
                placeholder="Details about majors, projects, honors..."
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description[0]}</p>
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
                {formLoading ? "Saving..." : "Save Education"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
