"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import { dracula } from "react-syntax-highlighter/dist/cjs/styles/prism";
import {
  ArrowLeftIcon,
  ClipboardIcon,
  CheckIcon,
  ClockIcon,
  CalendarIcon,
  EyeIcon,
  HeartIcon,
} from "@heroicons/react/24/solid";
import { useCopyToClipboard } from "react-use";
import Image from "next/image";
import { Blog } from "@/types";
import { resolveImageUrl, getApiBaseUrl } from "@/lib/utils";
import { FaTwitter, FaFacebook, FaLinkedin, FaLink, FaGlobe, FaLaptopCode, FaPenNib } from "react-icons/fa";

function mapBackendBlocksToFrontend(backendContent: any[]): any[] {
  if (!backendContent || !Array.isArray(backendContent)) return [];

  const frontendBlocks: any[] = [];
  backendContent.forEach((block, idx) => {
    if (block.title) {
      frontendBlocks.push({
        id: `heading-${block.id}-${idx}`,
        type: "heading",
        content: block.title,
      });
    }
    if (block.text) {
      frontendBlocks.push({
        id: `text-${block.id}-${idx}`,
        type: "text",
        content: block.text,
      });
    }
    if (block.code) {
      frontendBlocks.push({
        id: `code-${block.id}-${idx}`,
        type: "code",
        content: block.code,
        language: "javascript",
      });
    }
    if (block.images && Array.isArray(block.images)) {
      block.images.forEach((imgUrl: string, imgIdx: number) => {
        frontendBlocks.push({
          id: `image-${block.id}-${idx}-${imgIdx}`,
          type: "image",
          url: imgUrl,
          caption: "",
        });
      });
    }
    if (block.videos && Array.isArray(block.videos)) {
      block.videos.forEach((vidUrl: string, vidIdx: number) => {
        frontendBlocks.push({
          id: `video-${block.id}-${idx}-${vidIdx}`,
          type: "external-video",
          url: vidUrl,
          caption: "",
        });
      });
    }
  });

  return frontendBlocks;
}

type CodeCopyButtonProps = {
  code: string;
};

const CodeCopyButton = ({ code }: CodeCopyButtonProps) => {
  const [state, copyToClipboard] = useCopyToClipboard();
  const [isCopied, setIsCopied] = React.useState(false);

  const handleCopy = () => {
    copyToClipboard(code);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="absolute top-1 right-2 text-gray-400 hover:text-white transition-colors p-1 rounded-md"
    >
      {isCopied ? (
        <CheckIcon className="h-5 w-5 text-green-500" />
      ) : (
        <ClipboardIcon className="h-5 w-5" />
      )}
    </button>
  );
};

// Props type for SingleBlogClient
type SingleBlogClientProps = {
  blogPost: Blog;
};

// Main component to display the blog post
const SingleBlogClient = ({ blogPost }: SingleBlogClientProps) => {
  const router = useRouter();
  const [activeLightboxImg, setActiveLightboxImg] = React.useState<string | null>(null);
  const [lang, setLang] = React.useState<'en' | 'ar'>('en');
  const [currentPost, setCurrentPost] = React.useState(blogPost);
  const [loading, setLoading] = React.useState(false);

  const [activeId, setActiveId] = React.useState("");
  const headings = currentPost.content?.filter((b: any) => b.type === "heading") || [];
  const headingRefs = React.useRef<Record<string, HTMLHeadingElement | null>>({});

  const [likesCount, setLikesCount] = React.useState(blogPost.stats?.likes ?? 0);
  const [isLiked, setIsLiked] = React.useState(blogPost.stats?.liked ?? false);
  const [likeLoading, setLikeLoading] = React.useState(false);
  const [copiedLink, setCopiedLink] = React.useState(false);
  const [copyState, copyToClipboard] = useCopyToClipboard();

  // Reset/sync likes state when currentPost changes
  React.useEffect(() => {
    setLikesCount(currentPost.stats?.likes ?? 0);
    setIsLiked(currentPost.stats?.liked ?? false);
  }, [currentPost]);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const apiBase = getApiBaseUrl();
      const res = await fetch(`${apiBase}/articles/${blogPost.slug}/like`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
        },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.data) {
          setIsLiked(data.data.liked);
          setLikesCount(data.data.likes_count);
        }
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    } finally {
      setLikeLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      copyToClipboard(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const shareOnTwitter = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(currentPost.title);
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, "_blank");
    }
  };

  const shareOnFacebook = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}`, "_blank");
    }
  };

  const shareOnLinkedIn = () => {
    if (typeof window !== "undefined") {
      const url = encodeURIComponent(window.location.href);
      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
    }
  };

  const isFirstMount = React.useRef(true);

  React.useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }

    const fetchTranslation = async () => {
      setLoading(true);
      try {
        const apiBase = getApiBaseUrl();
        const res = await fetch(`${apiBase}/articles/${blogPost.slug}`, {
          headers: {
            "Accept-Language": lang,
          },
          cache: "no-store",
        });
        if (res.ok) {
          const payload = await res.json();
          if (payload.success && payload.data) {
            const fetched = payload.data;
            const mapped = {
              title: fetched.title,
              excerpt: fetched.excerpt,
              date: fetched.date?.raw ? new Date(fetched.date.raw).toLocaleDateString() : new Date().toLocaleDateString(),
              readTime: "5 min read",
              banner: {
                url: fetched.feature_image || "/images/placeholder.jpg",
                type: "image",
                caption: fetched.title,
              },
              slug: fetched.id.toString(),
              lang: lang,
              content: mapBackendBlocksToFrontend(fetched.content),
              feature_video: fetched.feature_video,
              stats: fetched.stats,
              dateDiff: fetched.date?.diff,
            };
            setCurrentPost(mapped);
          }
        }
      } catch (err) {
        console.error("Failed to fetch translation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslation();
  }, [lang, blogPost.slug]);

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        });
      },
      { rootMargin: "0px 0px -70% 0px" }
    );

    headings.forEach((h: any) => {
      const heading = document.getElementById(h.id.toString());
      if (heading) {
        observer.observe(heading);
        headingRefs.current[h.id.toString()] = heading as HTMLHeadingElement;
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  const handleScrollToHeading = (id: string) => {
    const heading = document.getElementById(id);
    if (heading) {
      heading.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const contentLang = currentPost.lang === "ar" ? "rtl" : "ltr"; // Function to render block content

  const renderBlock = (block: any, index: number) => {
    switch (block.type) {
      case "heading":
        return (
          <h2
            id={block.id.toString()}
            className="text-2xl font-bold text-primary mt-10 mb-4"
          >
            {block.content}
          </h2>
        );
      case "text":
        return (
          <p
            lang={currentPost.lang}
            dir={contentLang}
            className={`mb-6 text-lg leading-relaxed line-height ${
              contentLang === "rtl" ? "text-right" : ""
            }`}
            style={{ whiteSpace: "pre-line" }}
          >
            {block.content}
          </p>
        );
      case "code":
        return (
          <div className="relative my-6 rounded-lg shadow-lg">
            <SyntaxHighlighter
              language={block.language}
              style={dracula}
              className="rounded-lg !p-4 !py-6"
            >
              {block.content}
            </SyntaxHighlighter>
            <CodeCopyButton code={block.content} />
            <div className="absolute top-2 left-3 text-xs text-gray-500 font-mono capitalize">
              {block.language}
            </div>
          </div>
        );
      case "image":
        return (
          <figure className="my-6 max-w-2xl mx-auto">
            <div 
              onClick={() => setActiveLightboxImg(block.url)}
              className="relative aspect-video rounded-xl overflow-hidden border border-slate-800 shadow-lg cursor-zoom-in group"
            >
              <Image
                src={block.url}
                alt={block.caption || "Image"}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                sizes="(max-width: 768px) 100vw, 42rem"
              />
            </div>
            {block.caption && (
              <figcaption className="text-center text-gray-400 mt-2 text-sm">
                {block.caption}
              </figcaption>
            )}
          </figure>
        );
      case "external-video": {
        const isEmbed = block.url && (block.url.includes("youtube.com") || block.url.includes("youtu.be") || block.url.includes("vimeo.com"));
        
        if (isEmbed) {
          return (
            <div className="my-8 rounded-lg shadow-lg overflow-hidden">
              <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
                <iframe
                  src={block.url}
                  title={block.caption || "Video"}
                  className="absolute top-0 left-0 w-full h-full"
                  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              {block.caption && (
                <figcaption className="text-center text-gray-400 mt-2 text-sm">
                  {block.caption}
                </figcaption>
              )}
            </div>
          );
        } else {
          return (
            <div className="my-8 rounded-xl border border-slate-800 overflow-hidden shadow-lg aspect-video bg-black max-w-2xl mx-auto">
              <video
                src={block.url}
                className="w-full h-full object-cover"
                controls
              />
              {block.caption && (
                <p className="text-center text-gray-400 mt-2 text-sm">
                  {block.caption}
                </p>
              )}
            </div>
          );
        }
      }
      case "banner":
        return (
          <div className="relative w-full h-64 md:h-96 my-8 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={block.url}
              alt={block.caption || "Banner"}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <h2 className="text-white text-2xl md:text-4xl font-bold">
                {block.caption}
              </h2>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen py-6 px-4 sm:px-6 lg:px-8 relative">
      {/* Back Button & Language Switcher */}
      <div 
        dir={contentLang}
        className="max-w-6xl mx-auto mb-6 flex justify-between items-center"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 cursor-pointer text-gray-600 dark:text-gray-400 hover:text-primary transition-colors rtl:flex-row-reverse"
        >
          <ArrowLeftIcon className="h-5 w-5 rtl:rotate-180" />
          <span>{currentPost.lang === 'ar' ? 'الرجوع' : 'Go Back'}</span>
        </button>

        <button
          onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
          className="px-4 py-2 rounded-full text-xs font-medium bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all duration-300 cursor-pointer backdrop-blur-md flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(34,211,238,0.15)]"
        >
          <FaGlobe className="text-xs text-slate-400" />
          <span>{lang === 'en' ? 'العربية' : 'English'}</span>
        </button>
      </div>

      <div 
        dir={contentLang}
        className="max-w-6xl mx-auto px-4 md:px-8 py-10 grid grid-cols-1 lg:grid-cols-4 gap-8 justify-center items-start"
      >
        {/* Sidebar - Table of Contents */}
        {headings.length > 0 && (
          <aside className={`lg:col-span-1 hidden lg:block sticky top-24 ${contentLang === 'rtl' ? 'pl-6' : 'pr-6'}`}>
            <h2 className={`text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-4 ${contentLang === 'rtl' ? 'text-right' : 'text-left'}`}>
              {currentPost.lang === 'ar' ? 'فهرس المحتوى' : 'Table of Contents'}
            </h2>
            <nav>
              <ul className="space-y-4">
                {headings.map((h: any, i: number) => {
                  const isActive = activeId === h.id.toString();
                  return (
                    <li key={i}>
                      <button
                        onClick={() => handleScrollToHeading(h.id.toString())}
                        className={`${contentLang === 'rtl' ? 'text-right' : 'text-left'} w-full transition-all duration-200 cursor-pointer text-sm ${
                          isActive
                            ? currentPost.lang === "ar"
                              ? "border-r-2 border-blue-500 pr-3 text-blue-500 font-medium"
                              : "border-l-2 border-blue-500 pl-3 text-blue-500 font-medium"
                            : currentPost.lang === "ar"
                              ? "border-r border-slate-800 pr-3 text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                              : "border-l border-slate-800 pl-3 text-gray-500 hover:text-gray-900 dark:hover:text-gray-300"
                        }`}
                      >
                        {h.content}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </aside>
        )}

        {/* Main Column - Article Content */}
        <div className={headings.length > 0 ? "lg:col-span-3 max-w-3xl w-full mx-auto space-y-8" : "lg:col-span-4 max-w-3xl w-full mx-auto space-y-8"}>
          {/* Category Badge */}
          <div className={`mb-2 ${contentLang === 'rtl' ? 'text-right' : 'text-left'}`}>
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full ${
                currentPost.category === "personal"
                  ? "bg-purple-950/60 text-purple-300 border border-purple-500/30"
                  : "bg-cyan-950/60 text-cyan-300 border border-cyan-500/30"
              }`}
            >
              {currentPost.category === "personal" ? <FaPenNib className="text-xs" /> : <FaLaptopCode className="text-xs" />}
              <span>
                {currentPost.category === "personal"
                  ? currentPost.lang === "ar"
                    ? "خواطر ومقالات شخصية"
                    : "Personal Notes"
                  : currentPost.lang === "ar"
                  ? "مقال تقني"
                  : "Technical Article"}
              </span>
            </span>
          </div>

          {/* Title */}
          <h1 className={`md:text-4xl text-2xl font-bold mb-2 text-primary leading-tight ${contentLang === 'rtl' ? 'text-right' : 'text-left'}`}>
            {currentPost.title}
          </h1>

          {/* Meta Info & Share Bar */}
          <div className="flex flex-col gap-4 border-b border-slate-800/80 pb-6 mb-6">
            <div className="text-sm text-gray-500 dark:text-gray-400 flex flex-wrap items-center gap-3 md:gap-4">
              <div className="flex items-center gap-1.5">
                <CalendarIcon className="h-4 w-4 text-blue-500" />
                <span>{currentPost.dateDiff || currentPost.date}</span>
              </div>
              <span className="text-slate-800">•</span>
              <div className="flex items-center gap-1.5">
                <ClockIcon className="h-4 w-4 text-blue-500" />
                <span>{currentPost.readTime}</span>
              </div>
              <span className="text-slate-800">•</span>
              <div className="flex items-center gap-1.5">
                <EyeIcon className="h-4 w-4 text-blue-500" />
                <span>{currentPost.stats?.views ?? 0} {currentPost.lang === 'ar' ? 'مشاهدة' : 'views'}</span>
              </div>
              <span className="text-slate-800">•</span>
              <button 
                onClick={handleLike}
                disabled={likeLoading}
                className="flex items-center gap-1.5 hover:text-red-500 transition-colors cursor-pointer group active:scale-95"
              >
                <HeartIcon className={`h-4 w-4 transition-all duration-200 group-hover:scale-110 ${isLiked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}`} />
                <span className={isLiked ? 'text-red-500 font-semibold' : ''}>
                  {likesCount} {currentPost.lang === 'ar' ? 'إعجاب' : 'likes'}
                </span>
              </button>
            </div>

            {/* Social Share Badges Bar */}
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mr-2 rtl:mr-0 rtl:ml-2">
                {currentPost.lang === 'ar' ? 'مشاركة:' : 'Share:'}
              </span>
              
              {/* Copy Link */}
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
              >
                {copiedLink ? (
                  <>
                    <CheckIcon className="h-3.5 w-3.5 text-green-500" />
                    <span className="text-green-500 font-semibold">{currentPost.lang === 'ar' ? 'تم النسخ!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <FaLink className="h-3 w-3" />
                    <span>{currentPost.lang === 'ar' ? 'نسخ الرابط' : 'Copy Link'}</span>
                  </>
                )}
              </button>

              {/* Twitter */}
              <button
                onClick={shareOnTwitter}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <FaTwitter className="h-3 w-3 text-[#1DA1F2]" />
                <span>Twitter</span>
              </button>

              {/* Facebook */}
              <button
                onClick={shareOnFacebook}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <FaFacebook className="h-3 w-3 text-[#1877F2]" />
                <span>Facebook</span>
              </button>

              {/* LinkedIn */}
              <button
                onClick={shareOnLinkedIn}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-900/60 border border-slate-800 hover:border-slate-700 text-gray-300 hover:text-white transition-all cursor-pointer active:scale-95"
              >
                <FaLinkedin className="h-3 w-3 text-[#0A66C2]" />
                <span>LinkedIn</span>
              </button>
            </div>
          </div>

          {/* Blog Content */}
          <div
            lang={currentPost.lang}
            dir={contentLang}
            className={`prose prose-invert lg:prose-xl max-w-4xl mx-auto px-4 space-y-8 transition-opacity duration-200 ${
              contentLang === 'rtl' ? 'text-right' : 'text-left'
            } ${
              loading ? "opacity-30 pointer-events-none" : "opacity-100"
            }`}
          >
            {currentPost.content &&
              currentPost.content.map((block, index) => (
                <React.Fragment key={index}>
                  {renderBlock(block, index)}
                </React.Fragment>
              ))}
          </div>
        </div>
      </div>

      {/* Lightbox Modal */}
      {activeLightboxImg && (
        <div 
          onClick={() => setActiveLightboxImg(null)}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center cursor-zoom-out"
        >
          <div className="relative max-w-[90vw] max-h-[90vh]">
            <img 
              src={activeLightboxImg} 
              alt="Enlarged view" 
              className="max-w-full max-h-[90vh] rounded-lg object-contain shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleBlogClient;
