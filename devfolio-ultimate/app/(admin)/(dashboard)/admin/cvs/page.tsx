"use client";

import React, { useEffect, useState, useRef } from "react";
import { Modal } from "../../../components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import { getApiBaseUrl, resolveImageUrl } from "@/lib/utils";
import { FaFilePdf, FaPlus, FaEdit, FaTrash, FaExternalLinkAlt } from "react-icons/fa";

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
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
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
    setFormLoading(true);

    try {
      const activeToken = token || localStorage.getItem("admin_token");
      const apiBase = getApiBaseUrl();

      const formDataObj = new FormData();
      formDataObj.append("title", title);
      if (selectedFile) {
        formDataObj.append("file", selectedFile);
      }

      const url = editingId ? `${apiBase}/cvs/${editingId}` : `${apiBase}/cvs`;

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
        setSuccessMessage(editingId ? "CV updated successfully!" : "CV added successfully!");
        setIsModalOpen(false);
        fetchCvs();
      }
    } catch (err: any) {
      console.error("CV submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this CV file?")) return;

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
        setSuccessMessage("CV deleted successfully!");
        fetchCvs();
      }
    } catch (err: any) {
      console.error("Delete CV error:", err);
      alert("Failed to delete CV.");
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-theme-xs max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            CVs Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Add, edit, or delete dynamic CV download files and custom titles shown on your portfolio.
          </p>
        </div>
        <Button onClick={openCreateModal} className="flex items-center gap-2 text-xs">
          <FaPlus /> Add New CV
        </Button>
      </div>

      {successMessage && (
        <div className="p-3 mb-4 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900 font-semibold">
          {successMessage}
        </div>
      )}

      {globalError && (
        <div className="p-3 mb-4 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm dark:bg-red-950/30 dark:text-red-400 dark:border-red-900">
          {globalError}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-12 gap-2 text-gray-500 dark:text-gray-400">
          <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
          <span>Loading CV files...</span>
        </div>
      ) : cvs.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-gray-200 dark:border-gray-800 rounded-xl">
          <FaFilePdf className="mx-auto text-4xl text-gray-400 mb-2" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No CV files added yet.</p>
          <Button onClick={openCreateModal} className="mt-4 text-xs">
            Add Your First CV
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell isHeader>CV Title / Name</TableCell>
                <TableCell isHeader>File Link</TableCell>
                <TableCell isHeader>Actions</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cvs.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-semibold text-gray-800 dark:text-white">
                    <div className="flex items-center gap-2">
                      <FaFilePdf className="text-red-500 text-base" />
                      <span>{item.title}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.file_url ? (
                      <a
                        href={resolveImageUrl(item.file_url)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                      >
                        <span>View / Download PDF</span>
                        <FaExternalLinkAlt className="text-[10px]" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">No File Uploaded</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-blue-500 transition-colors"
                        title="Edit CV"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg text-red-500 transition-colors"
                        title="Delete CV"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Modal for Adding/Editing CV */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md p-6">
        <div className="mb-4">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white">
            {editingId ? "Edit CV Title / File" : "Add New CV"}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="mb-1 text-sm font-semibold block text-gray-700 dark:text-gray-300">
              CV Button Title / Name <span className="text-red-500">*</span>
            </Label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => handleFieldChange("title", e.target.value, setTitle)}
              className="w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none border-gray-300 dark:border-gray-700 focus:border-brand-500"
              placeholder="E.g. Backend Developer CV, Full Stack CV, etc."
            />
            {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title[0]}</p>}
          </div>

          <div>
            <Label className="mb-1 text-sm font-semibold block text-gray-700 dark:text-gray-300">
              PDF Document File {!editingId && <span className="text-red-500">*</span>}
            </Label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx"
              className="hidden"
            />
            <div className="flex flex-col gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 transition-colors cursor-pointer text-left"
              >
                {selectedFile ? `Selected: ${selectedFile.name}` : "Choose PDF / File"}
              </button>
              {currentFileUrl && !selectedFile && (
                <span className="text-xs text-emerald-500 truncate">
                  Current file active. Select a new file only if you want to replace it.
                </span>
              )}
            </div>
            {errors.file && <p className="mt-1 text-xs text-red-500">{errors.file[0]}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
            >
              Cancel
            </button>
            <Button type="submit" disabled={formLoading} className="text-xs">
              {formLoading ? "Saving..." : editingId ? "Update CV" : "Upload & Save CV"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
