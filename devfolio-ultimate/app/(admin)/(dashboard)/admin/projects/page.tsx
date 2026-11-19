"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "featured" | "demo" | "github">("all");

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

  // Filtered list
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch =
        searchQuery === "" ||
        project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (project.tags && project.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())));

      if (!matchesSearch) return false;

      if (filterType === "featured") return project.is_featured;
      if (filterType === "demo") return Boolean(project.demo_link);
      if (filterType === "github") return Boolean(project.github_link);
      return true;
    });
  }, [projects, searchQuery, filterType]);

  // Metrics
  const stats = useMemo(() => {
    const total = meta?.total ?? projects.length;
    const featured = projects.filter((p) => p.is_featured).length;
    const withDemo = projects.filter((p) => Boolean(p.demo_link)).length;
    const withGithub = projects.filter((p) => Boolean(p.github_link)).length;
    return { total, featured, withDemo, withGithub };
  }, [projects, meta]);

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
    setIsFeatured(Boolean(project.is_featured));
    setSelectedFile(null);
    setPreviewUrl(project.image_url ? resolveImageUrl(project.image_url, "") : null);
    setErrors({});
    setGlobalError("");
    setIsModalOpen(true);
  };

  const handleFieldChange = (field: string, value: string, setter: (val: string) => void) => {
    setter(value);
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const tempUrl = URL.createObjectURL(file);
      setPreviewUrl(tempUrl);
      if (errors.project_image) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.project_image;
          return next;
        });
      }
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
      formDataObj.append("github_link", githubLink || "");
      formDataObj.append("demo_link", demoLink || "");
      formDataObj.append("is_featured", isFeatured ? "1" : "0");

      if (isEditing) {
        formDataObj.append("_method", "PUT");
      }

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
        method: "POST",
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
        throw new Error(`Failed to delete. Server code: ${response.status}`);
      }

      const payload = await response.json();
      if (payload.success) {
        if (projects.length === 1 && currentPage > 1) {
          setCurrentPage((prev) => prev - 1);
        } else {
          fetchProjects(currentPage);
        }
      }
    } catch (err: any) {
      console.error("Delete project failed:", err);
      setGlobalError(err.message || "Error occurred during deletion.");
    }
  };

  const handleToggleFeatured = async (project: ProjectItem) => {
    try {
      const apiBase = getApiBaseUrl();
      const activeToken = token || localStorage.getItem("admin_token");
      const response = await fetch(`${apiBase}/projects/${project.id}/featured`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to update status. Server code: ${response.status}`);
      }

      const payload = await response.json();
      if (payload.success) {
        setProjects((prev) =>
          prev.map((p) =>
            p.id === project.id ? { ...p, is_featured: !p.is_featured } : p
          )
        );
      }
    } catch (err: any) {
      console.error("Toggle featured failed:", err);
      setGlobalError(err.message || "Failed to toggle featured status.");
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
              Work & Portfolio
            </span>
            <span className="text-xs text-slate-400">Production Studio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Projects <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Manager</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Showcase your best engineering achievements, repositories, and live applications.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add New Project
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Total Projects</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">
              🚀
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{stats.total}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Featured (Home)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-xs">
              ⭐
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-400 mt-2">{stats.featured}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Live Demos</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">
              🌐
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">{stats.withDemo}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Git Repositories</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
              🐙
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">{stats.withGithub}</p>
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
            placeholder="Search projects by title, stack, tags..."
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

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {(
            [
              { key: "all", label: "All" },
              { key: "featured", label: "⭐ Featured" },
              { key: "demo", label: "🌐 Live Demos" },
              { key: "github", label: "🐙 GitHub" },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterType(tab.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all shrink-0 ${filterType === tab.key
                ? "bg-cyan-500 text-slate-950 font-semibold shadow-md shadow-cyan-500/20"
                : "bg-slate-800/60 text-slate-400 hover:text-slate-200 hover:bg-slate-800"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Table Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-full divide-y divide-slate-800/60">
            <TableHeader className="bg-slate-950/60">
              <TableRow>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Project Preview
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Details
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tech Stack
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Links
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Featured
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-800/40 bg-transparent">
              {isLoading ? (
                <TableRow>
                  <TableCell className="px-5 py-12 text-center text-slate-400" colSpan={6}>
                    <div className="flex justify-center items-center gap-2">
                      <span className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></span>
                      <span className="text-sm">Loading projects studio...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredProjects.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-12 text-center text-slate-400" colSpan={6}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">📂</span>
                      <p className="text-sm font-medium text-slate-300">No projects match the criteria</p>
                      <p className="text-xs text-slate-500">Try adjusting filters or click &quot;Add New Project&quot; above.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Thumbnail */}
                    <TableCell className="px-5 py-3.5">
                      <div className="relative w-20 h-12 rounded-lg overflow-hidden bg-slate-950 border border-slate-800 group">
                        {project.image_url ? (
                          <Image
                            src={resolveImageUrl(project.image_url, "")}
                            alt={project.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="80px"
                          />
                        ) : (
                          <span className="flex items-center justify-center h-full text-[10px] text-slate-500 font-mono">
                            No Cover
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Title & Description */}
                    <TableCell className="px-5 py-3.5 max-w-[280px]">
                      <div className="font-semibold text-white text-sm line-clamp-1">
                        {project.title}
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-0.5 leading-relaxed">
                        {project.description}
                      </p>
                    </TableCell>

                    {/* Tags */}
                    <TableCell className="px-5 py-3.5 max-w-[200px]">
                      <div className="flex flex-wrap gap-1.5">
                        {project.tags && project.tags.length > 0 ? (
                          project.tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 text-[11px] rounded-md bg-slate-800/90 text-cyan-300 border border-slate-700/60 font-mono"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-600 italic">No tags</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Links */}
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        {project.github_link ? (
                          <a
                            href={project.github_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-xs rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 hover:bg-purple-500/20 transition-colors flex items-center gap-1"
                            title={project.github_link}
                          >
                            <span>🐙</span>
                            <span>Repo</span>
                          </a>
                        ) : null}
                        {project.demo_link ? (
                          <a
                            href={project.demo_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 text-xs rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 hover:bg-emerald-500/20 transition-colors flex items-center gap-1"
                            title={project.demo_link}
                          >
                            <span>🌐</span>
                            <span>Live</span>
                          </a>
                        ) : null}
                        {!project.github_link && !project.demo_link && (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                      </div>
                    </TableCell>

                    {/* Featured status (Interactive 1-Click Toggle) */}
                    <TableCell className="px-5 py-3.5">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(project)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${project.is_featured
                            ? "bg-amber-500/10 border border-amber-500/30 text-amber-400 hover:bg-amber-500/20 shadow-sm shadow-amber-500/10"
                            : "bg-slate-800/60 border border-slate-700/60 text-slate-400 hover:text-white hover:bg-slate-800"
                          }`}
                        title="Click to toggle featured on home page"
                      >
                        <span>{project.is_featured ? "⭐ Featured" : "Standard"}</span>
                      </button>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(project)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all"
                          title="Edit Project"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                          title="Delete Project"
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

        {/* Pagination Bar */}
        {meta && meta.last_page > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800/80 bg-slate-950/40">
            <span className="text-xs text-slate-400">
              Page <span className="font-semibold text-white">{meta.current_page}</span> of{" "}
              <span className="font-semibold text-white">{meta.last_page}</span> ({meta.total} items)
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

      {/* Modern High-End Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showCloseButton={false}
        className="max-w-3xl border border-slate-800 bg-slate-950/95 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="flex flex-col max-h-[90vh]">
          {/* Custom Header with Isolated Close Button */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-sm">
                {isEditing ? "✏️" : "🚀"}
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {isEditing ? "Edit Project Details" : "Create New Project"}
                </h3>
                <p className="text-xs text-slate-400">
                  Fill in the project showcase specs and deployment links
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

          {/* Modal Body */}
          <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-5">
            {globalError && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs">
                {globalError}
              </div>
            )}

            <form id="project-form" onSubmit={handleSubmit} className="space-y-5">
              {/* Project Title */}
              <div>
                <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                  Project Title <span className="text-cyan-400">*</span>
                </Label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => handleFieldChange("title", e.target.value, setTitle)}
                  className={`w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 outline-none transition-all ${errors.title
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                    }`}
                  placeholder="e.g. Next-Gen Cloud Orchestrator"
                />
                {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title[0]}</p>}
              </div>

              {/* Description */}
              <div>
                <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                  Description / Architecture Highlights <span className="text-cyan-400">*</span>
                </Label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => handleFieldChange("description", e.target.value, setDescription)}
                  className={`w-full px-4 py-3 text-sm rounded-xl bg-slate-900/80 border text-white placeholder-slate-500 outline-none transition-all leading-relaxed ${errors.description
                    ? "border-rose-500 focus:border-rose-500"
                    : "border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30"
                    }`}
                  placeholder="Summarize the core technical value proposition, architectural highlights, stack used..."
                />
                {errors.description && <p className="mt-1 text-xs text-rose-400">{errors.description[0]}</p>}
              </div>

              {/* Tags / Stack */}
              <div>
                <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                  Tech Stack & Tags <span className="text-slate-500">(comma separated)</span>
                </Label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => handleFieldChange("tags", e.target.value, setTags)}
                  className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono"
                  placeholder="React, Next.js, TypeScript, Tailwind, Docker, PostgreSQL"
                />
                {tags && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {tags
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean)
                      .map((tag, idx) => (
                        <span key={idx} className="px-2 py-0.5 text-[11px] rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                          {tag}
                        </span>
                      ))}
                  </div>
                )}
                {errors.tags && <p className="mt-1 text-xs text-rose-400">{errors.tags[0]}</p>}
              </div>

              {/* Links Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                    🐙 GitHub Repository URL
                  </Label>
                  <input
                    type="url"
                    value={githubLink}
                    onChange={(e) => handleFieldChange("github_link", e.target.value, setGithubLink)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/30 transition-all"
                    placeholder="https://github.com/username/project"
                  />
                  {errors.github_link && <p className="mt-1 text-xs text-rose-400">{errors.github_link[0]}</p>}
                </div>

                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                    🌐 Live Demo URL
                  </Label>
                  <input
                    type="url"
                    value={demoLink}
                    onChange={(e) => handleFieldChange("demo_link", e.target.value, setDemoLink)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all"
                    placeholder="https://demo.example.com"
                  />
                  {errors.demo_link && <p className="mt-1 text-xs text-rose-400">{errors.demo_link[0]}</p>}
                </div>
              </div>

              {/* Cover Image Studio */}
              <div>
                <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                  Project Cover Image {!isEditing && <span className="text-cyan-400">*</span>}
                </Label>

                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-cyan-500/50 rounded-xl p-5 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 transition-all group"
                >
                  {previewUrl ? (
                    <div className="relative w-full h-44 rounded-lg overflow-hidden border border-slate-700">
                      <Image
                        src={resolveImageUrl(previewUrl, "")}
                        alt="Project Preview"
                        fill
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                        <span className="px-3 py-1.5 rounded-lg bg-cyan-500 text-slate-950 text-xs font-semibold shadow-lg">
                          Change Cover
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedFile(null);
                            setPreviewUrl(null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-500 text-white text-xs font-semibold shadow-lg"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mx-auto mb-2 text-xl group-hover:scale-110 transition-transform">
                        🖼️
                      </div>
                      <p className="text-sm font-semibold text-slate-200">
                        Click to upload project cover image
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        PNG, JPG, WEBP recommended (16:9 ratio)
                      </p>
                    </div>
                  )}
                </div>
                {errors.project_image && <p className="mt-1 text-xs text-rose-400">{errors.project_image[0]}</p>}
              </div>

              {/* Featured Switch Card */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 text-sm">
                    ⭐
                  </div>
                  <div>
                    <span className="text-sm font-semibold text-white block">
                      Feature on Homepage
                    </span>
                    <span className="text-xs text-slate-400">
                      Pin this project in the top featured portfolio showcase
                    </span>
                  </div>
                </div>

                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                </label>
              </div>
            </form>
          </div>

          {/* Sticky Modal Footer */}
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
              form="project-form"
              disabled={formLoading}
              className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {formLoading && (
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              )}
              <span>{isEditing ? "Save Project Changes" : "Publish Project"}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
