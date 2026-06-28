"use client";

import React, { useEffect, useState, useRef } from "react";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import Image from "next/image";
import { resolveImageUrl, getApiBaseUrl } from "@/lib/utils";
import { apiFetch } from "@/lib/api/config";
import { FaFilePdf, FaTrash } from "react-icons/fa";

export default function AdminAboutSettingsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // General CV
  const [selectedCv, setSelectedCv] = useState<File | null>(null);
  const [serverGeneralCv, setServerGeneralCv] = useState<string | null>(null);

  // Backend CV
  const [selectedCvBackend, setSelectedCvBackend] = useState<File | null>(null);
  const [serverBackendCv, setServerBackendCv] = useState<string | null>(null);

  // QA CV
  const [selectedCvQa, setSelectedCvQa] = useState<File | null>(null);
  const [serverQaCv, setServerQaCv] = useState<string | null>(null);

  // Deletion States
  const [deleteGeneral, setDeleteGeneral] = useState(false);
  const [deleteBackend, setDeleteBackend] = useState(false);
  const [deleteQa, setDeleteQa] = useState(false);

  // Errors & Status
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const cvInputRef = useRef<HTMLInputElement>(null);
  const cvBackendInputRef = useRef<HTMLInputElement>(null);
  const cvQaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("admin_token");
      setToken(storedToken);
    }
  }, []);

  const fetchAboutMeInfo = async () => {
    setIsLoading(true);
    setGlobalError("");
    try {
      const apiBase = getApiBaseUrl();
      const payload = await apiFetch(apiBase, "/portfolio-data", {
        cache: "no-store",
        headers: {
          Accept: "application/json",
        },
      }, "admin_token");

      if (payload.success && payload.data && payload.data.about) {
        const data = payload.data;
        setTitle(data.about.title || '');
        setDescription(data.about.description || '');
        // Save active server URLs to state for conditional rendering
        setServerGeneralCv(data.about.general_cv_url || data.about.cv_url || null);
        setServerBackendCv(data.about.backend_cv_url || data.about.cv_backend_url || null);
        setServerQaCv(data.about.qa_cv_url || data.about.cv_qa_url || null);
        setImagePreviewUrl(data.about.image_url && data.about.image_url !== "" ? data.about.image_url : null);
        setDeleteGeneral(false);
        setDeleteBackend(false);
        setDeleteQa(false);
      }
    } catch (err: any) {
      console.error("Fetch AboutMe failed:", err);
      if (err.status !== 404) {
        setGlobalError("Failed to load About settings. Ensure backend server is online.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAboutMeInfo();
  }, []);

  const handleFieldChange = (
    field: string,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>
  ) => {
    setter(value);
    setSuccessMessage("");
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      setImagePreviewUrl(URL.createObjectURL(file));
      setSuccessMessage("");
      if (errors.image_file) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.image_file;
          return next;
        });
      }
    }
  };

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedCv(file);
      setServerGeneralCv(null); // Clear URL preview to show new selection name
      setSuccessMessage("");
      if (errors.cv_file || errors.general_cv) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.cv_file;
          delete next.general_cv;
          return next;
        });
      }
    }
  };

  const handleCvBackendChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedCvBackend(file);
      setServerBackendCv(null);
      setSuccessMessage("");
      if (errors.cv_backend_file || errors.backend_cv) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.cv_backend_file;
          delete next.backend_cv;
          return next;
        });
      }
    }
  };

  const handleCvQaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedCvQa(file);
      setServerQaCv(null);
      setSuccessMessage("");
      if (errors.cv_qa_file || errors.qa_cv) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.cv_qa_file;
          delete next.qa_cv;
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

      const formDataObj = new FormData();
      formDataObj.append("_method", "PUT");
      formDataObj.append("title", title);
      formDataObj.append("description", description);

      if (selectedImage) {
        formDataObj.append("image_file", selectedImage);
      }

      if (selectedCv) {
        formDataObj.append("general_cv", selectedCv);
      }

      if (selectedCvBackend) {
        formDataObj.append("backend_cv", selectedCvBackend);
      }

      if (selectedCvQa) {
        formDataObj.append("qa_cv", selectedCvQa);
      }

      // Append deletion indicators
      if (deleteGeneral) {
        formDataObj.append("delete_general_cv", "1");
      }
      if (deleteBackend) {
        formDataObj.append("delete_backend_cv", "1");
      }
      if (deleteQa) {
        formDataObj.append("delete_qa_cv", "1");
      }

      const response = await fetch(`${apiBase}/about/update`, {
        method: "POST", // Laravel accepts POST for updates handling file uploads
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
        setSuccessMessage("About Me information saved successfully!");
        setSelectedImage(null);
        setSelectedCv(null);
        setSelectedCvBackend(null);
        setSelectedCvQa(null);
        setDeleteGeneral(false);
        setDeleteBackend(false);
        setDeleteQa(false);
        fetchAboutMeInfo();
      }
    } catch (err: any) {
      console.error("AboutMe submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteCv = (track: 'general' | 'backend' | 'qa') => {
    if (track === 'general') {
      setDeleteGeneral(true);
      setServerGeneralCv(null);
      setSelectedCv(null);
    } else if (track === 'backend') {
      setDeleteBackend(true);
      setServerBackendCv(null);
      setSelectedCvBackend(null);
    } else if (track === 'qa') {
      setDeleteQa(true);
      setServerQaCv(null);
      setSelectedCvQa(null);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-theme-xs max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
          About Settings (Professional Biography)
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update the profile details, textual biography summary, profile image, and CV asset rendered on the About section.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12 gap-2 text-gray-500 dark:text-gray-400">
          <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
          <span>Loading About Me details...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900 font-semibold font-sans">
              {successMessage}
            </div>
          )}

          {globalError && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm dark:bg-red-950/30 dark:text-red-400 dark:border-red-900">
              {globalError}
            </div>
          )}

          {/* Headline Title */}
          <div>
            <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
              Headline Title <span className="text-red-500">*</span>
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
              placeholder="E.g. Software Engineering"
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title[0]}</p>
            )}
          </div>

          {/* Long textual biography */}
          <div>
            <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
              About Description / Professional Biography <span className="text-red-500">*</span>
            </Label>
            <textarea
              required
              rows={8}
              value={description}
              onChange={(e) => handleFieldChange("description", e.target.value, setDescription)}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                errors.description
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
              }`}
              placeholder="Seeking a challenging career in Software Engineering, working with a creative team..."
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description[0]}</p>
            )}
          </div>

          {/* Media Sections Grid */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            {/* About Page Photo Avatar */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                About Profile Image
              </Label>
              <div className="flex flex-col gap-3">
                <input
                  type="file"
                  ref={imageInputRef}
                  onChange={handleImageChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-white text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-700 transition-colors cursor-pointer"
                  >
                    Choose Photo File
                  </button>
                  {selectedImage && (
                    <span className="text-xs text-gray-500 truncate max-w-[200px] self-center">
                      {selectedImage.name}
                    </span>
                  )}
                </div>
                {errors.image_file && (
                  <p className="mt-0.5 text-xs text-red-500">{errors.image_file[0]}</p>
                )}

                {/* Preview Image */}
                {imagePreviewUrl ? (
                  <div className="relative w-28 h-28 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 dark:border-gray-800 mt-1">
                    <Image
                      src={resolveImageUrl(imagePreviewUrl)}
                      alt="About Avatar Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-28 h-28 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400 border border-gray-200 dark:border-gray-800 mt-1">
                    No Image
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="submit" disabled={formLoading} className="w-full sm:w-auto">
              {formLoading ? "Saving About Settings..." : "Save About Settings"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
