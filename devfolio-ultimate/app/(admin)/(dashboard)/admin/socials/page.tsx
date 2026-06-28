"use client";

import React, { useEffect, useState } from "react";
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

      // 1. Fetch active social links from GET /api/SocialLinkindex
      const linksRes = await fetch(`${apiBase}/SocialLinkindex`, {
        headers: {
          Accept: "application/json",
        },
      });
      if (!linksRes.ok) throw new Error(`Links Error: ${linksRes.status}`);
      const linksPayload = await linksRes.json();
      if (linksPayload.success) {
        setLinks(linksPayload.data || []);
      }

      // 2. Fetch supported platform keys from GET /api/SocialLink
      const platformRes = await fetch(`${apiBase}/SocialLink`, {
        headers: {
          Accept: "application/json",
        },
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

  const openCreateModal = () => {
    setPlatform("");
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
        // Refresh links list
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
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-theme-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Social Links Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your social media channels, freelance profiles, and portfolio platforms.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="flex items-center gap-2">
          <span>Add Social Link</span>
        </Button>
      </div>

      {globalError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm dark:bg-red-950/30 dark:text-red-400 dark:border-red-900">
          {globalError}
        </div>
      )}

      {/* Social Links Table */}
      <div className="overflow-x-auto w-full">
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <TableHeader className="bg-gray-50 dark:bg-gray-800/40">
            <TableRow>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Platform Name
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Link URL
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Actions
              </TableCell>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-gray-100 dark:divide-gray-800 bg-transparent">
            {isLoading ? (
              <TableRow>
                <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={3}>
                  <div className="flex justify-center items-center gap-2">
                    <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
                    <span>Loading social links...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : links.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={3}>
                  No social links found. Click &quot;Add Social Link&quot; to add one.
                </TableCell>
              </TableRow>
            ) : (
              links.map((link) => (
                <TableRow key={link.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                  <TableCell className="px-4 py-3 text-sm font-semibold text-gray-800 dark:text-white/90">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-brand-500"></span>
                      <span>{link.platform_name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline hover:text-primary/80 break-all"
                    >
                      {link.url}
                    </a>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm font-medium">
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleDelete(link.id)}
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

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} className="max-w-md">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-800 dark:text-white/90 mb-4">
            Add New Social Link
          </h3>

          {globalError && (
            <div className="mb-4 p-2.5 bg-red-50 text-red-600 border border-red-200 rounded-lg text-xs dark:bg-red-950/30 dark:text-red-400 dark:border-red-900">
              {globalError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Platform Selection */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Platform <span className="text-red-500">*</span>
              </Label>
              <select
                required
                value={platform}
                onChange={(e) => handleFieldChange("platform", e.target.value, setPlatform)}
                className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                  errors.platform
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                }`}
              >
                <option value="">Select a platform</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0).toUpperCase() + p.slice(1)}
                  </option>
                ))}
              </select>
              {errors.platform && (
                <p className="mt-1 text-xs text-red-500">{errors.platform[0]}</p>
              )}
            </div>

            {/* URL Input */}
            <div>
              <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
                Profile URL <span className="text-red-500">*</span>
              </Label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => handleFieldChange("url", e.target.value, setUrl)}
                className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                  errors.url
                    ? "border-red-500 focus:border-red-500"
                    : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
                }`}
                placeholder="https://..."
              />
              {errors.url && (
                <p className="mt-1 text-xs text-red-500">{errors.url[0]}</p>
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
                {formLoading ? "Saving..." : "Save Link"}
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </div>
  );
}
