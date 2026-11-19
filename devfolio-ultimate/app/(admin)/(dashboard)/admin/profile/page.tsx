"use client";

import React, { useEffect, useState, useRef } from "react";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import Image from "next/image";
import { resolveImageUrl, getApiBaseUrl } from "@/lib/utils";

export default function AdminProfilePage() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [profileId, setProfileId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [subTitle, setSubTitle] = useState("");
  const [skills, setSkills] = useState("");
  const [typewriterText, setTypewriterText] = useState("");
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

  const fetchProfileInfo = async () => {
    setIsLoading(true);
    setGlobalError("");
    try {
      const apiBase = getApiBaseUrl();
      const response = await fetch(`${apiBase}/profiles`, {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.status === 404) {
        setIsLoading(false);
        return;
      }

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const payload = await response.json();
      if (payload.success && payload.data) {
        setProfileId(payload.data.id || null);
        setName(payload.data.name || "");
        setDescription(payload.data.description || "");
        setSubTitle(payload.data.sub_title || "");
        setSkills(payload.data.skills || "");
        setTypewriterText(payload.data.typewriter_text || "");
        setImagePreviewUrl(payload.data.image_url || null);
      }
    } catch (err: any) {
      console.error("Fetch profile failed:", err);
      setGlobalError("Failed to load profile details. Ensure backend server is online.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileInfo();
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
      if (errors.image) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.image;
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
      formData.append("name", name);
      formData.append("description", description);
      formData.append("sub_title", subTitle || "");
      formData.append("skills", skills || "");
      formData.append("typewriter_text", typewriterText || "");

      if (selectedImage) {
        formData.append("image", selectedImage);
      }

      const response = await fetch(`${apiBase}/profiles`, {
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
          setGlobalError("Session expired (401). Please log in again.");
          return;
        }
        throw new Error(errData.message || `Server returned status ${response.status}`);
      }

      const payload = await response.json();
      if (payload.success) {
        setSuccessMessage("Hero profile preferences saved successfully!");
        if (payload.data && payload.data.image_url) {
          setImagePreviewUrl(payload.data.image_url);
        }
      }
    } catch (err: any) {
      console.error("Profile submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Studio Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 rounded-full">
              Hero & Landing Presence
            </span>
            <span className="text-xs text-slate-400">Identity Studio</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Hero Profile & <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">Terminal</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure your headline, animated typewriter roles, interactive terminal commands, and avatar.
          </p>
        </div>

        <button
          type="submit"
          form="hero-profile-form"
          disabled={formLoading}
          className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 transition-all duration-200 shadow-lg shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
        >
          {formLoading ? (
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          )}
          <span>{formLoading ? "Saving..." : "Save Hero Settings"}</span>
        </button>
      </div>

      {/* Alerts */}
      {successMessage && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/5">
          <span>✓</span>
          <span>{successMessage}</span>
        </div>
      )}

      {globalError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm flex items-center gap-2 shadow-lg shadow-rose-500/5">
          <span>⚠️</span>
          <span>{globalError}</span>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20 gap-3 text-slate-400">
          <span className="w-6 h-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></span>
          <span className="text-sm">Loading identity settings...</span>
        </div>
      ) : (
        <form id="hero-profile-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: Core Identity Inputs */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Details Card */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center text-xs font-bold">
                    1
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    Personal Headline & Tagline
                  </h3>
                </div>

                {/* Developer Name */}
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                    Developer Full Name <span className="text-cyan-400">*</span>
                  </Label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => handleFieldChange("name", e.target.value, setName)}
                    className="w-full h-11 px-4 text-sm rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all font-medium"
                    placeholder="e.g. Khaled Hesham"
                  />
                  {errors.name && <p className="mt-1 text-xs text-rose-400">{errors.name[0]}</p>}
                </div>

                {/* Tagline / Bio */}
                <div>
                  <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                    Short Bio / Landing Tagline <span className="text-cyan-400">*</span>
                  </Label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={(e) => handleFieldChange("description", e.target.value, setDescription)}
                    className="w-full px-4 py-3 text-sm rounded-xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all leading-relaxed"
                    placeholder="e.g. Passionate Fullstack Software Engineer dedicated to crafting scalable backend architectures and intuitive digital experiences..."
                  />
                  {errors.description && <p className="mt-1 text-xs text-rose-400">{errors.description[0]}</p>}
                </div>

                {/* Animated Typewriter */}
                <div>
                  <Label className="mb-1 text-xs font-semibold text-slate-300 block">
                    Animated Typewriter Roles <span className="text-slate-500">(1 per line or comma-separated)</span>
                  </Label>
                  <p className="text-[11px] text-slate-500 mb-2">
                    These rotating titles type out and delete smoothly on your hero landing header.
                  </p>
                  <textarea
                    rows={3}
                    value={typewriterText}
                    onChange={(e) => handleFieldChange("typewriter_text", e.target.value, setTypewriterText)}
                    className="w-full px-4 py-2.5 text-xs font-mono rounded-xl bg-slate-950/80 border border-slate-800 text-cyan-300 placeholder-slate-600 outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    placeholder="Full Stack Engineer&#10;Backend & Systems Architect&#10;Open Source Contributor"
                  />
                  {typewriterText && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {typewriterText
                        .split(/[\n,]+/)
                        .map((s) => s.trim())
                        .filter(Boolean)
                        .map((item, idx) => (
                          <span key={idx} className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {item}
                          </span>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Terminal Simulator Card */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold">
                      2
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                        Hero Terminal Mockup
                      </h3>
                      <p className="text-[11px] text-slate-500">
                        Interactive shell displayed in your portfolio hero section
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                    bash / zsh
                  </span>
                </div>

                <div className="p-3 bg-slate-950/60 border border-slate-800/60 rounded-xl text-[11px] text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">💡 Formatting Tip:</p>
                  <p>Lines starting with <code className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-cyan-300">~/</code> or <code className="px-1.5 py-0.5 rounded bg-slate-800 font-mono text-cyan-300">$</code> simulate typed terminal commands with cursor. Other lines print as standard terminal output.</p>
                </div>

                <textarea
                  rows={8}
                  value={skills}
                  onChange={(e) => handleFieldChange("skills", e.target.value, setSkills)}
                  className="w-full p-4 text-xs font-mono rounded-xl bg-slate-950 border border-slate-800 text-emerald-400 placeholder-slate-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30 transition-all custom-scrollbar leading-relaxed"
                  placeholder="~/developer-hub $ whoami&#10;> Khaled Hesham — Full Stack Engineer&#10;~/developer-hub $ cat stack.json&#10;{&#10;  &quot;core&quot;: [&quot;PHP 8.4&quot;, &quot;Laravel 12&quot;, &quot;Next.js 15&quot;, &quot;TypeScript&quot;]&#10;}"
                />
              </div>
            </div>

            {/* Right Col: Avatar & Visual Profile */}
            <div className="space-y-6">
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-xl shadow-xl space-y-5">
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-800/80">
                  <div className="w-7 h-7 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center text-xs font-bold">
                    3
                  </div>
                  <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                    Avatar & Visuals
                  </h3>
                </div>

                {/* Avatar Preview */}
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-cyan-500/30 bg-slate-950 shadow-2xl group">
                    {imagePreviewUrl ? (
                      <Image
                        src={resolveImageUrl(imagePreviewUrl)}
                        alt="Hero Avatar"
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="144px"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-xs font-mono">
                        <span className="text-3xl mb-1">👤</span>
                        <span>No Avatar</span>
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
                    className="mt-4 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                  >
                    Select Photo File
                  </button>
                  {selectedImage && (
                    <span className="text-[11px] text-cyan-400 mt-2 truncate max-w-[200px]">
                      Selected: {selectedImage.name}
                    </span>
                  )}
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800/80 text-xs text-slate-400 space-y-1.5">
                  <p className="font-semibold text-slate-300">Avatar Guidelines:</p>
                  <p>• High-resolution square format (1:1 ratio)</p>
                  <p>• Clean dark or transparent background looks best</p>
                  <p>• Supported: PNG, JPG, WEBP</p>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
