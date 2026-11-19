"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import Image from "next/image";
import { resolveImageUrl, getApiBaseUrl } from "@/lib/utils";
import { apiFetch } from "@/lib/api/config";
import { FaFilePdf, FaArrowRight, FaCheckCircle, FaExclamationTriangle } from "react-icons/fa";

export default function AdminAboutSettingsPage() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Errors & Status
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);

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
      const payload = await apiFetch(
        apiBase,
        "/portfolio-data",
        {
          cache: "no-store",
          headers: {
            Accept: "application/json",
          },
        },
        "admin_token"
      );

      if (payload.success && payload.data && payload.data.about) {
        const data = payload.data;
        setTitle(data.about.title || "");
        setDescription(data.about.description || "");
        setImagePreviewUrl(
          data.about.image_url && data.about.image_url !== "" ? data.about.image_url : null
        );
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

      const response = await fetch(`${apiBase}/about/update`, {
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
        setSuccessMessage("About Me settings saved successfully!");
        setSelectedImage(null);
        fetchAboutMeInfo();
      }
    } catch (err: any) {
      console.error("AboutMe submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Studio Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-amber-500/10 to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full">
              Story & Narrative
            </span>
            <span className="text-xs text-slate-400">About Section Studio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            About Me & <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">Biography</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Fine-tune your personal biography headline, story narrative, and profile portrait.
          </p>
        </div>

        <button
          type="submit"
          form="about-settings-form"
          disabled={formLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 transition-all duration-200 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {formLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span>{formLoading ? "Saving..." : "Save About Settings"}</span>
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2">
          <FaCheckCircle className="shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {globalError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2">
          <FaExclamationTriangle className="shrink-0" />
          <span>{globalError}</span>
        </div>
      )}

      {/* Dedicated CV Management Navigation Notice */}
      <div className="p-4 rounded-2xl bg-slate-900/40 border border-cyan-500/20 backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-lg shrink-0">
            <FaFilePdf />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-white">Looking for CV & Resume Management?</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              CVs are organized and managed exclusively in their dedicated dashboard section.
            </p>
          </div>
        </div>
        <Link
          href="/admin/cvs"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold transition-all hover:translate-x-0.5 shrink-0"
        >
          <span>Manage CVs</span>
          <FaArrowRight className="text-[10px]" />
        </Link>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 gap-3 text-slate-400">
          <span className="w-6 h-6 rounded-full border-2 border-amber-400 border-t-transparent animate-spin"></span>
          <span className="text-sm">Loading biography details...</span>
        </div>
      ) : (
        <form id="about-settings-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Title & Detailed Story */}
            <div className="lg:col-span-2 space-y-6">
              {/* Narrative Story Card */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
                  <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    Headline & Detailed Narrative
                  </h3>
                </div>

                {/* Section Title */}
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                    About Section Headline <span className="text-amber-400">*</span>
                  </Label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => handleFieldChange("title", e.target.value, setTitle)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all font-medium"
                    placeholder="e.g. Turning Complex Challenges Into Seamless Architectures"
                  />
                  {errors.title && <p className="mt-1 text-xs text-rose-400">{errors.title[0]}</p>}
                </div>

                {/* Detailed Description */}
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                    Full Biography & Philosophy <span className="text-amber-400">*</span>
                  </Label>
                  <textarea
                    required
                    rows={12}
                    value={description}
                    onChange={(e) => handleFieldChange("description", e.target.value, setDescription)}
                    className="w-full px-4 py-3 text-sm rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/30 transition-all leading-relaxed custom-scrollbar"
                    placeholder="Describe your engineering path, problem-solving mindset, leadership experiences, and current technological pursuits..."
                  />
                  {errors.description && <p className="mt-1 text-xs text-rose-400">{errors.description[0]}</p>}
                </div>
              </div>
            </div>

            {/* Right Col: About Photo Visual */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
                  <div className="w-7 h-7 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center text-xs font-bold">
                    2
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    About Section Visual
                  </h3>
                </div>

                {/* Image Preview */}
                <div className="flex flex-col items-center justify-center py-2">
                  <div className="relative w-full h-56 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 shadow-xl group">
                    {imagePreviewUrl ? (
                      <Image
                        src={resolveImageUrl(imagePreviewUrl)}
                        alt="About Me Photo"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, 320px"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
                        <span className="text-3xl mb-1">🖼️</span>
                        <span>No Photo Uploaded</span>
                      </div>
                    )}

                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="absolute inset-0 bg-slate-950/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
                    >
                      <span className="text-xs font-semibold">Change Photo</span>
                    </div>
                  </div>

                  <input
                    type="file"
                    ref={imageInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />

                  <button
                    type="button"
                    onClick={() => imageInputRef.current?.click()}
                    className="mt-4 w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                  >
                    Select Photo File
                  </button>
                  {selectedImage && (
                    <span className="text-[11px] text-amber-400 mt-2 truncate max-w-[200px]">
                      Selected: {selectedImage.name}
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                  <p className="font-semibold text-slate-300">About Photo Tips:</p>
                  <p>• Clean portrait or developer workspace photo</p>
                  <p>• Displayed prominently alongside your biography</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
