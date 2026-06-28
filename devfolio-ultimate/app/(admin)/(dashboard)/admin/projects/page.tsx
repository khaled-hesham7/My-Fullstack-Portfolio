"use client";

import React, { useEffect, useState, useRef } from "react";
import { Modal } from "../../../components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import Image from "next/image";
import { resolveImageUrl, getApiBaseUrl } from "@/lib/utils";

interface ProjectItem {
  id: number;
  title: string;
  description: string;
  github_link: string;
  demo_link: string;
  tags: string[];
  image_url: string | null;
  is_featured: boolean;
  created_at: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
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
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [githubLink, setGithubLink] = useState("");
  const [demoLink, setDemoLink] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Errors state
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("admin_token");
      setToken(storedToken);
    }
  }, []);

  const fetchProjects = async (page: number) => {
    setIsLoading(true);
    setGlobalError("");
    try {
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/projects?page=${page}`, {
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
        setProjects(paginatedData.data || []);
        setMeta({
          current_page: paginatedData.current_page,
          last_page: paginatedData.last_page,
          total: paginatedData.total,
          per_page: paginatedData.per_page,
        });
      }
    } catch (err: any) {
      console.error("Fetch projects failed:", err);
      setGlobalError("Failed to load projects. Ensure backend server is online.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects(currentPage);
  }, [currentPage]);

  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitle("");
    setDescription("");
    setTags("");
    setGithubLink("");
    setDemoLink("");
    setIsFeatured(false);
    setSelectedFile(null);
    setPreviewUrl(null);
    setErrors({});
    setGlobalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (project: ProjectItem) => {
    setIsEditing(true);
    setEditingId(project.id);
    setTitle(project.title);
    setDescription(project.description);
    setTags(project.tags ? project.tags.join(", ") : "");
    setGithubLink(project.github_link || "");
    setDemoLink(project.demo_link || "");
    setIsFeatured(project.is_featured || false);
    setSelectedFile(null);
    setPreviewUrl(project.image_url);
    setErrors({});
    setGlobalError("");
    setIsModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      // Clear specific error
      if (errors.project_image) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.project_image;
          return next;
        });
      }
    }
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
      const formDataObj = new FormData();
      formDataObj.append("title", title);
      formDataObj.append("description", description);
      formDataObj.append("github_link", githubLink);
      formDataObj.append("demo_link", demoLink);
      formDataObj.append("is_featured", isFeatured ? "1" : "0");

      // Convert comma separated tags to array
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      
      tagsArray.forEach((tag) => {
        formDataObj.append("tags[]", tag);
      });

      if (selectedFile) {
        formDataObj.append("project_image", selectedFile);
      }

      const apiBase = getApiBaseUrl();
      const url = isEditing
        ? `${apiBase}/projects/${editingId}`
        : `${apiBase}/projects`;

      const activeToken = token || localStorage.getItem("admin_token");

      const response = await fetch(url, {
        method: "POST", // Laravel routing expects POST for updates too due to files handling
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        },
        body: formDataObj,
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
        fetchProjects(currentPage);
      }
    } catch (err: any) {
      console.error("Form submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;

    try {
      const apiBase = getApiBaseUrl();
      const activeToken = token || localStorage.getItem("admin_token");
      const response = await fetch(`${apiBase}/projects/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete project.");
      }

      const payload = await response.json();
      if (payload.success) {
        // If current page projects count becomes 1 and we delete it, go to previous page
        if (projects.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchProjects(currentPage);
        }
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "Could not delete project.");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-theme-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Projects Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create, view, edit and delete your projects.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="flex items-center gap-2">
          <span>Add Project</span>
        </Button>
      </div>

      {globalError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
          {globalError}
        </div>
      )}

      {/* Projects Table */}
      <div className="overflow-x-auto w-full">
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <TableHeader className="bg-gray-50 dark:bg-gray-800/40">
            <TableRow>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Preview
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Title
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Description
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Tags
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Links
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Featured
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
                    <span>Loading projects...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : projects.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={6}>
                  No projects found. Click &quot;Add Project&quot; to create one.
                </TableCell>
              </TableRow>
            ) : (
              projects.map((project) => (
                <TableRow key={project.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                  <TableCell className="px-4 py-3">
                    <div className="relative w-16 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {project.image_url ? (
                        <Image
                          src={resolveImageUrl(project.image_url, "")}
                          alt={project.title}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      ) : (
                        <span className="flex items-center justify-center h-full text-[10px] text-gray-400">
                          No Image
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                    {project.title}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                    {project.description}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {project.tags &&
                        project.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 text-[10px] rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-transparent dark:border-gray-700"
                          >
                            {tag}
                          </span>
                        ))}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col gap-0.5 text-xs">
                      {project.github_link && (
                        <a
                          href={project.github_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          GitHub
                        </a>
                      )}
                      {project.demo_link && (
                        <a
                          href={project.demo_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-cyan-400 hover:underline"
                        >
                          Demo
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                        project.is_featured
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {project.is_featured ? "Featured" : "Regular"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => openEditModal(project)}
                        className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
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
            Showing Page {meta.current_page} of {meta.last_page} ({meta.total} Projects total)
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
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-xl">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-4">
            {isEditing ? "Edit Project" : "Add New Project"}
          </h3>

          {globalError && (
            <div className="mb-4 p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs">
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Title */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Project Title <span className="text-red-500">*</span>
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
                placeholder="E.g. Digital Forge Portfolio"
              />
              {errors.title && (
                <p className="mt-1 text-xs text-red-500">{errors.title[0]}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Description <span className="text-red-500">*</span>
              </Label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => handleFieldChange("description", e.target.value, setDescription)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                  errors.description
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                }`}
                placeholder="Describe your project, stack, achievements..."
              />
              {errors.description && (
                <p className="mt-1 text-xs text-red-500">{errors.description[0]}</p>
              )}
            </div>

            {/* Tags */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Tags / Technologies <span className="text-red-500">*</span>
              </Label>
              <input
                type="text"
                required
                value={tags}
                onChange={(e) => handleFieldChange("tags", e.target.value, setTags)}
                className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                  errors.tags
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                }`}
                placeholder="Separate tags with commas, e.g. PHP, Laravel, Next.js"
              />
              {errors.tags && (
                <p className="mt-1 text-xs text-red-500">{errors.tags[0]}</p>
              )}
            </div>

            {/* Links Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* GitHub Link */}
              <div>
                <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                  GitHub Repository Link
                </Label>
                <input
                  type="url"
                  value={githubLink}
                  onChange={(e) => handleFieldChange("github_link", e.target.value, setGithubLink)}
                  className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                    errors.github_link
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                  }`}
                  placeholder="https://github.com/..."
                />
                {errors.github_link && (
                  <p className="mt-1 text-xs text-red-500">{errors.github_link[0]}</p>
                )}
              </div>

              {/* Demo Link */}
              <div>
                <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                  Live Demo Link
                </Label>
                <input
                  type="url"
                  value={demoLink}
                  onChange={(e) => handleFieldChange("demo_link", e.target.value, setDemoLink)}
                  className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                    errors.demo_link
                      ? "border-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                  }`}
                  placeholder="https://yourdomain.com"
                />
                {errors.demo_link && (
                  <p className="mt-1 text-xs text-red-500">{errors.demo_link[0]}</p>
                )}
              </div>
            </div>

            {/* Project Image Upload */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Project Image {!isEditing && <span className="text-red-500">*</span>}
              </Label>
              <div className="flex gap-4 items-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 transition-colors"
                >
                  Choose File
                </button>
                {selectedFile && (
                  <span className="text-xs text-gray-500 truncate max-w-[200px]">
                    {selectedFile.name}
                  </span>
                )}
              </div>
              {errors.project_image && (
                <p className="mt-1 text-xs text-red-500">{errors.project_image[0]}</p>
              )}

              {/* Preview */}
              {previewUrl && (
                <div className="mt-3 relative w-32 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 dark:border-gray-800">
                  <Image
                    src={resolveImageUrl(previewUrl, "")}
                    alt="Upload Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      if (fileInputRef.current) fileInputRef.current.value = "";
                    }}
                    className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white hover:bg-black transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              )}
            </div>

            {/* Featured Toggle */}
            <div className="flex items-center gap-2 mt-4 py-2">
              <input
                type="checkbox"
                id="is_featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 text-brand-500 border-gray-300 rounded focus:ring-brand-500"
              />
              <Label htmlFor="is_featured" className="text-sm font-semibold text-gray-700 dark:text-gray-300 select-none cursor-pointer">
                Show on Homepage (Featured)
              </Label>
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
                {formLoading ? "Saving..." : "Save Project"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
