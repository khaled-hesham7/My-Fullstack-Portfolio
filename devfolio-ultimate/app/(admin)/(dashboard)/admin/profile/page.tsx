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
        // No profile record created yet
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

      const formDataObj = new FormData();
      formDataObj.append("name", name);
      formDataObj.append("description", description);
      formDataObj.append("sub_title", subTitle);
      formDataObj.append("skills", skills);
      formDataObj.append("typewriter_text", typewriterText);

      if (selectedImage) {
        formDataObj.append("image", selectedImage);
      }

      // If we have profileId, do update (Route::post('/profiles/{id}')), else do store (Route::post('/profiles'))
      const url = profileId
        ? `${apiBase}/profiles/${profileId}`
        : `${apiBase}/profiles`;

      const response = await fetch(url, {
        method: "POST", // Laravel routing expects POST for updates with file uploads
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
        setSuccessMessage("Home Profile information saved successfully!");
        setSelectedImage(null);
        fetchProfileInfo();
      }
    } catch (err: any) {
      console.error("Profile submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-theme-xs max-w-3xl mx-auto">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
          Home Settings (Hero Profile)
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Update the profile details rendered on your landing page Hero and terminal mockup.
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12 gap-2 text-gray-500 dark:text-gray-400">
          <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
          <span>Loading profile details...</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {successMessage && (
            <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-sm dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900 font-semibold">
              {successMessage}
            </div>
          )}

          {globalError && (
            <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm dark:bg-red-950/30 dark:text-red-400 dark:border-red-900">
              {globalError}
            </div>
          )}

          {/* Developer Name */}
          <div>
            <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
              Developer Name <span className="text-red-500">*</span>
            </Label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => handleFieldChange("name", e.target.value, setName)}
              className={`w-full h-11 px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                errors.name
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
              }`}
              placeholder="E.g. Khaled Hesham"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name[0]}</p>
            )}
          </div>

          {/* Short Hero Description / Terminal bio */}
          <div>
            <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
              Short Bio / Tagline <span className="text-red-500">*</span>
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
              placeholder="E.g. crafting ideas into reality..."
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-500">{errors.description[0]}</p>
            )}
          </div>

          {/* Terminal Content */}
          <div>
            <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
              Terminal Screen Content
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Tip: Lines starting with <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">~/</code> or <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded">$</code> will simulate typed commands. Other lines print instantly as output.
            </p>
            <textarea
              rows={10}
              value={skills}
              onChange={(e) => handleFieldChange("skills", e.target.value, setSkills)}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm font-mono dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                errors.skills
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
              }`}
              placeholder="E.g.&#10;~/secure-route $ whoami&#10;> khaled hesham elsayed&#10;> Backend Developer & QA Engineer&#10;~/secure-route $ cat skills.json&#10;{&#10;  &quot;skills&quot;: [&quot;PHP&quot;, &quot;Laravel&quot;]&#10;}"
            />
            {errors.skills && (
              <p className="mt-1 text-xs text-red-500">{errors.skills[0]}</p>
            )}
          </div>

          {/* Typewriter Text */}
          <div>
            <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
              Animated Typewriter Text (Each phrase on a new line, or separated by comma or &amp;&amp;)
            </Label>
            <p className="text-xs text-gray-500 mb-2">
              Write the phrases you want to animate one after another (they will type out, erase, and switch to the next phrase).
            </p>
            <textarea
              rows={4}
              value={typewriterText}
              onChange={(e) => handleFieldChange("typewriter_text", e.target.value, setTypewriterText)}
              className={`w-full px-4 py-2.5 rounded-lg border text-sm dark:bg-gray-900 dark:text-white outline-none focus:ring-3 focus:ring-brand-500/10 ${
                errors.typewriter_text
                  ? "border-red-500 focus:border-red-500"
                  : "border-gray-300 dark:border-gray-700 focus:border-brand-500"
              }`}
              placeholder="E.g.&#10;Backend Developer&#10;QA Engineer&#10;Computer Science Student"
            />
            {errors.typewriter_text && (
              <p className="mt-1 text-xs text-red-500">{errors.typewriter_text[0]}</p>
            )}
          </div>

          {/* Profile Photo Avatar */}
          <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
            <Label className="mb-2 text-sm font-semibold block text-gray-700 dark:text-gray-300">
              Hero Avatar Image
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
                  Choose Avatar File
                </button>
                {selectedImage && (
                  <span className="text-xs text-gray-500 truncate max-w-[200px] self-center">
                    {selectedImage.name}
                  </span>
                )}
              </div>
              {errors.image && (
                <p className="mt-0.5 text-xs text-red-500">{errors.image[0]}</p>
              )}

              {/* Preview Image */}
              {imagePreviewUrl ? (
                <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-200 bg-gray-50 dark:border-gray-800 mt-1">
                  <Image
                    src={resolveImageUrl(imagePreviewUrl)}
                    alt="Hero Avatar Preview"
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs text-gray-400 border border-gray-200 dark:border-gray-800 mt-1">
                  No Avatar
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
            <Button type="submit" disabled={formLoading} className="w-full sm:w-auto">
              {formLoading ? "Saving Settings..." : "Save Home Settings"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
