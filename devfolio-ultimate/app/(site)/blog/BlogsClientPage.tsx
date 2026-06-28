"use client";

import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, cardHoverSmall } from "@/utils/animations";
import { useState, useEffect } from "react";
import { resolveImageUrl, getApiBaseUrl } from "@/lib/utils";

interface BlogsClientPageProps {
  articles: any[];
}

export default function BlogsClientPage({ articles }: BlogsClientPageProps) {
  const [lang, setLang] = useState<'en' | 'ar'>('en');
  const [currentArticles, setCurrentArticles] = useState(articles);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (lang === 'en') {
      setCurrentArticles(articles);
      return;
    }

    const fetchTranslation = async () => {
      setLoading(true);
      try {
        const apiBase = getApiBaseUrl();
        const res = await fetch(`${apiBase}/articles?per_page=12`, {
          headers: {
            "Accept-Language": lang,
          },
          cache: "no-store",
        });
        if (res.ok) {
          const payload = await res.json();
          if (payload.success && payload.data) {
            setCurrentArticles(payload.data.data || []);
          }
        }
      } catch (err) {
        console.error("Failed to fetch translation:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTranslation();
  }, [lang, articles]);

  if (articles.length === 0) {
    return (
      <div className="container max-w-7xl mx-auto py-24 text-center">
        <h1 className="text-3xl font-bold mb-4">Blog Posts</h1>
        <p className="text-secondary text-lg">No articles published yet. Check back soon!</p>
      </div>
    );
  }

  return (
    <>
      <div 
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        className="container max-w-7xl mx-auto py-12 px-4"
      >
        <div className="flex justify-between items-center mb-12 border-b border-slate-800 pb-6 rtl:flex-row-reverse">
          <motion.h1
            className="text-4xl font-bold"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {lang === 'ar' ? 'المقالات' : 'Blog Posts'}
          </motion.h1>

          {/* Translation Switcher Toggle Button */}
          <button
            onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}
            className="px-4 py-2 rounded-full text-xs font-medium bg-slate-900/60 border border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all duration-300 cursor-pointer backdrop-blur-md flex items-center gap-2 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_4px_20px_rgba(34,211,238,0.15)]"
          >
            <span className="text-sm">🌐</span>
            <span>{lang === 'en' ? 'العربية' : 'English'}</span>
          </button>
        </div>

        <motion.div
          className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 transition-opacity duration-200 ${
            loading ? "opacity-30 pointer-events-none" : "opacity-100"
          }`}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {currentArticles.map((art) => {
            const featureImage = resolveImageUrl(art.feature_image, "/images/placeholder.jpg");
            const slug = art.id.toString();

            return (
              <motion.article
                key={art.id}
                className="bg-white dark:bg-dark dark:border dark:border-tag-border rounded-lg shadow-md overflow-hidden flex flex-col"
                variants={fadeInUp}
                {...cardHoverSmall}
              >
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
                        {art.date?.raw ? new Date(art.date.raw).toLocaleDateString() : new Date().toLocaleDateString()}
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
                      <span>👁️</span>
                      <span>{art.stats?.views || 0} {lang === 'ar' ? 'مشاهدة' : 'views'}</span>
                    </motion.div>

                    <motion.div
                      className="flex items-center gap-1 text-slate-400"
                      whileHover={{ scale: 1.05 }}
                    >
                      <span>❤️</span>
                      <span>{art.stats?.likes || 0} {lang === 'ar' ? 'إعجاب' : 'likes'}</span>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      </div>
    </>
  );
}
