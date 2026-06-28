"use client";

import React, { useEffect, useState, useRef } from "react";
import { Modal } from "../../../components/ui/modal";
import { Table, TableHeader, TableBody, TableRow, TableCell } from "../../../components/ui/table";
import Button from "../../../components/ui/button/Button";
import Label from "../../../components/form/Label";
import Image from "next/image";
import { resolveImageUrl, getApiBaseUrl } from "@/lib/utils";

interface ContentBlock {
  title: string;
  text: string;
  code: string;
  images?: string[];
  videos?: string[];
  newImages?: File[];
  newVideos?: File[];
}

interface ArticleItem {
  id: number;
  title: string; // returns translated or title_en depending on lang, wait!
  // Let's check our resources: ArticleResource returns 'title' (which is title_en or title_ar based on headers).
  // But wait, in our admin panel, we can look up the original fields if we fetch the article or get it.
  // Wait, let's see how index returns it. In ArticleResource:
  // 'title' => $title, 'excerpt' => $excerpt, etc.
  // Wait! Does the index call return the raw 'title_en' or 'title_ar' in the response?
  // Let's check ArticleResource.php line 28-59 again:
  // It returns title, excerpt, feature_image, feature_video, tags, date, content.
  // But wait, in the update action, it validates:
  // 'title_en' => 'sometimes|required', 'title_ar' => 'sometimes|required'
  // How do we edit if index doesn't return title_en or title_ar raw?
  // Wait! In the index action (ArticleController.php line 134-159):
  // It returns ArticleResource::collection($articles).
  // If we fetch the single article via `GET /api/articles/{id}` in show:
  // It returns `new ArticleResource($article)`.
  // Wait! Does ArticleResource return title_en/title_ar or raw fields?
  // Let's check ArticleResource.php again. It does NOT return title_en/title_ar in the array returned.
  // Oh! It only returns the translated 'title' and 'excerpt' based on Accept-Language header.
  // Wait, but what if the admin needs to see the raw title_en and title_ar to edit them?
  // If the resource doesn't return title_en and title_ar, how can the admin edit them?
  // Wait, is it possible that the models database fields title_en and title_ar are accessible if we read the model directly?
  // Yes! If we call `GET /api/articles/{id}` directly, the backend returns the resource. But wait, since ArticleResource is used, it only returns the translated keys.
  // Wait! Let's check if the admin controller returns raw fields elsewhere, or if we can pass a header `Accept-Language: en` to get the English title, and `Accept-Language: ar` to get the Arabic title!
  // Yes! We can pass headers to retrieve the English or Arabic versions, OR we can generate a slug or check the response.
  // Let's see: if we fetch with `Accept-Language: en` header, the returned `title` will be `title_en`, and `excerpt` will be `excerpt_en`!
  // And if we fetch with `Accept-Language: ar` header, the returned `title` will be `title_ar`, and `excerpt` will be `excerpt_ar`!
  // That is a brilliant way to leverage the existing ArticleResource translations logic!
  // Wait, does the database table actually store `title_en` and `title_ar` as raw fields? Yes, we saw that in `Article.php` model.
  // What about `content_en` and `content_ar`? In ArticleResource.php, it returns `content` which maps the requested language content blocks.
  // So if we fetch the article detail via `GET /api/articles/{id}` with `Accept-Language: en`, we will get the English title, excerpt, and content blocks!
  // And if we fetch it with `Accept-Language: ar`, we will get the Arabic title, excerpt, and content blocks!
  // This is a highly intelligent insight! Let's implement a double-fetch or a show detail fetch when the user clicks "Edit" or "Translate" so we can pre-fill the form with exact languages cleanly.
  // Wait, let's verify if the show method takes headers. Yes, `$lang = $request->header('Accept-Language', 'en');` is evaluated in ArticleResource.php!
  // Let's write a robust fetcher for editing:
  // When editing, we can fetch the article twice (or check if it's already translated):
  // 1. Fetch with Accept-Language: en to get English fields (`title_en_val`, `excerpt_en_val`, `content_en_val`).
  // 2. Fetch with Accept-Language: ar to get Arabic fields (`title_ar_val`, `excerpt_ar_val`, `content_ar_val`).
  // This is simple, requires no modifications to the backend, and is extremely robust!
}

interface ArticleItem {
  id: number;
  title: string; // Mapped translated title
  excerpt: string; // Mapped translated excerpt
  feature_image: string | null;
  feature_video: string | null;
  tags: string[];
  is_featured: boolean;
  stats: {
    views: number;
    likes: number;
    liked: boolean;
  };
  date: {
    raw: string;
    diff: string | null;
  };
  content: Array<{
    id: number;
    title: string | null;
    text: string | null;
    code: string | null;
    images: string[];
    videos: string[];
  }>;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  per_page: number;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [meta, setMeta] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<'en' | 'ar'>('en');

  // English fields (stored in base article)
  const [titleEn, setTitleEn] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [tags, setTags] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [blocksEn, setBlocksEn] = useState<ContentBlock[]>([{ title: "", text: "", code: "" }]);

  // Arabic fields (translations)
  const [titleAr, setTitleAr] = useState("");
  const [excerptAr, setExcerptAr] = useState("");
  const [blocksAr, setBlocksAr] = useState<Array<{ title: string; text: string }>>([]);

  // Error and Loading states
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("admin_token");
      setToken(storedToken);
    }
  }, []);

  const fetchArticles = async (page: number) => {
    setIsLoading(true);
    setGlobalError("");
    try {
      const apiBase = getApiBaseUrl();
      // Fetch with English language header to display default lists in English
      const response = await fetch(`${apiBase}/articles?page=${page}`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const payload = await response.json();
      if (payload.success) {
        const paginatedData = payload.data;
        setArticles(paginatedData.data || []);
        setMeta({
          current_page: paginatedData.current_page,
          last_page: paginatedData.last_page,
          total: paginatedData.total,
          per_page: paginatedData.per_page,
        });
      }
    } catch (err: any) {
      console.error("Fetch articles failed:", err);
      setGlobalError("Failed to load articles. Ensure backend server is online.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(currentPage);
  }, [currentPage]);

  // Open creation modal
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitleEn("");
    setExcerptEn("");
    setTags("");
    setIsFeatured(false);
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setSelectedVideo(null);
    setVideoPreviewUrl(null);
    setBlocksEn([{ title: "", text: "", code: "", images: [], videos: [], newImages: [], newVideos: [] }]);
    setBlocksAr([{ title: "", text: "" }]);
    setTitleAr("");
    setExcerptAr("");
    setActiveFormTab("en");
    setErrors({});
    setGlobalError("");
    setIsFormModalOpen(true);
  };

  // Open Edit Modal - fetches English and Arabic representations recursively
  const openEditModal = async (articleId: number) => {
    setIsEditing(true);
    setEditingId(articleId);
    setErrors({});
    setGlobalError("");
    setIsFormModalOpen(true);
    setModalLoading(true);
    setActiveFormTab("en");

    try {
      const apiBase = getApiBaseUrl();
      
      // 1. Fetch English details
      const resEn = await fetch(`${apiBase}/articles/${articleId}`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      });
      if (!resEn.ok) throw new Error("Failed to load English details");
      const payloadEn = await resEn.json();
      const artEn = payloadEn.data;

      // 2. Fetch Arabic details
      const resAr = await fetch(`${apiBase}/articles/${articleId}`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "ar",
        },
      });
      if (!resAr.ok) throw new Error("Failed to load Arabic details");
      const payloadAr = await resAr.json();
      const artAr = payloadAr.data;

      // Prefill English
      setTitleEn(artEn.title || "");
      setExcerptEn(artEn.excerpt || "");
      setTags(artEn.tags ? artEn.tags.join(", ") : "");
      setImagePreviewUrl(artEn.feature_image);
      setVideoPreviewUrl(artEn.feature_video);
      setIsFeatured(artEn.is_featured || false);
      setSelectedImage(null);
      setSelectedVideo(null);

      const mappedBlocksEn = artEn.content
        ? artEn.content.map((b: any) => ({
            title: b.title || "",
            text: b.text || "",
            code: b.code || "",
            images: b.images || [],
            videos: b.videos || [],
            newImages: [],
            newVideos: [],
          }))
        : [{ title: "", text: "", code: "", images: [], videos: [], newImages: [], newVideos: [] }];
      setBlocksEn(mappedBlocksEn);

      // Prefill Arabic
      setTitleAr(artAr.title || "");
      setExcerptAr(artAr.excerpt || "");
      const mappedBlocksAr = artAr.content
        ? artAr.content.map((b: any) => ({
            title: b.title || "",
            text: b.text || "",
          }))
        : [];
      setBlocksAr(mappedBlocksAr);

    } catch (err: any) {
      console.error("Failed to load edit states:", err);
      setGlobalError("Failed to fetch article details from backend.");
    } finally {
      setModalLoading(false);
    }
  };

  // Open Translation Modal
  const openTranslateModal = async (articleId: number) => {
    setEditingId(articleId);
    setErrors({});
    setGlobalError("");
    setIsTranslateModalOpen(true);
    setModalLoading(true);
    setActiveFormTab("en");

    try {
      const apiBase = getApiBaseUrl();
      
      // Fetch English blocks to map indexes
      const resEn = await fetch(`${apiBase}/articles/${articleId}`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      });
      if (!resEn.ok) throw new Error("Failed to load English details");
      const payloadEn = await resEn.json();
      const artEn = payloadEn.data;

      // Fetch existing Arabic details if any
      const resAr = await fetch(`${apiBase}/articles/${articleId}`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "ar",
        },
      });
      const payloadAr = resAr.ok ? await resAr.json() : null;
      const artAr = payloadAr?.data;

      setTitleAr(artAr?.title || "");
      setExcerptAr(artAr?.excerpt || "");

      // Loop English blocks to form structure
      const mappedBlocksEn = artEn.content || [];
      const initializedBlocksAr = mappedBlocksEn.map((b: any, idx: number) => {
        // If there's already an Arabic translation for this block index, prefill it
        const existingAr = artAr?.content?.[idx];
        return {
          title: existingAr?.title || "",
          text: existingAr?.text || "",
        };
      });

      setBlocksEn(mappedBlocksEn.map((b: any) => ({
        title: b.title || "",
        text: b.text || "",
        code: b.code || "",
      })));
      setBlocksAr(initializedBlocksAr);

    } catch (err: any) {
      console.error("Failed to initialize translation:", err);
      setGlobalError("Could not retrieve base article content.");
    } finally {
      setModalLoading(false);
    }
  };

  // Content Blocks management
  const addBlock = () => {
    setBlocksEn([...blocksEn, { title: "", text: "", code: "", images: [], videos: [], newImages: [], newVideos: [] }]);
    setBlocksAr([...blocksAr, { title: "", text: "" }]);
  };

  const removeBlock = (index: number) => {
    if (blocksEn.length === 1) return;
    setBlocksEn(blocksEn.filter((_, idx) => idx !== index));
    setBlocksAr(blocksAr.filter((_, idx) => idx !== index));
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === blocksEn.length - 1) return;

    const targetIndex = direction === "up" ? index - 1 : index + 1;

    const newBlocksEn = [...blocksEn];
    const tempEn = newBlocksEn[index];
    newBlocksEn[index] = newBlocksEn[targetIndex];
    newBlocksEn[targetIndex] = tempEn;
    setBlocksEn(newBlocksEn);

    const newBlocksAr = [...blocksAr];
    const tempAr = newBlocksAr[index];
    newBlocksAr[index] = newBlocksAr[targetIndex];
    newBlocksAr[targetIndex] = tempAr;
    setBlocksAr(newBlocksAr);
  };

  const duplicateBlock = (index: number) => {
    const blockToDuplicate = blocksEn[index];
    const newBlockEn: ContentBlock = {
      title: blockToDuplicate.title,
      text: blockToDuplicate.text,
      code: blockToDuplicate.code,
      images: blockToDuplicate.images || [],
      videos: blockToDuplicate.videos || [],
      newImages: [],
      newVideos: [],
    };

    const blockArToDuplicate = blocksAr[index];
    const newBlockAr = {
      title: blockArToDuplicate?.title || "",
      text: blockArToDuplicate?.text || "",
    };

    const newBlocksEn = [...blocksEn];
    newBlocksEn.splice(index + 1, 0, newBlockEn);
    setBlocksEn(newBlocksEn);

    const newBlocksAr = [...blocksAr];
    newBlocksAr.splice(index + 1, 0, newBlockAr);
    setBlocksAr(newBlocksAr);
  };

  const handleBlockChange = (index: number, field: keyof ContentBlock, value: string) => {
    setBlocksEn((prev) =>
      prev.map((b, idx) => (idx === index ? { ...b, [field]: value } : b))
    );
  };

  const handleArabicBlockChange = (index: number, field: "title" | "text", value: string) => {
    setBlocksAr((prev) =>
      prev.map((b, idx) => (idx === index ? { ...b, [field]: value } : b))
    );
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

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    setter: React.Dispatch<React.SetStateAction<File | null>>,
    previewSetter: React.Dispatch<React.SetStateAction<string | null>>,
    errKey: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setter(file);
      previewSetter(URL.createObjectURL(file));
      if (errors[errKey]) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next[errKey];
          return next;
        });
      }
    }
  };

  const handleBlockFilesChange = (
    index: number,
    type: "images" | "videos",
    fileList: FileList | null
  ) => {
    if (!fileList) return;
    const files = Array.from(fileList);
    setBlocksEn((prev) =>
      prev.map((b, idx) => {
        if (idx === index) {
          if (type === "images") {
            return {
              ...b,
              newImages: [...(b.newImages || []), ...files],
            };
          } else {
            return {
              ...b,
              newVideos: [...(b.newVideos || []), ...files],
            };
          }
        }
        return b;
      })
    );
  };

  const getMediaIdentifier = (url: string) => {
    const match = url.match(/\/storage\/(\d+)\//);
    if (match && match[1]) {
      return match[1];
    }
    return url;
  };

  const handleRemoveServerFile = async (
    blockIndex: number,
    type: "images" | "videos",
    url: string
  ) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${
          type === "images" ? "image" : "video"
        } from the server?`
      )
    ) {
      return;
    }

    try {
      const identifier = getMediaIdentifier(url);
      const activeToken = token || localStorage.getItem("admin_token");
      const apiBase = getApiBaseUrl();

      const response = await fetch(`${apiBase}/media/${encodeURIComponent(identifier)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete file from server");
      }

      const payload = await response.json();
      if (payload.success) {
        setBlocksEn((prev) =>
          prev.map((b, bIdx) => {
            if (bIdx === blockIndex) {
              if (type === "images") {
                return {
                  ...b,
                  images: (b.images || []).filter((itemUrl) => itemUrl !== url),
                };
              } else {
                return {
                  ...b,
                  videos: (b.videos || []).filter((itemUrl) => itemUrl !== url),
                };
              }
            }
            return b;
          })
        );
      }
    } catch (err: any) {
      console.error("Delete server file failed:", err);
      alert(err.message || "Failed to delete file.");
    }
  };

  // Submit English/Base edit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    setFormLoading(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append("title_en", titleEn);
      formDataObj.append("excerpt_en", excerptEn);
      formDataObj.append("is_featured", isFeatured ? "1" : "0");

      // Parse tags
      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);
      tagsArray.forEach((tag) => {
        formDataObj.append("tags[]", tag);
      });

      // Append content blocks
      blocksEn.forEach((block, idx) => {
        formDataObj.append(`blocks[${idx}][subheading]`, block.title);
        formDataObj.append(`blocks[${idx}][text]`, block.text);
        formDataObj.append(`blocks[${idx}][code]`, block.code);

        // Send existing image URLs to retain them
        if (block.images && block.images.length > 0) {
          block.images.forEach((imgUrl) => {
            formDataObj.append(`blocks[${idx}][images][]`, imgUrl);
          });
        }
        // Send new raw images files for upload
        if (block.newImages && block.newImages.length > 0) {
          block.newImages.forEach((file) => {
            formDataObj.append(`blocks[${idx}][images][]`, file);
          });
        }

        // Send existing video URLs to retain them
        if (block.videos && block.videos.length > 0) {
          block.videos.forEach((vidUrl) => {
            formDataObj.append(`blocks[${idx}][videos][]`, vidUrl);
          });
        }
        // Send new raw videos files for upload
        if (block.newVideos && block.newVideos.length > 0) {
          block.newVideos.forEach((file) => {
            formDataObj.append(`blocks[${idx}][videos][]`, file);
          });
        }
      });

      if (selectedImage) {
        formDataObj.append("feature_image", selectedImage);
      }
      if (selectedVideo) {
        formDataObj.append("feature_video", selectedVideo);
      }

      const activeToken = token || localStorage.getItem("admin_token");
      const apiBase = getApiBaseUrl();

      formDataObj.append("title_ar", titleAr || "");
      formDataObj.append("excerpt_ar", excerptAr || "");
      blocksAr.forEach((block, idx) => {
        formDataObj.append(`content_ar[${idx}][title]`, block.title || "");
        formDataObj.append(`content_ar[${idx}][text]`, block.text || "");
      });

      const url = isEditing
        ? `${apiBase}/articles/${editingId}`
        : `${apiBase}/articles`;

      const response = await fetch(url, {
        method: "POST", // POST is used for both Store and Update due to multipart image limitations in PUT
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

      setIsFormModalOpen(false);
      fetchArticles(currentPage);
    } catch (err: any) {
      console.error("Form submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Translation
  const handleTranslateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    setFormLoading(true);

    try {
      const activeToken = token || localStorage.getItem("admin_token");
      const apiBase = getApiBaseUrl();

      const response = await fetch(`${apiBase}/articles/${editingId}/translate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title_ar: titleAr,
          excerpt_ar: excerptAr,
          content_ar: blocksAr,
        }),
      });

      if (!response.ok) {
        if (response.status === 422) {
          const errData = await response.json();
          setErrors(errData.errors || {});
          setGlobalError(errData.message || "Please check validation errors.");
          return;
        }
        throw new Error("Failed to submit translation.");
      }

      setIsTranslateModalOpen(false);
      fetchArticles(currentPage);
    } catch (err: any) {
      console.error("Translation submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Action
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this article?")) return;

    try {
      const apiBase = getApiBaseUrl();
      const activeToken = token || localStorage.getItem("admin_token");
      const response = await fetch(`${apiBase}/articles/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete article.");
      }

      const payload = await response.json();
      if (payload.success) {
        if (articles.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        } else {
          fetchArticles(currentPage);
        }
      }
    } catch (err: any) {
      console.error("Delete error:", err);
      alert(err.message || "Could not delete article.");
    }
  };

  const [formLoading, setFormLoading] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900 p-6 shadow-theme-xs">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-white/90">
            Blogs & Articles Management
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Create dynamic English posts, add Arabic translations, and manage blog items.
          </p>
        </div>
        <Button size="sm" onClick={openCreateModal} className="flex items-center gap-2">
          <span>Add Article</span>
        </Button>
      </div>

      {globalError && (
        <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm">
          {globalError}
        </div>
      )}

      {/* Articles Table */}
      <div className="overflow-x-auto w-full">
        <Table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
          <TableHeader className="bg-gray-50 dark:bg-gray-800/40">
            <TableRow>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Preview
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Title (EN)
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Excerpt
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Stats
              </TableCell>
              <TableCell isHeader className="px-4 py-3.5 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Tags
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
                    <span>Loading articles...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : articles.length === 0 ? (
              <TableRow>
                <TableCell className="px-4 py-8 text-center text-gray-500 dark:text-gray-400" colSpan={6}>
                  No articles found. Click &quot;Add Article&quot; to publish one.
                </TableCell>
              </TableRow>
            ) : (
              articles.map((art) => (
                <TableRow key={art.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/10">
                  <TableCell className="px-4 py-3">
                    <div className="relative w-16 h-10 rounded-md overflow-hidden bg-gray-100 dark:bg-gray-800">
                      {art.feature_image ? (
                        <Image
                          src={resolveImageUrl(art.feature_image, "")}
                          alt={art.title}
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
                    {art.title}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                    {art.excerpt}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col gap-0.5 text-xs">
                      <span>👁️ {art.stats?.views || 0} views</span>
                      <span>❤️ {art.stats?.likes || 0} likes</span>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-sm">
                    <div className="flex flex-wrap gap-1">
                      {art.tags &&
                        art.tags.map((tag, idx) => (
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
                    <span
                      className={`inline-block px-2.5 py-1 text-xs font-medium rounded-full ${
                        art.is_featured
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                          : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400"
                      }`}
                    >
                      {art.is_featured ? "Featured" : "Regular"}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-right text-sm font-medium">
                    <div className="flex justify-end gap-3">
                      <button
                        onClick={() => window.open(`/blog/${art.id}`, "_blank")}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors cursor-pointer"
                      >
                        View
                      </button>
                      <button
                        onClick={() => openTranslateModal(art.id)}
                        className="text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                      >
                        Translate
                      </button>
                      <button
                        onClick={() => openEditModal(art.id)}
                        className="text-primary hover:text-primary/80 transition-colors cursor-pointer"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(art.id)}
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
            Showing Page {meta.current_page} of {meta.last_page} ({meta.total} Articles total)
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

      {/* Create/Edit English Article Modal */}
      <Modal isOpen={isFormModalOpen} onClose={() => setIsFormModalOpen(false)} className="w-full max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl flex flex-col max-h-[85vh] overflow-hidden shadow-2xl">
        {modalLoading ? (
          <div className="py-12 text-center text-gray-500">
            <span className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block mr-2"></span>
            Loading article data...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* FIXED HEADER WITH THE CORRECT BLUE TABS */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-6">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white/90">
                {isEditing ? "Edit Article" : "Write New Article"}
              </h3>
              <div className="flex gap-4">
                <button 
                  type="button"
                  onClick={() => setActiveFormTab('en')}
                  className={`pb-2 px-4 font-semibold transition-all ${activeFormTab === 'en' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-slate-400'}`}
                >
                  English Content
                </button>
                <button 
                  type="button"
                  onClick={() => setActiveFormTab('ar')}
                  className={`pb-2 px-4 font-semibold transition-all ${activeFormTab === 'ar' ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-slate-400'}`}
                >
                  المحتوى العربي
                </button>
              </div>
            </div>

            {/* SCROLLABLE INNER BODY FOR INPUT FIELDS ONLY */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/50">
              {activeFormTab === 'en' ? (
                <>
                  {/* Title */}
                  <div>
                    <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      English Title <span className="text-cyan-500">*</span>
                    </Label>
                    <input
                      type="text"
                      required
                      value={titleEn}
                      onChange={(e) => handleFieldChange("title_en", e.target.value, setTitleEn)}
                      className={`w-full h-11 px-4 py-2.5 rounded-xl border text-sm bg-slate-950/80 text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all ${
                        errors.title_en
                          ? "border-red-500"
                          : "border-slate-800"
                      }`}
                      placeholder="E.g. JavaScript Closures Demystified"
                    />
                    {errors.title_en && (
                      <p className="mt-1 text-xs text-red-500">{errors.title_en[0]}</p>
                    )}
                  </div>

                  {/* Excerpt */}
                  <div>
                    <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Excerpt / Brief Description <span className="text-cyan-500">*</span>
                    </Label>
                    <textarea
                      required
                      rows={3}
                      value={excerptEn}
                      onChange={(e) => handleFieldChange("excerpt_en", e.target.value, setExcerptEn)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm bg-slate-950/80 text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all ${
                        errors.excerpt_en
                          ? "border-red-500"
                          : "border-slate-800"
                      }`}
                      placeholder="Provide a brief summary of the article..."
                    />
                    {errors.excerpt_en && (
                      <p className="mt-1 text-xs text-red-500">{errors.excerpt_en[0]}</p>
                    )}
                  </div>

                  {/* Dynamic Content Blocks Section */}
                  <div className="pt-4 border-t border-slate-800">
                    <div className="flex justify-between items-center mb-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Article Sections & Blocks (EN)
                      </h4>
                      <button
                        type="button"
                        onClick={addBlock}
                        className="text-xs px-3 py-1.5 rounded-lg border border-cyan-500/30 text-cyan-400 hover:text-white hover:bg-cyan-600 hover:border-cyan-600 transition-all font-semibold cursor-pointer"
                      >
                        + Add Section Block
                      </button>
                    </div>

                    <div className="space-y-6">
                      {blocksEn.map((block, idx) => (
                        <div
                          key={idx}
                          className="p-5 bg-slate-950/40 rounded-2xl border border-slate-800 relative space-y-4 hover:border-slate-700/80 transition-all"
                        >
                          {/* Block Controls */}
                          <div className="absolute top-4 right-4 flex items-center gap-3">
                            {idx > 0 && (
                              <button
                                type="button"
                                onClick={() => moveBlock(idx, "up")}
                                className="text-slate-450 hover:text-cyan-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Move Block Up"
                              >
                                ▲ Up
                              </button>
                            )}
                            {idx < blocksEn.length - 1 && (
                              <button
                                type="button"
                                onClick={() => moveBlock(idx, "down")}
                                className="text-slate-450 hover:text-cyan-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Move Block Down"
                              >
                                ▼ Down
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => duplicateBlock(idx)}
                              className="text-slate-450 hover:text-cyan-400 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Duplicate Block"
                            >
                              ⎘ Duplicate
                            </button>
                            {blocksEn.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeBlock(idx)}
                                className="text-rose-500 hover:text-rose-400 text-xs font-semibold transition-colors cursor-pointer"
                                title="Remove Block"
                              >
                                Remove
                              </button>
                            )}
                          </div>

                          <span className="inline-block text-[10px] font-bold tracking-wider bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded-full mb-1">
                            Block #{idx + 1}
                          </span>

                          {/* Block Title */}
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-400">
                              Block Subheading
                            </label>
                            <input
                              type="text"
                              value={block.title}
                              onChange={(e) => handleBlockChange(idx, "title", e.target.value)}
                              className="w-full h-9 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                              placeholder="e.g. 1. Introduction"
                            />
                          </div>

                          {/* Block Text */}
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-400">
                              Block Paragraph Text
                            </label>
                            <textarea
                              rows={4}
                              value={block.text}
                              onChange={(e) => handleBlockChange(idx, "text", e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-xs text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                              placeholder="Write paragraph content here..."
                            />
                          </div>

                          {/* Block Code */}
                          <div>
                            <label className="block text-xs font-semibold mb-1 text-slate-400">
                              Code Snippet (Optional)
                            </label>
                            <textarea
                              rows={3}
                              value={block.code}
                              onChange={(e) => handleBlockChange(idx, "code", e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-slate-800 bg-slate-950 font-mono text-xs text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                              placeholder="const add = (a, b) => a + b;"
                            />
                          </div>

                          {/* Block Media Gallery Uploads */}
                          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Images Multiple Uploader */}
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-400">
                                Block Images
                              </label>
                              <label className="border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 hover:border-cyan-500/50 rounded-xl p-3 transition-all cursor-pointer text-center group flex flex-col items-center justify-center min-h-[90px] w-full">
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  onChange={(e) => handleBlockFilesChange(idx, "images", e.target.files)}
                                  className="hidden"
                                />
                                <svg className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 mb-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-[11px] text-slate-455 group-hover:text-slate-300 font-medium">Add Images</span>
                              </label>
                            </div>

                            {/* Videos Multiple Uploader */}
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-400">
                                Block Videos
                              </label>
                              <label className="border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 hover:border-cyan-500/50 rounded-xl p-3 transition-all cursor-pointer text-center group flex flex-col items-center justify-center min-h-[90px] w-full">
                                <input
                                  type="file"
                                  multiple
                                  accept="video/*"
                                  onChange={(e) => handleBlockFilesChange(idx, "videos", e.target.files)}
                                  className="hidden"
                                />
                                <svg className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 mb-1 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
                                </svg>
                                <span className="text-[11px] text-slate-455 group-hover:text-slate-300 font-medium">Add Videos</span>
                              </label>
                            </div>
                          </div>

                          {/* Server Uploaded Images Gallery Grid */}
                          {block.images && block.images.length > 0 && (
                            <div className="mt-3">
                              <label className="block text-[11px] font-semibold mb-1.5 text-gray-600 dark:text-gray-400">
                                Uploaded Block Images
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {block.images.map((imgUrl, imgIdx) => (
                                  <div key={imgIdx} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 aspect-video bg-gray-100 dark:bg-gray-850">
                                    <Image
                                      src={resolveImageUrl(imgUrl, "")}
                                      alt="Block Uploaded Image"
                                      fill
                                      className="object-cover"
                                      sizes="120px"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveServerFile(idx, "images", imgUrl)}
                                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 cursor-pointer"
                                      title="Delete Image from Server"
                                    >
                                      <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Server Uploaded Videos Gallery Grid */}
                          {block.videos && block.videos.length > 0 && (
                            <div className="mt-3">
                              <label className="block text-[11px] font-semibold mb-1.5 text-gray-600 dark:text-gray-400">
                                Uploaded Block Videos
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {block.videos.map((vidUrl, vidIdx) => (
                                  <div key={vidIdx} className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-800 aspect-video bg-gray-100 dark:bg-gray-850 flex items-center justify-center">
                                    <video
                                      src={resolveImageUrl(vidUrl, "")}
                                      className="w-full h-full object-cover"
                                      controls
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveServerFile(idx, "videos", vidUrl)}
                                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 cursor-pointer z-10"
                                      title="Delete Video from Server"
                                    >
                                      <TrashIcon className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* New Selected Images Local Preview Grid */}
                          {block.newImages && block.newImages.length > 0 && (
                            <div className="mt-3">
                              <label className="block text-[11px] font-semibold mb-1.5 text-green-650 dark:text-green-400">
                                New Images (Pending Upload)
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {block.newImages.map((file, fileIdx) => {
                                  const localPreviewUrl = URL.createObjectURL(file);
                                  return (
                                    <div key={fileIdx} className="relative group rounded-lg overflow-hidden border border-green-200 dark:border-green-800/80 aspect-video bg-gray-100 dark:bg-gray-850">
                                      <Image
                                        src={localPreviewUrl}
                                        alt="New Local Image"
                                        fill
                                        className="object-cover"
                                        sizes="120px"
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setBlocksEn((prev) =>
                                            prev.map((b, bIdx) => {
                                              if (bIdx === idx) {
                                                return {
                                                  ...b,
                                                  newImages: (b.newImages || []).filter((_, fIdx) => fIdx !== fileIdx),
                                                };
                                              }
                                              return b;
                                            })
                                          );
                                        }}
                                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700 cursor-pointer"
                                        title="Cancel Selection"
                                      >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* New Selected Videos Local Preview Grid */}
                          {block.newVideos && block.newVideos.length > 0 && (
                            <div className="mt-3">
                              <label className="block text-[11px] font-semibold mb-1.5 text-green-655 dark:text-green-400">
                                New Videos (Pending Upload)
                              </label>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {block.newVideos.map((file, fileIdx) => {
                                  const localPreviewUrl = URL.createObjectURL(file);
                                  return (
                                    <div key={fileIdx} className="relative group rounded-lg overflow-hidden border border-green-200 dark:border-green-800/80 aspect-video bg-gray-100 dark:bg-gray-850 flex items-center justify-center">
                                      <video
                                        src={localPreviewUrl}
                                        className="w-full h-full object-cover"
                                        controls
                                      />
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setBlocksEn((prev) =>
                                            prev.map((b, bIdx) => {
                                              if (bIdx === idx) {
                                                return {
                                                  ...b,
                                                  newVideos: (b.newVideos || []).filter((_, fIdx) => fIdx !== fileIdx),
                                                };
                                              }
                                              return b;
                                            })
                                          );
                                        }}
                                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-750 cursor-pointer z-10"
                                        title="Cancel Selection"
                                      >
                                        <TrashIcon className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Arabic Title */}
                  <div>
                    <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Arabic Title <span className="text-cyan-500">*</span>
                    </Label>
                    <input
                      type="text"
                      required
                      dir="rtl"
                      value={titleAr}
                      onChange={(e) => handleFieldChange("title_ar", e.target.value, setTitleAr)}
                      className={`w-full h-11 px-4 py-2.5 rounded-xl border text-sm text-right font-sans-arabic bg-slate-950/80 text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all ${
                        errors.title_ar
                          ? "border-red-500"
                          : "border-slate-800"
                      }`}
                      placeholder="العنوان باللغة العربية"
                    />
                    {errors.title_ar && (
                      <p className="mt-1 text-xs text-red-500">{errors.title_ar[0]}</p>
                    )}
                  </div>

                  {/* Arabic Excerpt */}
                  <div>
                    <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Arabic Excerpt / Brief Description <span className="text-cyan-500">*</span>
                    </Label>
                    <textarea
                      required
                      rows={3}
                      dir="rtl"
                      value={excerptAr}
                      onChange={(e) => handleFieldChange("excerpt_ar", e.target.value, setExcerptAr)}
                      className={`w-full px-4 py-2.5 rounded-xl border text-sm text-right font-sans-arabic bg-slate-950/80 text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all ${
                        errors.excerpt_ar
                          ? "border-red-500"
                          : "border-slate-800"
                      }`}
                      placeholder="الوصف المختصر للمقال بالعربية..."
                    />
                    {errors.excerpt_ar && (
                      <p className="mt-1 text-xs text-red-500">{errors.excerpt_ar[0]}</p>
                    )}
                  </div>

                  {/* Block Mappings */}
                  <div className="pt-4 border-t border-slate-800">
                    <div className="mb-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Translate Section Blocks (Arabic)
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Add or remove section blocks in the English tab. The changes will sync here dynamically.
                      </p>
                    </div>

                    <div className="space-y-6">
                      {blocksAr.map((block, idx) => {
                        const refBlock = blocksEn[idx];
                        return (
                          <div
                            key={idx}
                            className="p-5 bg-slate-950/40 rounded-2xl border border-slate-800 relative hover:border-slate-700/80 transition-all"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <span className="inline-block text-[10px] font-bold tracking-wider bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded-full">
                                Block #{idx + 1}
                              </span>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                              {/* Left Side: English Reference */}
                              <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 text-xs text-slate-400 space-y-2 flex flex-col justify-start">
                                <p className="font-bold text-slate-300 border-b border-slate-900 pb-1.5">English Reference:</p>
                                {refBlock?.title ? (
                                  <p><strong>Subheading:</strong> {refBlock.title}</p>
                                ) : (
                                  <p className="italic text-slate-655">No Subheading</p>
                                )}
                                {refBlock?.text ? (
                                  <p className="leading-relaxed whitespace-pre-line"><strong>Text:</strong> {refBlock.text}</p>
                                ) : (
                                  <p className="italic text-slate-655">No Paragraph Text</p>
                                )}
                                {refBlock?.code && (
                                  <div className="mt-1.5">
                                    <strong>Code:</strong>
                                    <pre className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg font-mono text-[10px] overflow-x-auto text-slate-300 mt-1">{refBlock.code}</pre>
                                  </div>
                                )}
                              </div>

                              {/* Right Side: Arabic Translation */}
                              <div className="space-y-4" dir="rtl">
                                <div>
                                  <label className="block text-xs font-semibold mb-1 text-slate-400 text-right">
                                    العنوان الفرعي بالعربية (Subheading)
                                  </label>
                                  <input
                                    type="text"
                                    dir="rtl"
                                    value={block.title || ""}
                                    onChange={(e) => handleArabicBlockChange(idx, "title", e.target.value)}
                                    className="w-full h-10 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs text-right font-sans-arabic text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                                    placeholder="اكتب العنوان الفرعي بالعربية هنا..."
                                  />
                                </div>

                                <div>
                                  <label className="block text-xs font-semibold mb-1 text-slate-400 text-right">
                                    النص بالعربية (Paragraph Text)
                                  </label>
                                  <textarea
                                    rows={5}
                                    dir="rtl"
                                    value={block.text || ""}
                                    onChange={(e) => handleArabicBlockChange(idx, "text", e.target.value)}
                                    className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-xs text-right font-sans-arabic text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all resize-y"
                                    placeholder="اكتب محتوى الفقرة بالعربية هنا..."
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}

              {/* Global Fields: Tags and Cover Media (Rendered at the bottom of the scrollable container) */}
              <div className="pt-6 border-t border-slate-800 space-y-6">
                {/* Tags */}
                <div>
                  <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    Tags
                  </Label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => handleFieldChange("tags", e.target.value, setTags)}
                    className="w-full h-11 px-4 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-sm text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                    placeholder="e.g. JavaScript, ES6, Advanced"
                  />
                </div>

                {/* Cover Media Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Feature Image */}
                  <div>
                    <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Feature Cover Image
                    </Label>
                    <div
                      onClick={() => imageInputRef.current?.click()}
                      className="border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 hover:border-cyan-500/50 rounded-xl p-5 transition-all cursor-pointer text-center group flex flex-col items-center justify-center min-h-[120px]"
                    >
                      <input
                        type="file"
                        ref={imageInputRef}
                        onChange={(e) => handleFileChange(e, setSelectedImage, setImagePreviewUrl, "feature_image")}
                        accept="image/*"
                        className="hidden"
                      />
                      <svg className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-slate-405 group-hover:text-slate-300 font-medium">
                        {selectedImage ? selectedImage.name : "Click to select Cover Image"}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">
                        Supports JPG, PNG, WEBP (Max 2MB)
                      </span>
                    </div>
                    {imagePreviewUrl && (
                      <div className="relative w-28 h-16 rounded overflow-hidden border border-slate-800 mt-2">
                        <Image src={imagePreviewUrl} alt="Cover Preview" fill className="object-cover" />
                      </div>
                    )}
                  </div>

                  {/* Feature Video */}
                  <div>
                    <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                      Feature Video (Optional)
                    </Label>
                    <div
                      onClick={() => videoInputRef.current?.click()}
                      className="border border-dashed border-slate-800 bg-slate-950/40 hover:bg-slate-950/80 hover:border-cyan-500/50 rounded-xl p-5 transition-all cursor-pointer text-center group flex flex-col items-center justify-center min-h-[120px]"
                    >
                      <input
                        type="file"
                        ref={videoInputRef}
                        onChange={(e) => handleFileChange(e, setSelectedVideo, setVideoPreviewUrl, "feature_video")}
                        accept="video/*"
                        className="hidden"
                      />
                      <svg className="w-8 h-8 text-slate-500 group-hover:text-cyan-400 mb-2 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span className="text-xs text-slate-405 group-hover:text-slate-300 font-medium">
                        {selectedVideo ? selectedVideo.name : "Click to select Cover Video"}
                      </span>
                      <span className="text-[10px] text-slate-500 mt-1">
                        Supports MP4, MOV (Max 20MB)
                      </span>
                    </div>
                    {videoPreviewUrl && (
                      <span className="text-[10px] text-green-500 mt-2 block">✓ Video Attached</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Featured Toggle */}
              <div className="flex items-center gap-2 mt-4 py-2 border-t border-slate-800 pt-4">
                <input
                  type="checkbox"
                  id="is_featured"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="w-4 h-4 text-cyan-500 border-slate-850 rounded focus:ring-cyan-500 bg-slate-950"
                />
                <Label htmlFor="is_featured" className="text-sm font-semibold text-slate-400 select-none cursor-pointer">
                  Show on Homepage (Featured)
                </Label>
              </div>
            </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800 p-6 flex-shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={formLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={formLoading}>
                  {formLoading ? "Publishing..." : "Save Article"}
                </Button>
              </div>
            </form>
          )}
      </Modal>

      {/* Translation (Arabic) Modal */}
      <Modal isOpen={isTranslateModalOpen} onClose={() => setIsTranslateModalOpen(false)} className="w-full max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl flex flex-col max-h-[85vh] overflow-hidden shadow-2xl">
        {modalLoading ? (
          <div className="py-12 text-center text-gray-500">
            <span className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin inline-block mr-2"></span>
            Loading content mappings...
          </div>
        ) : (
          <form onSubmit={handleTranslateSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* FIXED HEADER */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 sticky top-0 z-10 flex justify-between items-center px-6 flex-shrink-0">
              <h3 className="text-lg font-bold text-white/90">
                Link Arabic Translation
              </h3>
            </div>

            {/* SCROLLABLE INNER BODY */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-900/50">
              {/* Arabic Title */}
              <div>
                <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Arabic Title <span className="text-cyan-500">*</span>
                </Label>
                <input
                  type="text"
                  required
                  dir="rtl"
                  value={titleAr}
                  onChange={(e) => handleFieldChange("title_ar", e.target.value, setTitleAr)}
                  className={`w-full h-11 px-4 py-2.5 rounded-xl border text-sm text-right font-sans-arabic bg-slate-950/80 text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all ${
                    errors.title_ar
                      ? "border-red-500"
                      : "border-slate-800"
                  }`}
                  placeholder="العنوان باللغة العربية"
                />
                {errors.title_ar && (
                  <p className="mt-1 text-xs text-red-500">{errors.title_ar[0]}</p>
                )}
              </div>

              {/* Arabic Excerpt */}
              <div>
                <Label className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                  Arabic Excerpt / Brief Description <span className="text-cyan-500">*</span>
                </Label>
                <textarea
                  required
                  rows={3}
                  dir="rtl"
                  value={excerptAr}
                  onChange={(e) => handleFieldChange("excerpt_ar", e.target.value, setExcerptAr)}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm text-right font-sans-arabic bg-slate-950/80 text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all ${
                    errors.excerpt_ar
                      ? "border-red-500"
                      : "border-slate-800"
                  }`}
                  placeholder="الوصف المختصر للمقال بالعربية..."
                />
                {errors.excerpt_ar && (
                  <p className="mt-1 text-xs text-red-500">{errors.excerpt_ar[0]}</p>
                )}
              </div>

              {/* Block Mappings */}
              <div className="pt-4 border-t border-slate-800">
                <div className="mb-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Translate Section Blocks (Arabic)
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    Map each block's text to its Arabic equivalent. Media files will link automatically.
                  </p>
                </div>

                <div className="space-y-6">
                  {blocksAr.map((block, idx) => {
                    const refBlock = blocksEn[idx];
                    return (
                      <div
                        key={idx}
                        className="p-5 bg-slate-950/40 rounded-2xl border border-slate-800 relative hover:border-slate-700/80 transition-all"
                      >
                        <div className="flex justify-between items-center mb-3">
                          <span className="inline-block text-[10px] font-bold tracking-wider bg-cyan-400/10 text-cyan-400 px-2 py-0.5 rounded-full">
                            Block #{idx + 1}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* Left Side: English Reference */}
                          <div className="p-4 bg-slate-950 rounded-xl border border-slate-900 text-xs text-slate-400 space-y-2 flex flex-col justify-start">
                            <p className="font-bold text-slate-300 border-b border-slate-900 pb-1.5">English Reference:</p>
                            {refBlock?.title ? (
                              <p><strong>Subheading:</strong> {refBlock.title}</p>
                            ) : (
                              <p className="italic text-slate-655">No Subheading</p>
                            )}
                            {refBlock?.text ? (
                              <p className="leading-relaxed whitespace-pre-line"><strong>Text:</strong> {refBlock.text}</p>
                            ) : (
                              <p className="italic text-slate-655">No Paragraph Text</p>
                            )}
                            {refBlock?.code && (
                              <div className="mt-1.5">
                                <strong>Code:</strong>
                                <pre className="p-3 bg-slate-900 border border-slate-800/80 rounded-lg font-mono text-[10px] overflow-x-auto text-slate-300 mt-1">{refBlock.code}</pre>
                              </div>
                            )}
                          </div>

                          {/* Right Side: Arabic Translation */}
                          <div className="space-y-4" dir="rtl">
                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-400 text-right">
                                العنوان الفرعي بالعربية (Subheading)
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={block.title || ""}
                                onChange={(e) => handleArabicBlockChange(idx, "title", e.target.value)}
                                className="w-full h-10 px-3 rounded-lg border border-slate-800 bg-slate-950 text-xs text-right font-sans-arabic text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all"
                                placeholder="اكتب العنوان الفرعي بالعربية هنا..."
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-semibold mb-1 text-slate-400 text-right">
                                النص بالعربية (Paragraph Text)
                              </label>
                              <textarea
                                rows={5}
                                dir="rtl"
                                value={block.text || ""}
                                onChange={(e) => handleArabicBlockChange(idx, "text", e.target.value)}
                                className="w-full px-3 py-2 rounded-lg border border-slate-800 bg-slate-950 text-xs text-right font-sans-arabic text-white outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all resize-y"
                                placeholder="اكتب محتوى الفقرة بالعربية هنا..."
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* FIXED FOOTER */}
            <div className="flex justify-end gap-3 pt-4 border-t border-slate-800 p-6 flex-shrink-0 bg-slate-900">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsTranslateModalOpen(false)}
                disabled={formLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? "Linking Translation..." : "Link Arabic Translation"}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}

const TrashIcon = ({ className = "w-4 h-4" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
  </svg>
);
