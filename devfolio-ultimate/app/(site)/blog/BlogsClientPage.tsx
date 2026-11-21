"use client";

import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaClock, FaEye, FaHeart, FaGlobe, FaLaptopCode, FaPenNib } from "react-icons/fa";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, cardHoverSmall } from "@/utils/animations";
import { useState, useEffect } from "react";
import { resolveImageUrl, getApiBaseUrl } from "@/lib/utils";

interface BlogsClientPageProps {
  articles: any[];
  category?: "technical" | "personal";
}

export default function BlogsClientPage({
  articles,
  category = "technical",
}: BlogsClientPageProps) {
  const [lang, setLang] = useState<"en" | "ar">("en");
  const [currentArticles, setCurrentArticles] = useState(articles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lang === "en") {
      setCurrentArticles(articles);
      return;
    }

    const fetchTranslation = async () => {
      setLoading(true);
      try {
        const apiBase = getApiBaseUrl();
        const res = await fetch(
          `${apiBase}/articles?per_page=12&category=${category}`,
          {
            headers: {
              "Accept-Language": lang,
            },
            cache: "no-store",
          }
        );
        if (res.ok) {
          const payload = await res.json();
          if (payload.success && payload.data) {
            setCurrentArticles(payload.data.data || []);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to fetch translation:", err);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchTranslation();
  }, [lang, articles, category]);

  const isPersonal = category === "personal";

  return (
    <>
      <div
        dir={lang === "ar" ? "rtl" : "ltr"}
        className="container max-w-7xl mx-auto py-12 px-4"
      >
        {/* Header with Title, Category Switcher Link, and Language Switcher */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-slate-800 pb-6 rtl:flex-row-reverse">
          <div>
            <motion.h1
              className="text-4xl font-bold flex items-center gap-3"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-2xl">{isPersonal ? <FaPenNib className="text-purple-400" /> : <FaLaptopCode className="text-cyan-400" />}</span>
              <span>
                {isPersonal
                  ? lang === "ar"
                    ? "خواطر وتجارب شخصية"
                    : "Personal Thoughts & Notes"
                  : lang === "ar"
                    ? "المقالات التقنية"
                    : "Technical Articles"}
              </span>
            </motion.h1>
            <motion.p
              className="text-secondary text-sm mt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              {isPersonal
                ? lang === "ar"
                  ? "أفكار، رحلتي وتجاربي الحياتية بعيداً عن الكود المباشر"
                  : "Life reflections, personal journey, and thoughts beyond code"
                : lang === "ar"
                  ? "شروحات برمجية، هندسة نظم، وحلول تقنية عملية"
                  : "Deep dives into architecture, web development & engineering"}
            </motion.p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end rtl:flex-row-reverse">
            {/* Navigation Button to the other section */}
            {isPersonal ? (
              <Link
                href="/blog"
                className="px-4 py-2 rounded-full text-xs font-semibold bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 hover:text-white hover:bg-cyan-900/60 hover:border-cyan-400 transition-all duration-300 backdrop-blur-md flex items-center gap-2 shadow-[0_4px_20px_rgba(34,211,238,0.15)] group"
              >
                <span className="rtl:rotate-180 group-hover:-translate-x-0.5 transition-transform">
                  ←
                </span>
                <FaLaptopCode />
                <span>
                  {lang === "ar" ? "المقالات التقنية" : "Technical Articles"}
                </span>
              </Link>
            ) : (
              <Link
                href="/blog/personal"
                className="px-4 py-2 rounded-full text-xs font-semibold bg-purple-950/40 border border-purple-500/40 text-purple-300 hover:text-white hover:bg-purple-900/60 hover:border-purple-400 transition-all duration-300 backdrop-blur-md flex items-center gap-2 shadow-[0_4px_20px_rgba(168,85,247,0.15)] group"
              >
                <FaPenNib />
                <span>
                  {lang === "ar" ? "خواطر شخصية" : "Personal Notes"}
                </span>
                <span className="rtl:rotate-180 group-hover:translate-x-0.5 transition-transform">
                  →
                </span>
              </Link>
            )}

            {/* Translation Switcher Toggle Button */}
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="px-4 py-2 rounded-full text-xs font-medium bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all duration-300 cursor-pointer backdrop-blur-md flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(34,211,238,0.15)]"
            >
              <FaGlobe className="text-xs text-slate-400" />
              <span>{lang === "en" ? "العربية" : "English"}</span>
            </button>
          </div>
        </div>

        {/* Empty state if no articles */}
        {currentArticles.length === 0 ? (
          <div className="py-24 text-center">
            <div className="text-4xl mb-4 flex justify-center text-slate-500">
              {isPersonal ? <FaPenNib className="text-purple-400" /> : <FaLaptopCode className="text-cyan-400" />}
            </div>
            <h2 className="text-2xl font-bold mb-3 text-slate-200">
              {isPersonal
                ? lang === "ar"
                  ? "لا توجد خواطر شخصية منشورة حالياً"
                  : "No personal articles published yet"
                : lang === "ar"
                  ? "لا توجد مقالات تقنية منشورة حالياً"
                  : "No technical articles published yet"}
            </h2>
            <p className="text-secondary text-sm max-w-md mx-auto mb-6">
              {isPersonal
                ? lang === "ar"
                  ? "المقالات والخواطر الشخصية قادمة قريباً. يمكنك تصفح المقالات التقنية حالياً."
                  : "Personal notes and stories are coming soon. Feel free to explore technical articles in the meantime."
                : lang === "ar"
                  ? "المقالات التقنية قيد الإعداد. تفقد الموقع لاحقاً!"
                  : "Technical articles are being prepared. Check back soon!"}
            </p>
            {isPersonal ? (
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-lg shadow-cyan-600/20"
              >
                <FaLaptopCode />
                <span>{lang === "ar" ? "تصفح المقالات التقنية" : "Browse Technical Articles"}</span>
              </Link>
            ) : (
              <Link
                href="/blog/personal"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-600/20"
              >
                <FaPenNib />
                <span>{lang === "ar" ? "تصفح الخواطر الشخصية" : "Browse Personal Notes"}</span>
              </Link>
            )}
          </div>
        ) : (
          <motion.div
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-200 ${loading ? "opacity-30 pointer-events-none" : "opacity-100"
              }`}
            variants={staggerContainer}
            initial="initial"
            animate="animate"
          >
            {currentArticles.map((art) => {
              const featureImage = resolveImageUrl(
                art.feature_image,
                "/images/placeholder.jpg"
              );
              const slug = art.id.toString();
              const isArtPersonal = art.category === "personal";

              return (
                <motion.article
                  key={art.id}
                  className="bg-white dark:bg-dark dark:border dark:border-tag-border rounded-lg shadow-md overflow-hidden flex flex-col relative group"
                  variants={fadeInUp}
                  {...cardHoverSmall}
                >
                  {/* Category Pill Tag over Feature Image */}
                  <div className="absolute top-3 left-3 rtl:left-auto rtl:right-3 z-10">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 text-[11px] font-semibold rounded-full backdrop-blur-md shadow-md ${isArtPersonal
                          ? "bg-purple-950/80 text-purple-200 border border-purple-500/40 shadow-purple-950/50"
                          : "bg-slate-950/80 text-cyan-300 border border-cyan-500/40 shadow-cyan-950/50"
                        }`}
                    >
                      {isArtPersonal ? <FaPenNib className="text-[10px]" /> : <FaLaptopCode className="text-[10px]" />}
                      <span>
                        {isArtPersonal
                          ? lang === "ar"
                            ? "شخصي"
                            : "Personal"
                          : lang === "ar"
                            ? "تقني"
                            : "Technical"}
                      </span>
                    </span>
                  </div>

                  {/* Feature Image */}
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                    <Image
                      src={featureImage}
                      alt={art.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <motion.h2
                        className="text-xl font-semibold mb-2 min-h-[3rem] line-clamp-2"
                        whileHover={{ x: 5 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <Link
                          href={`/blog/${slug}`}
                          className="hover:text-primary transition-colors"
                        >
                          {art.title}
                        </Link>
                      </motion.h2>

                      <motion.p
                        className="text-secondary mb-4 line-clamp-3"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        {art.excerpt}
                      </motion.p>
                    </div>

                    <motion.div
                      className="flex flex-wrap items-center gap-4 text-xs text-secondary pt-4 border-t border-gray-100 dark:border-gray-800"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <motion.div
                        className="flex items-center gap-1 text-slate-400"
                        whileHover={{ scale: 1.05 }}
                      >
                        <FaCalendarAlt className="h-3.5 w-3.5" />
                        <span>
                          {art.date?.raw
                            ? new Date(art.date.raw).toLocaleDateString()
                            : new Date().toLocaleDateString()}
                        </span>
                      </motion.div>

                      <motion.div
                        className="flex items-center gap-1 text-slate-400"
                        whileHover={{ scale: 1.05 }}
                      >
                        <FaClock className="h-3.5 w-3.5" />
                        <span>5 min read</span>
                      </motion.div>

                      <motion.div
                        className="flex items-center gap-1 text-slate-400"
                        whileHover={{ scale: 1.05 }}
                      >
                        <FaEye className="h-3.5 w-3.5 text-slate-400" />
                        <span>
                          {art.stats?.views || 0}{" "}
                          {lang === "ar" ? "مشاهدة" : "views"}
                        </span>
                      </motion.div>

                      <motion.div
                        className="flex items-center gap-1 text-slate-400"
                        whileHover={{ scale: 1.05 }}
                      >
                        <FaHeart className="h-3.5 w-3.5 text-rose-500" />
                        <span>
                          {art.stats?.likes || 0}{" "}
                          {lang === "ar" ? "إعجاب" : "likes"}
                        </span>
                      </motion.div>
                    </motion.div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>
    </>
  );
}
