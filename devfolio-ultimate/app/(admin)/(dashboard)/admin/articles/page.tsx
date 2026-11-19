"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { Modal } from "../../../components/ui/modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "../../../components/ui/table";
import Image from "next/image";
import { resolveImageUrl, getApiBaseUrl } from "@/lib/utils";
import {
  PencilSquareIcon,
  TrashIcon,
  EyeIcon,
  LanguageIcon,
  PlusIcon,
  SparklesIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentDuplicateIcon,
  PhotoIcon,
  VideoCameraIcon,
  CodeBracketIcon,
  CheckIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  CodeBracketSquareIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";

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
  title: string;
  excerpt: string;
  title_en?: string;
  title_ar?: string;
  excerpt_en?: string;
  excerpt_ar?: string;
  feature_image: string | null;
  feature_video: string | null;
  tags: string[];
  is_featured: boolean;
  category?: "technical" | "personal";
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

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "technical" | "personal" | "featured"
  >("all");

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isTranslateModalOpen, setIsTranslateModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<"en" | "ar">("en");
  const [formLoading, setFormLoading] = useState(false);

  // Form Fields
  const [titleEn, setTitleEn] = useState("");
  const [excerptEn, setExcerptEn] = useState("");
  const [titleAr, setTitleAr] = useState("");
  const [excerptAr, setExcerptAr] = useState("");
  const [tags, setTags] = useState("");
  const [isFeatured, setIsFeatured] = useState(false);
  const [category, setCategory] = useState<"technical" | "personal">("technical");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [blocksEn, setBlocksEn] = useState<ContentBlock[]>([
    { title: "", text: "", code: "", images: [], videos: [], newImages: [], newVideos: [] },
  ]);
  const [blocksAr, setBlocksAr] = useState<Array<{ title: string; text: string }>>([
    { title: "", text: "" },
  ]);

  // Errors & notifications
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [globalError, setGlobalError] = useState("");
  const [successToast, setSuccessToast] = useState("");

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = localStorage.getItem("admin_token");
      setToken(storedToken);
    }
  }, []);

  const showToast = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(""), 4000);
  };

  const fetchArticles = async (page: number) => {
    setIsLoading(true);
    setGlobalError("");
    try {
      const apiBase = getApiBaseUrl();
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

  // Metrics summary
  const metrics = useMemo(() => {
    const total = articles.length;
    const tech = articles.filter((a) => a.category !== "personal").length;
    const personal = articles.filter((a) => a.category === "personal").length;
    const featured = articles.filter((a) => a.is_featured).length;
    const views = articles.reduce((sum, a) => sum + (a.stats?.views || 0), 0);
    const likes = articles.reduce((sum, a) => sum + (a.stats?.likes || 0), 0);
    return { total, tech, personal, featured, views, likes };
  }, [articles]);

  // Filtered & Searched articles
  const filteredArticles = useMemo(() => {
    return articles.filter((art) => {
      // Category filter
      if (activeFilter === "technical" && art.category === "personal") return false;
      if (activeFilter === "personal" && art.category !== "personal") return false;
      if (activeFilter === "featured" && !art.is_featured) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = art.title?.toLowerCase().includes(query);
        const matchExcerpt = art.excerpt?.toLowerCase().includes(query);
        const matchTags = art.tags?.some((t) => t.toLowerCase().includes(query));
        if (!matchTitle && !matchExcerpt && !matchTags) return false;
      }

      return true;
    });
  }, [articles, activeFilter, searchQuery]);

  // Modal open helpers
  const openCreateModal = () => {
    setIsEditing(false);
    setEditingId(null);
    setTitleEn("");
    setExcerptEn("");
    setTitleAr("");
    setExcerptAr("");
    setTags("");
    setIsFeatured(false);
    setCategory("technical");
    setSelectedImage(null);
    setImagePreviewUrl(null);
    setSelectedVideo(null);
    setVideoPreviewUrl(null);
    setBlocksEn([
      { title: "", text: "", code: "", images: [], videos: [], newImages: [], newVideos: [] },
    ]);
    setBlocksAr([{ title: "", text: "" }]);
    setActiveFormTab("en");
    setErrors({});
    setGlobalError("");
    setIsFormModalOpen(true);
  };

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

      // Fetch English representation
      const resEn = await fetch(`${apiBase}/articles/${articleId}`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      });
      if (!resEn.ok) throw new Error("Failed to load English details");
      const payloadEn = await resEn.json();
      const artEn = payloadEn.data;

      // Fetch Arabic representation
      const resAr = await fetch(`${apiBase}/articles/${articleId}`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "ar",
        },
      });
      if (!resAr.ok) throw new Error("Failed to load Arabic details");
      const payloadAr = await resAr.json();
      const artAr = payloadAr.data;

      setTitleEn(artEn.title_en || artEn.title || "");
      setExcerptEn(artEn.excerpt_en || artEn.excerpt || "");
      setTitleAr(artAr.title_ar || artAr.title || "");
      setExcerptAr(artAr.excerpt_ar || artAr.excerpt || "");

      setTags(artEn.tags ? artEn.tags.join(", ") : "");
      setImagePreviewUrl(artEn.feature_image);
      setVideoPreviewUrl(artEn.feature_video);
      setIsFeatured(artEn.is_featured || false);
      setCategory(artEn.category === "personal" ? "personal" : "technical");
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

  const openTranslateModal = async (articleId: number) => {
    setEditingId(articleId);
    setErrors({});
    setGlobalError("");
    setIsTranslateModalOpen(true);
    setModalLoading(true);

    try {
      const apiBase = getApiBaseUrl();
      const resEn = await fetch(`${apiBase}/articles/${articleId}`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en",
        },
      });
      if (!resEn.ok) throw new Error("Failed to load base details");
      const payloadEn = await resEn.json();
      const artEn = payloadEn.data;

      const resAr = await fetch(`${apiBase}/articles/${articleId}`, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "ar",
        },
      });
      const payloadAr = resAr.ok ? await resAr.json() : null;
      const artAr = payloadAr?.data;

      setTitleAr(artAr?.title_ar || artAr?.title || "");
      setExcerptAr(artAr?.excerpt_ar || artAr?.excerpt || "");

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
        : [];
      setBlocksEn(mappedBlocksEn);

      const mappedBlocksAr = artAr?.content
        ? artAr.content.map((b: any) => ({
          title: b.title || "",
          text: b.text || "",
        }))
        : mappedBlocksEn.map(() => ({ title: "", text: "" }));
      setBlocksAr(mappedBlocksAr);
    } catch (err: any) {
      console.error("Failed to load translation data:", err);
      setGlobalError("Could not retrieve article translation information.");
    } finally {
      setModalLoading(false);
    }
  };

  // Block management
  const addBlock = () => {
    setBlocksEn([
      ...blocksEn,
      { title: "", text: "", code: "", images: [], videos: [], newImages: [], newVideos: [] },
    ]);
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

  const handleRemoveServerFile = async (
    blockIndex: number,
    type: "images" | "videos",
    url: string
  ) => {
    if (!window.confirm(`Are you sure you want to delete this media item?`)) return;

    try {
      const activeToken = token || localStorage.getItem("admin_token");
      const apiBase = getApiBaseUrl();

      const response = await fetch(`${apiBase}/media/${encodeURIComponent(url)}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete file from server");
      }

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
      showToast("Media file removed.");
    } catch (err: any) {
      console.error("Delete server file failed:", err);
      alert(err.message || "Failed to delete file.");
    }
  };

  // Submit Main Article Form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    setFormLoading(true);

    try {
      const formDataObj = new FormData();

      // Graceful bi-directional fallback: neither English nor Arabic is forced
      const cleanTitleEn = titleEn.trim();
      const cleanTitleAr = titleAr.trim();
      const finalTitleEn = cleanTitleEn || cleanTitleAr || "Untitled Article";
      const finalTitleAr = cleanTitleAr || cleanTitleEn || "مقال جديد";

      const cleanExcerptEn = excerptEn.trim();
      const cleanExcerptAr = excerptAr.trim();
      const finalExcerptEn = cleanExcerptEn || cleanExcerptAr || "";
      const finalExcerptAr = cleanExcerptAr || cleanExcerptEn || "";

      formDataObj.append("title_en", finalTitleEn);
      formDataObj.append("excerpt_en", finalExcerptEn);
      formDataObj.append("title_ar", finalTitleAr);
      formDataObj.append("excerpt_ar", finalExcerptAr);
      formDataObj.append("is_featured", isFeatured ? "1" : "0");
      formDataObj.append("category", category);

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

        if (block.images && block.images.length > 0) {
          block.images.forEach((imgUrl) => {
            formDataObj.append(`blocks[${idx}][images][]`, imgUrl);
          });
        }
        if (block.newImages && block.newImages.length > 0) {
          block.newImages.forEach((file) => {
            formDataObj.append(`blocks[${idx}][images][]`, file);
          });
        }

        if (block.videos && block.videos.length > 0) {
          block.videos.forEach((vidUrl) => {
            formDataObj.append(`blocks[${idx}][videos][]`, vidUrl);
          });
        }
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

      blocksAr.forEach((block, idx) => {
        formDataObj.append(`content_ar[${idx}][title]`, block.title || "");
        formDataObj.append(`content_ar[${idx}][text]`, block.text || "");
      });

      const activeToken = token || localStorage.getItem("admin_token");
      const apiBase = getApiBaseUrl();

      const url = isEditing
        ? `${apiBase}/articles/${editingId}`
        : `${apiBase}/articles`;

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
        throw new Error(errData.message || `Server returned status ${response.status}`);
      }

      setIsFormModalOpen(false);
      fetchArticles(currentPage);
      showToast(isEditing ? "Article updated successfully!" : "Article published successfully!");
    } catch (err: any) {
      console.error("Submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred while saving.");
    } finally {
      setFormLoading(false);
    }
  };

  // Submit Arabic Translation
  const handleTranslateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setGlobalError("");
    setFormLoading(true);

    try {
      const activeToken = token || localStorage.getItem("admin_token");
      const apiBase = getApiBaseUrl();

      const payload = {
        title_ar: titleAr.trim(),
        excerpt_ar: excerptAr.trim(),
        content_ar: blocksAr.map((block) => ({
          title: block.title || null,
          text: block.text || null,
        })),
      };

      const response = await fetch(`${apiBase}/articles/${editingId}/translate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${activeToken}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        if (response.status === 422) {
          setErrors(errData.errors || {});
          setGlobalError(errData.message || "Please check Arabic validation errors.");
          return;
        }
        throw new Error("Failed to submit translation.");
      }

      setIsTranslateModalOpen(false);
      fetchArticles(currentPage);
      showToast("Arabic translation linked successfully!");
    } catch (err: any) {
      console.error("Translation submit error:", err);
      setGlobalError(err.message || "An unexpected error occurred.");
    } finally {
      setFormLoading(false);
    }
  };

  // Delete Action
  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to permanently delete this article?")) return;

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
        showToast("Article deleted.");
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

  // Render tag chips preview
  const tagsList = tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-bottom-5">
          <CheckIcon className="w-5 h-5" />
          <span>{successToast}</span>
        </div>
      )}

      {/* Top Header & Action */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              Content Studio
            </span>
            <span className="text-xs text-slate-500">•</span>
            <span className="text-xs text-slate-400">Knowledge Base & Articles</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <span>Articles Management</span>
            <span className="text-2xl">✍️</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-xl">
            Author high-impact technical tutorials and personal reflections with bilingual blocks, multimedia, and instant SEO readiness.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="group relative inline-flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 shadow-[0_4px_25px_rgba(6,182,212,0.35)] hover:shadow-[0_4px_30px_rgba(6,182,212,0.5)] transition-all duration-300 cursor-pointer active:scale-95"
        >
          <PlusIcon className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Total Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-slate-700/80 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">Total Posts</p>
              <h3 className="text-2xl font-bold text-white mt-1">{metrics.total}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center">
              <BookOpenIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">
            {meta?.total || metrics.total} published in database
          </div>
        </div>

        {/* Technical Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-cyan-400">Technical</p>
              <h3 className="text-2xl font-bold text-white mt-1">{metrics.tech}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
              <CodeBracketSquareIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">Main public blog feed</div>
        </div>

        {/* Personal Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-purple-400">Personal</p>
              <h3 className="text-2xl font-bold text-white mt-1">{metrics.personal}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
              <span>✍️</span>
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500">Dedicated reflections route</div>
        </div>

        {/* Engagement Card */}
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">Total Views</p>
              <h3 className="text-2xl font-bold text-white mt-1">{metrics.views}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <EyeIcon className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center gap-1.5">
            <HeartIcon className="w-3.5 h-3.5 text-rose-500" />
            <span>{metrics.likes} community likes</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-800">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          {[
            { id: "all", label: "All Posts", count: metrics.total },
            { id: "technical", label: "💻 Technical", count: metrics.tech },
            { id: "personal", label: "✍️ Personal", count: metrics.personal },
            { id: "featured", label: "⭐ Featured", count: metrics.featured },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${activeFilter === tab.id
                  ? "bg-slate-800 text-white shadow-sm border border-slate-700"
                  : "text-slate-400 hover:text-white hover:bg-slate-850"
                }`}
            >
              <span>{tab.label}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-950/60 text-slate-400">
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <MagnifyingGlassIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by title or tags..."
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {globalError && (
        <div className="p-4 bg-red-950/40 border border-red-500/40 text-red-300 rounded-2xl text-xs flex items-center gap-2">
          <span>⚠️</span>
          <span>{globalError}</span>
        </div>
      )}

      {/* Main Articles Table Card */}
      <div className="rounded-2xl border border-slate-800/80 bg-slate-900/60 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto w-full">
          <Table className="min-w-full divide-y divide-slate-800">
            <TableHeader className="bg-slate-950/40">
              <TableRow className="border-b border-slate-800">
                <TableCell isHeader className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Article
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Category
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Tags
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Engagement
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Status
                </TableCell>
                <TableCell isHeader className="px-5 py-4 text-right text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            <TableBody className="divide-y divide-slate-800/60 bg-transparent">
              {isLoading ? (
                <TableRow>
                  <TableCell className="px-5 py-12 text-center text-slate-400" colSpan={6}>
                    <div className="flex justify-center items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin"></span>
                      <span className="text-sm font-medium">Loading articles stream...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredArticles.length === 0 ? (
                <TableRow>
                  <TableCell className="px-5 py-16 text-center text-slate-400" colSpan={6}>
                    <div className="max-w-md mx-auto text-center space-y-3">
                      <div className="text-4xl">📝</div>
                      <h4 className="text-base font-semibold text-white">No articles found</h4>
                      <p className="text-xs text-slate-500">
                        {searchQuery
                          ? `No matches for "${searchQuery}". Try a different keyword.`
                          : "You have not published any articles in this section yet."}
                      </p>
                      <button
                        onClick={openCreateModal}
                        className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
                      >
                        Create your first article
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredArticles.map((art) => (
                  <TableRow
                    key={art.id}
                    className="hover:bg-slate-800/30 transition-colors group"
                  >
                    {/* Thumbnail & Title Column */}
                    <TableCell className="px-5 py-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-16 h-12 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 flex-shrink-0 group-hover:border-slate-700 transition-colors">
                          {art.feature_image ? (
                            <Image
                              src={resolveImageUrl(art.feature_image, "")}
                              alt={art.title || "Article"}
                              fill
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              sizes="64px"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">
                              📷
                            </div>
                          )}
                        </div>
                        <div className="max-w-xs sm:max-w-sm">
                          <h4 className="font-semibold text-sm text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                            {art.title || "Untitled Article"}
                          </h4>
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {art.excerpt || "No excerpt provided"}
                          </p>
                          <span className="text-[10px] text-slate-500 mt-1 block">
                            {art.date?.diff || art.date?.raw || "Recently"}
                          </span>
                        </div>
                      </div>
                    </TableCell>

                    {/* Category Column */}
                    <TableCell className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${art.category === "personal"
                            ? "bg-purple-950/60 text-purple-300 border border-purple-500/30 shadow-[0_0_12px_rgba(168,85,247,0.15)]"
                            : "bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                          }`}
                      >
                        <span>{art.category === "personal" ? "✍️" : "💻"}</span>
                        <span>{art.category === "personal" ? "Personal" : "Technical"}</span>
                      </span>
                    </TableCell>

                    {/* Tags Column */}
                    <TableCell className="px-5 py-4">
                      <div className="flex flex-wrap gap-1 max-w-[180px]">
                        {art.tags && art.tags.length > 0 ? (
                          art.tags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="inline-block px-2 py-0.5 text-[10px] rounded-md bg-slate-950/80 text-slate-400 border border-slate-800"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-600">—</span>
                        )}
                        {art.tags && art.tags.length > 3 && (
                          <span className="text-[10px] text-slate-500 self-center">
                            +{art.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>

                    {/* Engagement Column */}
                    <TableCell className="px-5 py-4">
                      <div className="flex flex-col gap-1 text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <EyeIcon className="w-3.5 h-3.5 text-cyan-400" />
                          <span>{art.stats?.views || 0} views</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <HeartIcon className="w-3.5 h-3.5 text-rose-400" />
                          <span>{art.stats?.likes || 0} likes</span>
                        </span>
                      </div>
                    </TableCell>

                    {/* Status Column */}
                    <TableCell className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${art.is_featured
                            ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                            : "bg-slate-950/60 text-slate-400 border border-slate-800"
                          }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${art.is_featured ? "bg-emerald-400 animate-pulse" : "bg-slate-500"
                            }`}
                        />
                        <span>{art.is_featured ? "Featured" : "Standard"}</span>
                      </span>
                    </TableCell>

                    {/* Action Buttons */}
                    <TableCell className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => window.open(`/blog/${art.id}`, "_blank")}
                          className="p-2 rounded-xl text-slate-400 hover:text-cyan-400 hover:bg-slate-800/80 transition-all cursor-pointer"
                          title="Preview on site"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openTranslateModal(art.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-emerald-400 hover:bg-slate-800/80 transition-all cursor-pointer"
                          title="Translate / Link Arabic"
                        >
                          <LanguageIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(art.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800/80 transition-all cursor-pointer"
                          title="Edit Article"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(art.id)}
                          className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer"
                          title="Delete Article"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination bar */}
        {meta && meta.last_page > 1 && (
          <div className="p-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
            <span>
              Page {meta.current_page} of {meta.last_page} ({meta.total} total items)
            </span>
            <div className="flex gap-2">
              <button
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 disabled:opacity-30 hover:bg-slate-800 transition-colors"
              >
                Previous
              </button>
              <button
                disabled={currentPage >= meta.last_page}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-slate-800 disabled:opacity-30 hover:bg-slate-800 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────────
          THE ULTIMATE ARTICLE CREATION / EDITING STUDIO MODAL (MAX-W-5XL)
      ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        showCloseButton={false}
        className="w-full max-w-5xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl flex flex-col max-h-[92vh] overflow-hidden shadow-[0_25px_80px_rgba(0,0,0,0.9)]"
      >
        {modalLoading ? (
          <div className="py-24 text-center text-slate-400 space-y-3">
            <span className="w-8 h-8 rounded-full border-3 border-cyan-500 border-t-transparent animate-spin inline-block"></span>
            <p className="text-sm font-medium">Fetching article content & translations...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            {/* 1. STUDIO HEADER */}
            <div className="px-8 py-5 border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <PencilSquareIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    {isEditing ? `Edit Article #${editingId}` : "Write New Article"}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
                      Studio
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Draft modular blocks, media assets, and bilingual versions
                  </p>
                </div>
              </div>

              {/* Center/Right: Bilingual Segmented Switcher & Dedicated Close Button */}
              <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                <div className="bg-slate-950 p-1.5 rounded-2xl border border-slate-800 flex items-center gap-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setActiveFormTab("en")}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${activeFormTab === "en"
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white"
                      }`}
                  >
                    <span>🇬🇧</span>
                    <span>English Content</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveFormTab("ar")}
                    className={`px-4 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${activeFormTab === "ar"
                        ? "bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm"
                        : "text-slate-400 hover:text-white"
                      }`}
                  >
                    <span>🇸🇦</span>
                    <span>المحتوى العربي</span>
                  </button>
                </div>

                <div className="h-6 w-[1px] bg-slate-800 hidden sm:block" />

                {/* DEDICATED CLOSE BUTTON - NEVER OVERLAPS TABS */}
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  className="w-9 h-9 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                  title="Close (Esc)"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* 2. SCROLLABLE STUDIO CANVAS */}
            <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-slate-950/40 custom-scrollbar">
              {/* SECTION A: CATEGORY & HOMEPAGE VISIBILITY */}
              <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <SparklesIcon className="w-4 h-4 text-cyan-400" />
                      <span>Article Classification & Destination</span>
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select which section this article belongs to and configure homepage highlight
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  {/* Technical Card */}
                  <button
                    type="button"
                    onClick={() => setCategory("technical")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex items-start gap-4 ${category === "technical"
                        ? "bg-cyan-950/30 border-cyan-500/60 shadow-[0_0_25px_rgba(6,182,212,0.15)] ring-1 ring-cyan-500/40"
                        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center text-2xl flex-shrink-0">
                      💻
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-white">Technical Deep-dive</h5>
                        {category === "technical" && (
                          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Engineering, architecture, coding tutorials, and backend solutions. Appears in the main /blog feed.
                      </p>
                    </div>
                  </button>

                  {/* Personal Card */}
                  <button
                    type="button"
                    onClick={() => setCategory("personal")}
                    className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex items-start gap-4 ${category === "personal"
                        ? "bg-purple-950/30 border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.15)] ring-1 ring-purple-500/40"
                        : "bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700"
                      }`}
                  >
                    <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center text-2xl flex-shrink-0">
                      ✍️
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-bold text-white">Personal Reflections</h5>
                        {category === "personal" && (
                          <span className="w-2.5 h-2.5 rounded-full bg-purple-400 shadow-[0_0_8px_#c084fc]"></span>
                        )}
                      </div>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        Life journey, career philosophy, thoughts, and lessons. Isolated cleanly in /blog/personal.
                      </p>
                    </div>
                  </button>
                </div>

                {/* Featured Toggle Switch */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-600"></div>
                    </label>
                    <div>
                      <span className="text-xs font-semibold text-slate-300 block">
                        Feature on Homepage (Featured Post)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        When enabled, this article is prioritized in the homepage carousel
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* TAB 1: ENGLISH CONTENT */}
              {activeFormTab === "en" ? (
                <>
                  {/* SECTION B: ARTICLE METADATA */}
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <span>Article Details (English)</span>
                    </h4>

                    {/* Title */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        English Title / عنوان المقال
                      </label>
                      <input
                        type="text"
                        value={titleEn}
                        onChange={(e) => handleFieldChange("title_en", e.target.value, setTitleEn)}
                        placeholder="E.g. Building Scalable Event-Driven Microservices in Laravel"
                        className="w-full h-12 px-4 rounded-xl border border-slate-800 bg-slate-950/80 text-white text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-600"
                      />
                    </div>

                    {/* Excerpt */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Summary / Brief Excerpt
                      </label>
                      <textarea
                        rows={3}
                        value={excerptEn}
                        onChange={(e) => handleFieldChange("excerpt_en", e.target.value, setExcerptEn)}
                        placeholder="Write a catchy 2-3 sentence overview that appears on preview cards..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-600 leading-relaxed"
                      />
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                        Tags & Keywords (Comma separated)
                      </label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => handleFieldChange("tags", e.target.value, setTags)}
                        placeholder="Laravel, Redis, Architecture, Performance"
                        className="w-full h-11 px-4 rounded-xl border border-slate-800 bg-slate-950/80 text-white text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-600"
                      />
                      {tagsList.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {tagsList.map((t, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-0.5 rounded-full text-xs bg-slate-800 text-cyan-300 border border-slate-700 font-medium"
                            >
                              #{t}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* SECTION C: COVER MEDIA STUDIO */}
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <PhotoIcon className="w-4 h-4 text-cyan-400" />
                      <span>Cover Media Studio</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {/* Image Dropzone */}
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-400">
                          Feature Image (16:9 Recommended)
                        </label>
                        <div
                          onClick={() => imageInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-2xl p-5 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-cyan-950/10 group flex flex-col items-center justify-center min-h-[140px]"
                        >
                          <input
                            type="file"
                            ref={imageInputRef}
                            accept="image/*"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange(e, setSelectedImage, setImagePreviewUrl, "feature_image")
                            }
                          />
                          {imagePreviewUrl ? (
                            <div className="relative w-full h-32 rounded-xl overflow-hidden group">
                              <Image
                                src={imagePreviewUrl}
                                alt="Cover preview"
                                fill
                                className="object-cover"
                              />
                              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs text-white font-medium transition-opacity">
                                Click to replace image
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-1">
                              <div className="w-10 h-10 rounded-xl bg-slate-900 text-slate-400 flex items-center justify-center mx-auto group-hover:text-cyan-400 transition-colors">
                                <PhotoIcon className="w-5 h-5" />
                              </div>
                              <p className="text-xs font-medium text-slate-300">
                                Click to browse cover image
                              </p>
                              <p className="text-[10px] text-slate-500">PNG, JPG, WebP up to 10MB</p>
                            </div>
                          )}
                        </div>
                        {imagePreviewUrl && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreviewUrl(null);
                            }}
                            className="text-[11px] text-rose-400 hover:underline cursor-pointer"
                          >
                            Remove cover image
                          </button>
                        )}
                      </div>

                      {/* Video Dropzone */}
                      <div className="space-y-2">
                        <label className="block text-xs font-medium text-slate-400">
                          Feature Video (Optional)
                        </label>
                        <div
                          onClick={() => videoInputRef.current?.click()}
                          className="border-2 border-dashed border-slate-800 hover:border-cyan-500/60 rounded-2xl p-5 text-center cursor-pointer transition-all bg-slate-950/40 hover:bg-cyan-950/10 group flex flex-col items-center justify-center min-h-[140px]"
                        >
                          <input
                            type="file"
                            ref={videoInputRef}
                            accept="video/mp4,video/quicktime"
                            className="hidden"
                            onChange={(e) =>
                              handleFileChange(e, setSelectedVideo, setVideoPreviewUrl, "feature_video")
                            }
                          />
                          <div className="space-y-1">
                            <div className="w-10 h-10 rounded-xl bg-slate-900 text-slate-400 flex items-center justify-center mx-auto group-hover:text-cyan-400 transition-colors">
                              <VideoCameraIcon className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-medium text-slate-300">
                              {selectedVideo ? selectedVideo.name : "Click to select Cover Video"}
                            </p>
                            <p className="text-[10px] text-slate-500">Supports MP4, MOV (Max 20MB)</p>
                          </div>
                        </div>
                        {videoPreviewUrl && (
                          <div className="flex justify-between items-center text-[11px]">
                            <span className="text-emerald-400">✓ Video Attached</span>
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedVideo(null);
                                setVideoPreviewUrl(null);
                              }}
                              className="text-rose-400 hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* SECTION D: MODULAR CONTENT BLOCKS */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                          <CodeBracketIcon className="w-4 h-4 text-cyan-400" />
                          <span>Article Sections & Content Blocks</span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Compose your article with flexible paragraphs, code snippets, and inline media
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={addBlock}
                        className="px-4 py-2 rounded-xl text-xs font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add Section</span>
                      </button>
                    </div>

                    <div className="space-y-6">
                      {blocksEn.map((block, idx) => (
                        <div
                          key={idx}
                          className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 relative hover:border-slate-700 transition-all shadow-lg"
                        >
                          {/* Block Card Header Bar */}
                          <div className="flex justify-between items-center pb-3 border-b border-slate-800/80">
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                              Section #{idx + 1}
                            </span>

                            <div className="flex items-center gap-2">
                              {idx > 0 && (
                                <button
                                  type="button"
                                  onClick={() => moveBlock(idx, "up")}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                  title="Move section up"
                                >
                                  <ArrowUpIcon className="w-4 h-4" />
                                </button>
                              )}
                              {idx < blocksEn.length - 1 && (
                                <button
                                  type="button"
                                  onClick={() => moveBlock(idx, "down")}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                                  title="Move section down"
                                >
                                  <ArrowDownIcon className="w-4 h-4" />
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => duplicateBlock(idx)}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
                                title="Duplicate section"
                              >
                                <DocumentDuplicateIcon className="w-4 h-4" />
                              </button>
                              {blocksEn.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => removeBlock(idx)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                                  title="Delete section"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Subheading */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                              Section Subheading
                            </label>
                            <input
                              type="text"
                              value={block.title}
                              onChange={(e) => handleBlockChange(idx, "title", e.target.value)}
                              placeholder="E.g. 1. Architecture & Core Concepts"
                              className="w-full h-11 px-4 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all"
                            />
                          </div>

                          {/* Paragraph text */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                              Body Text (Markdown & Pre-line Supported)
                            </label>
                            <textarea
                              rows={4}
                              value={block.text}
                              onChange={(e) => handleBlockChange(idx, "text", e.target.value)}
                              placeholder="Write the in-depth technical explanation or section story..."
                              className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/10 transition-all leading-relaxed"
                            />
                          </div>

                          {/* Code block */}
                          <div>
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                              <span>Code Snippet (Optional)</span>
                              <span className="text-[10px] text-cyan-400 lowercase font-mono">
                                syntax highlighted
                              </span>
                            </label>
                            <textarea
                              rows={4}
                              value={block.code}
                              onChange={(e) => handleBlockChange(idx, "code", e.target.value)}
                              placeholder="// Paste JavaScript, PHP, Python, or shell code here..."
                              className="w-full p-4 rounded-xl border border-slate-800 bg-black font-mono text-xs text-cyan-300 outline-none focus:border-cyan-500 transition-all leading-relaxed"
                            />
                          </div>

                          {/* Block Media Attachments */}
                          <div className="pt-2 border-t border-slate-800/80 space-y-3">
                            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                              Section Media Attachments
                            </label>

                            <div className="flex flex-wrap gap-4 items-center">
                              {/* Add Images */}
                              <label className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 font-medium cursor-pointer transition-colors flex items-center gap-2">
                                <PhotoIcon className="w-4 h-4 text-cyan-400" />
                                <span>Add Images</span>
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleBlockFilesChange(idx, "images", e.target.files)}
                                />
                              </label>

                              {/* Add Videos */}
                              <label className="px-3.5 py-2 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-xs text-slate-300 font-medium cursor-pointer transition-colors flex items-center gap-2">
                                <VideoCameraIcon className="w-4 h-4 text-purple-400" />
                                <span>Add Videos</span>
                                <input
                                  type="file"
                                  multiple
                                  accept="video/*"
                                  className="hidden"
                                  onChange={(e) => handleBlockFilesChange(idx, "videos", e.target.files)}
                                />
                              </label>
                            </div>

                            {/* Existing Images Gallery */}
                            {block.images && block.images.length > 0 && (
                              <div className="flex flex-wrap gap-2 pt-2">
                                {block.images.map((imgUrl, imgIdx) => (
                                  <div
                                    key={imgIdx}
                                    className="relative w-20 h-16 rounded-lg overflow-hidden border border-slate-800 group"
                                  >
                                    <Image
                                      src={imgUrl.startsWith("http") ? imgUrl : resolveImageUrl(imgUrl)}
                                      alt="Attachment"
                                      fill
                                      className="object-cover"
                                    />
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveServerFile(idx, "images", imgUrl)}
                                      className="absolute inset-0 bg-red-950/80 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center text-xs font-semibold transition-opacity"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* New pending images preview */}
                            {block.newImages && block.newImages.length > 0 && (
                              <div className="text-[11px] text-cyan-400 flex items-center gap-1.5 pt-1">
                                <CheckIcon className="w-3.5 h-3.5" />
                                <span>{block.newImages.length} new image(s) ready to upload</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {/* Add Section dashed button */}
                      <button
                        type="button"
                        onClick={addBlock}
                        className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-800 hover:border-cyan-500/50 hover:bg-cyan-500/5 text-slate-400 hover:text-cyan-400 transition-all font-semibold text-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <PlusIcon className="w-4 h-4" />
                        <span>Add Another Section Block</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* TAB 2: ARABIC CONTENT */
                <div className="space-y-6" dir="rtl">
                  <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 space-y-5">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                        البيانات النصية (اللغة العربية)
                      </h4>
                      <span className="text-[11px] text-slate-500">
                        جميع الحقول اختيارية تماماً
                      </span>
                    </div>

                    {/* Arabic Title */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2 text-right">
                        عنوان المقال بالعربية
                      </label>
                      <input
                        type="text"
                        dir="rtl"
                        value={titleAr}
                        onChange={(e) => handleFieldChange("title_ar", e.target.value, setTitleAr)}
                        placeholder="مثال: هندسة النظم وتوزيع الأحمال في لارافيل"
                        className="w-full h-12 px-4 rounded-xl border border-slate-800 bg-slate-950/80 text-white text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-600 text-right"
                      />
                    </div>

                    {/* Arabic Excerpt */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2 text-right">
                        نبذة ومختصر المقال بالعربية
                      </label>
                      <textarea
                        rows={3}
                        dir="rtl"
                        value={excerptAr}
                        onChange={(e) => handleFieldChange("excerpt_ar", e.target.value, setExcerptAr)}
                        placeholder="اكتب مقدمة ومختصر مشوق يظهر في بطاقات العرض..."
                        className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950/80 text-white text-sm outline-none focus:border-cyan-500 focus:ring-4 focus:ring-cyan-500/10 transition-all placeholder:text-slate-600 text-right leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Arabic Blocks Mapping */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      أقسام المقال بالعربية (Section Blocks)
                    </h4>

                    <div className="space-y-6">
                      {blocksAr.map((block, idx) => {
                        const refBlock = blocksEn[idx];
                        return (
                          <div
                            key={idx}
                            className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4 relative"
                          >
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 inline-block">
                              القسم #{idx + 1}
                            </span>

                            {/* English Reference preview if available */}
                            {refBlock && (refBlock.title || refBlock.text) && (
                              <div
                                dir="ltr"
                                className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs text-slate-400 space-y-1.5"
                              >
                                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                  English Reference:
                                </span>
                                {refBlock.title && (
                                  <p className="font-semibold text-slate-200">{refBlock.title}</p>
                                )}
                                {refBlock.text && (
                                  <p className="line-clamp-2 text-slate-400">{refBlock.text}</p>
                                )}
                              </div>
                            )}

                            <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1 text-right">
                                العنوان الفرعي بالعربية
                              </label>
                              <input
                                type="text"
                                dir="rtl"
                                value={block.title || ""}
                                onChange={(e) => handleArabicBlockChange(idx, "title", e.target.value)}
                                placeholder="عنوان القسم الفرعي..."
                                className="w-full h-11 px-4 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm outline-none focus:border-cyan-500 transition-all text-right"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-slate-400 mb-1 text-right">
                                المحتوى والشرح بالعربية
                              </label>
                              <textarea
                                rows={4}
                                dir="rtl"
                                value={block.text || ""}
                                onChange={(e) => handleArabicBlockChange(idx, "text", e.target.value)}
                                placeholder="اكتب محتوى القسم هنا..."
                                className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm outline-none focus:border-cyan-500 transition-all text-right leading-relaxed"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 3. STICKY FOOTER ACTION BAR */}
            <div className="px-8 py-4 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 flex justify-between items-center z-10 flex-shrink-0">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span
                  className={`w-2 h-2 rounded-full ${category === "personal" ? "bg-purple-400" : "bg-cyan-400"
                    }`}
                />
                <span className="capitalize">{category} Mode</span>
                <span>•</span>
                <span>{blocksEn.length} Content Block(s)</span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsFormModalOpen(false)}
                  disabled={formLoading}
                  className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold transition-all shadow-[0_4px_25px_rgba(6,182,212,0.4)] hover:shadow-[0_4px_30px_rgba(6,182,212,0.6)] cursor-pointer flex items-center gap-2 active:scale-95 disabled:opacity-50"
                >
                  {formLoading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                      <span>Saving Article...</span>
                    </>
                  ) : (
                    <>
                      <CheckIcon className="w-4 h-4" />
                      <span>{isEditing ? "Update Article" : "Publish Article"}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </Modal>

      {/* ─────────────────────────────────────────────────────────────────────────────
          QUICK ARABIC TRANSLATION LINKING MODAL
      ───────────────────────────────────────────────────────────────────────────── */}
      <Modal
        isOpen={isTranslateModalOpen}
        onClose={() => setIsTranslateModalOpen(false)}
        showCloseButton={false}
        className="w-full max-w-3xl mx-auto bg-slate-900 border border-slate-800 rounded-3xl flex flex-col max-h-[88vh] overflow-hidden shadow-2xl"
      >
        {modalLoading ? (
          <div className="py-20 text-center text-slate-400 space-y-3">
            <span className="w-8 h-8 rounded-full border-3 border-emerald-500 border-t-transparent animate-spin inline-block"></span>
            <p className="text-sm font-medium">Loading content mappings...</p>
          </div>
        ) : (
          <form onSubmit={handleTranslateSubmit} className="flex flex-col flex-1 min-h-0 overflow-hidden">
            <div className="px-8 py-5 border-b border-slate-800 bg-slate-900/90 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
                  <LanguageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Link Arabic Translation</h3>
                  <p className="text-xs text-slate-400">Article #{editingId}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsTranslateModalOpen(false)}
                className="w-8 h-8 rounded-xl border border-slate-800 bg-slate-950 text-slate-400 hover:text-white flex items-center justify-center cursor-pointer"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-950/40 custom-scrollbar" dir="rtl">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 text-right">
                  العنوان بالعربية
                </label>
                <input
                  type="text"
                  dir="rtl"
                  value={titleAr}
                  onChange={(e) => handleFieldChange("title_ar", e.target.value, setTitleAr)}
                  className="w-full h-11 px-4 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm outline-none focus:border-emerald-500 transition-all text-right"
                  placeholder="العنوان باللغة العربية"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 text-right">
                  المختصر بالعربية
                </label>
                <textarea
                  rows={3}
                  dir="rtl"
                  value={excerptAr}
                  onChange={(e) => handleFieldChange("excerpt_ar", e.target.value, setExcerptAr)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-800 bg-slate-950 text-white text-sm outline-none focus:border-emerald-500 transition-all text-right leading-relaxed"
                  placeholder="الوصف المختصر للمقال بالعربية..."
                />
              </div>

              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  ترجمة أقسام المقال
                </h4>
                {blocksAr.map((block, idx) => (
                  <div key={idx} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                    <span className="text-xs font-bold text-emerald-400">القسم #{idx + 1}</span>
                    <input
                      type="text"
                      dir="rtl"
                      value={block.title || ""}
                      onChange={(e) => handleArabicBlockChange(idx, "title", e.target.value)}
                      placeholder="العنوان الفرعي بالعربية..."
                      className="w-full h-10 px-3.5 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs outline-none focus:border-emerald-500 text-right"
                    />
                    <textarea
                      rows={3}
                      dir="rtl"
                      value={block.text || ""}
                      onChange={(e) => handleArabicBlockChange(idx, "text", e.target.value)}
                      placeholder="نص القسم بالعربية..."
                      className="w-full p-3 rounded-lg border border-slate-800 bg-slate-950 text-white text-xs outline-none focus:border-emerald-500 text-right leading-relaxed"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="px-8 py-4 bg-slate-900 border-t border-slate-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setIsTranslateModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-lg shadow-emerald-600/30 cursor-pointer"
              >
                {formLoading ? "Saving..." : "Save Translation"}
              </button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
