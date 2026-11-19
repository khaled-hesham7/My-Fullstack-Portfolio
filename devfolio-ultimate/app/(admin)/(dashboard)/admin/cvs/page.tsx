"use client";

import React, { useEffect, useState, useRef } from "react";
import { Modal } from "../../../components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import { getApiBaseUrl, resolveImageUrl } from "@/lib/utils";
import { FaFilePdf, FaExternalLinkAlt } from "react-icons/fa";

interface CvItem {
  id: number;
  title: string;
  file_url: string;
  created_at: string;
}

export default function AdminCvsPage() {
  const [cvs, setCvs] = useState<CvItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Fields
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [currentFileUrl, setCurrentFileUrl] = useState<string | null>(null);

  // Errors & Status
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("admin_token");
      setToken(storedToken);
    }
  }, []);

  const fetchCvs = async () => {
    setIsLoading(true);
    setGlobalError("");
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/cvs`, {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
      const payload = await res.json();
      if (payload.success) {
        setCvs(payload.data || []);
      }
    } catch (err: any) {
      console.error("Fetch CVs failed:", err);
      setGlobalError("Failed to load CV files from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCvs();
  }, []);

  const openCreateModal = () => {
    setEditingId(null);
    setTitle("");
    setSelectedFile(null);
    setCurrentFileUrl(null);
    setErrors({});
    setGlobalError("");
    setIsModalOpen(true);
  };

  const openEditModal = (item: CvItem) => {
    setEditingId(item.id);
    setTitle(item.title);
    setSelectedFile(null);
    setCurrentFileUrl(item.file_url);
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (errors.file) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.file;
          return next;
        });
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    setSuccessMessage("");
    setFormLoading(true);

    try {
      const activeToken = token || localStorage.getItem("admin_token");
      const apiBase = getApiBaseUrl();

      const formData = new FormData();
      formData.append("title", title);

      if (selectedFile) {
        formData.append("file", selectedFile);
      }

      const url = editingId ? `${apiBase}/cvs/${editingId}` : `${apiBase}/cvs`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        },
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 422) {
          setErrors(errData.errors || {});
          setGlobalError(errData.message || "Please check validation errors.");
          return;
        }
        if (response.status === 401) {
          setGlobalError("Session expired. Please log in again.");
          return;
        }
        throw new Error(errData.message || `Server returned code ${response.status}`);
      }

      const payload = await response.json();
      if (payload.success) {
        setSuccessMessage(editingId ? "CV updated successfully!" : "CV uploaded successfully!");
        setIsModalOpen(false);
        fetchCvs();
      }
    } catch (err: any) {
      console.error("Submit CV error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this CV record?")) return;

    try {
      const activeToken = token || localStorage.getItem("admin_token");
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/cvs/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) throw new Error("Failed to delete CV.");

      const payload = await response.json();
      if (payload.success) {
        setSuccessMessage("CV deleted successfully.");
        fetchCvs();
      }
    } catch (err: any) {
      console.error("Delete CV error:", err);
      setGlobalError(err.message || "Error deleting CV.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Studio Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-rose-500/10 to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full">
              Documents & Resumes
            </span>
            <span className="text-xs text-slate-400">Vault Manager</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            CV & Resume <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400">Vault</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage your downloadable PDF CVs, customized versions (Fullstack, Backend), and links.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 transition-all duration-200 shadow-lg shadow-rose-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Upload New CV
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Uploaded Files</span>
            <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-xs">
              📄
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{cvs.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Format Standard</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">
              ✓
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">PDF / DOCX</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Public Status</span>
            <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 text-xs">
              🌐
            </div>
          </div>
          <p className="text-2xl font-bold text-cyan-400 mt-2">Ready</p>
        </div>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-xs flex items-center gap-2">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {globalError && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{globalError}</span>
        </div>
      )}

      {/* CVs Table Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-full divide-y divide-slate-800/60">
            <TableHeader className="bg-slate-950/60">
              <TableRow>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Resume Title
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  File Document
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody className="divide-y divide-slate-800/40 bg-transparent">
              {isLoading ? (
                <TableRow>
                  <TableCell className="px-5 py-12 text-center text-slate-400" colSpan={3}>
                    <div className="flex justify-center items-center gap-2">
                      <span className="w-5 h-5 rounded-full border-2 border-rose-400 border-t-transparent animate-spin"></span>
                      <span className="text-sm">Loading documents...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : cvs.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-12 text-center text-slate-400" colSpan={3}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FaFilePdf className="text-4xl text-slate-600 mb-1" />
                      <p className="text-sm font-medium text-slate-300">No CV files registered yet</p>
                      <p className="text-xs text-slate-500">Click &quot;Upload New CV&quot; to provide candidates and clients with your resume.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                cvs.map((item) => (
                  <TableRow key={item.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Title */}
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center text-base shrink-0">
                          <FaFilePdf />
                        </div>
                        <div>
                          <span className="font-semibold text-white text-sm block">
                            {item.title}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            Added: {item.created_at ? new Date(item.created_at).toLocaleDateString() : "Active"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* File link */}
                    <TableCell className="px-5 py-3.5">
                      {item.file_url ? (
                        <a
                          href={resolveImageUrl(item.file_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-cyan-300 border border-slate-700/60 transition-colors"
                        >
                          <span>View / Download PDF</span>
                          <FaExternalLinkAlt className="text-[10px]" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-600">No File</span>
                      )}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 border border-transparent hover:border-cyan-500/20 transition-all"
                          title="Edit CV"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                          title="Delete CV"
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
      </div>

      {/* Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        showCloseButton={false}
        className="max-w-lg border border-slate-800 bg-slate-950/95 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 text-sm">
                <FaFilePdf />
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  {editingId ? "Edit CV Record" : "Upload New CV"}
                </h3>
                <p className="text-xs text-slate-400">
                  Select a document file and set the button title
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

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                CV Button Title <span className="text-rose-400">*</span>
              </Label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => handleFieldChange("title", e.target.value, setTitle)}
                className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/30 transition-all"
                placeholder="e.g. Senior Fullstack Engineer (PDF)"
              />
              {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title[0]}</p>}
            </div>

            <div>
              <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                PDF / DOCX File {!editingId && <span className="text-rose-400">*</span>}
              </Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx"
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-slate-800 hover:border-rose-500/50 rounded-xl p-5 text-center cursor-pointer bg-slate-900/40 hover:bg-slate-900/70 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto mb-2 text-lg">
                  <FaFilePdf />
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  {selectedFile ? selectedFile.name : "Click to select CV document"}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supported formats: PDF, DOCX (Max 10MB)
                </p>
                {currentFileUrl && !selectedFile && (
                  <p className="text-xs text-emerald-400 mt-2">
                    Current document is active. Choose a file only to replace it.
                  </p>
                )}
              </div>
              {errors.file && <p className="mt-1 text-xs text-rose-400">{errors.file[0]}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800/80">
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
                disabled={formLoading}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-rose-500 to-amber-600 hover:from-rose-400 hover:to-amber-500 transition-all shadow-lg shadow-rose-500/20 disabled:opacity-50"
              >
                {formLoading && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{editingId ? "Update CV" : "Upload & Publish CV"}</span>
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
