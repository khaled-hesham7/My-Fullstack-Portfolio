"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Modal } from "../../../components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import { getApiBaseUrl } from "@/lib/utils";

interface SocialLinkItem {
  id: number;
  platform: string;
  url: string;
  platform_name: string;
}

export default function AdminSocialLinksPage() {
  const [links, setLinks] = useState<SocialLinkItem[]>([]);
  const [platforms, setPlatforms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");

  // Modal & Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [platform, setPlatform] = useState("");
  const [url, setUrl] = useState("");

  // Errors state
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("admin_token");
      setToken(storedToken);
    }
  }, []);

  const fetchSocialLinksAndPlatforms = async () => {
    setIsLoading(true);
    setGlobalError("");
    try {
      const apiBase = getApiBaseUrl();

      const linksRes = await fetch(`${apiBase}/SocialLinkindex`, {
        headers: { Accept: "application/json" },
      });
      if (!linksRes.ok) throw new Error(`Links Error: ${linksRes.status}`);
      const linksPayload = await linksRes.json();
      if (linksPayload.success) {
        setLinks(linksPayload.data || []);
      }

      const platformRes = await fetch(`${apiBase}/SocialLink`, {
        headers: { Accept: "application/json" },
      });
      if (!platformRes.ok) throw new Error(`Platforms Error: ${platformRes.status}`);
      const platformPayload = await platformRes.json();
      if (platformPayload.success) {
        setPlatforms(platformPayload.data || []);
      }
    } catch (err: any) {
      console.error("Fetch social links/platforms failed:", err);
      setGlobalError("Failed to load social links configurations from backend.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSocialLinksAndPlatforms();
  }, []);

  // Filtered links
  const filteredLinks = useMemo(() => {
    if (!searchQuery) return links;
    return links.filter(
      (l) =>
        l.platform_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.url.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [links, searchQuery]);

  const openCreateModal = () => {
    setPlatform(platforms.length > 0 ? platforms[0] : "");
    setUrl("");
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
        platform: platform,
        url: url,
      };

      const response = await fetch(`${apiBase}/SocialLink`, {
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
        fetchSocialLinksAndPlatforms();
      }
    } catch (err: any) {
      console.error("Social link submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this social link?")) return;

    try {
      const apiBase = getApiBaseUrl();
      const activeToken = token || localStorage.getItem("admin_token");
      const response = await fetch(`${apiBase}/SocialLink/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete social link.");
      }

      const payload = await response.json();
      if (payload.success) {
        fetchSocialLinksAndPlatforms();
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "Could not delete social link.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Studio Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-full bg-gradient-to-l from-indigo-500/10 to-transparent pointer-events-none" />

        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 text-[11px] font-semibold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
              Presence & Channels
            </span>
            <span className="text-xs text-slate-400">Networking Manager</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Social <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Channels</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Connect your public profiles, GitHub, LinkedIn, Twitter/X, and freelance accounts.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-medium text-sm text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all duration-200 shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-[0.98]"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
          </svg>
          Add Social Link
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Connected Links</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-xs">
              🔗
            </div>
          </div>
          <p className="text-2xl font-bold text-white mt-2">{links.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Available Platforms</span>
            <div className="w-7 h-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 text-xs">
              🌐
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-400 mt-2">{platforms.length}</p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Public Status</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs">
              ✓
            </div>
          </div>
          <p className="text-2xl font-bold text-emerald-400 mt-2">Live</p>
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

      {/* Table Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-full divide-y divide-slate-800/60">
            <TableHeader className="bg-slate-950/60">
              <TableRow>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Platform
                </TableCell>
                <TableCell isHeader className="px-5 py-3.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Destination URL
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
                      <span className="w-5 h-5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin"></span>
                      <span className="text-sm">Loading social channels...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredLinks.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-12 text-center text-slate-400" colSpan={3}>
                    <div className="flex flex-col items-center justify-center gap-2">
                      <span className="text-3xl">🌐</span>
                      <p className="text-sm font-medium text-slate-300">No social links configured</p>
                      <p className="text-xs text-slate-500">Click &quot;Add Social Link&quot; to connect your portfolio.</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredLinks.map((link) => (
                  <TableRow key={link.id} className="hover:bg-slate-800/30 transition-colors">
                    {/* Platform Name */}
                    <TableCell className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold uppercase shrink-0">
                          {link.platform_name.slice(0, 2)}
                        </div>
                        <div>
                          <span className="font-semibold text-white text-sm block">
                            {link.platform_name}
                          </span>
                          <span className="text-[11px] text-slate-500 font-mono">
                            Key: {link.platform}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* URL */}
                    <TableCell className="px-5 py-3.5 max-w-[320px]">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-300 hover:text-indigo-200 hover:underline truncate block font-mono"
                        title={link.url}
                      >
                        {link.url}
                      </a>
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => handleDelete(link.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                        title="Delete Link"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
        className="max-w-md border border-slate-800 bg-slate-950/95 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden"
      >
        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 text-sm">
                🔗
              </div>
              <div>
                <h3 className="text-base font-bold text-white tracking-tight">
                  Add Social Profile
                </h3>
                <p className="text-xs text-slate-400">
                  Select platform and enter destination URL
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
                Social Platform <span className="text-indigo-400">*</span>
              </Label>
              <select
                required
                value={platform}
                onChange={(e) => handleFieldChange("platform", e.target.value, setPlatform)}
                className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900 border border-slate-800 text-white outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all capitalize"
              >
                <option value="" disabled className="bg-slate-900">
                  Choose a platform...
                </option>
                {platforms.map((p) => (
                  <option key={p} value={p} className="bg-slate-900">
                    {p}
                  </option>
                ))}
              </select>
              {errors.platform && <p className="mt-1 text-xs text-rose-400">{errors.platform[0]}</p>}
            </div>

            <div>
              <Label className="mb-1.5 text-xs font-semibold text-slate-300 block">
                Profile URL <span className="text-indigo-400">*</span>
              </Label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => handleFieldChange("url", e.target.value, setUrl)}
                className="w-full h-11 px-4 text-sm rounded-xl bg-slate-900/80 border border-slate-800 text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all font-mono"
                placeholder="https://..."
              />
              {errors.url && <p className="mt-1 text-xs text-rose-400">{errors.url[0]}</p>}
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
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50"
              >
                {formLoading && (
                  <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>Save Social Link</span>
              </button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
