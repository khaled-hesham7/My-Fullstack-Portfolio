"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { FaCalendarAlt, FaClock, FaEye, FaHeart, FaArrowRight } from "react-icons/fa";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, cardHoverSmall } from "@/utils/animations";
import { resolveImageUrl } from "@/lib/utils";

interface ArticleData {
  id: number;
  title: string;
  excerpt: string;
  feature_image: string | null;
  date?: {
    raw?: string;
  };
  stats?: {
    views: number;
    likes: number;
  };
}

export default function Blogs({ data }: { data: any }) {
  const rawArticles =
    (data &&
      (Array.isArray(data.Article)
        ? data.Article
        : Array.isArray(data.articles)
        ? data.articles
        : data.Article?.data || data.articles?.data)) ||
    [];

  if (rawArticles.length === 0) {
    return null;
  }

  const blogsToRender = rawArticles.slice(0, 3).map((art: ArticleData) => {
    return {
      title: art.title,
      excerpt: art.excerpt,
      date: art.date?.raw || new Date().toISOString(),
      readTime: "5 min read",
      slug: art.id.toString(),
      feature_image: resolveImageUrl(art.feature_image, "/images/placeholder.jpg"),
      views: art.stats?.views || 0,
      likes: art.stats?.likes || 0,
    };
  });

  // Grid layout adapts perfectly based on article count
  const gridLayoutClass =
    blogsToRender.length === 1
      ? "grid grid-cols-1 max-w-md mx-auto"
      : blogsToRender.length === 2
      ? "grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto";

  return (
    <section className="py-20 sm:py-24 relative">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-sky-400 text-xs font-semibold uppercase tracking-wider mb-3"
            {...fadeInUp}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse" />
            <span>Articles & Insights</span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
            {...fadeInUp}
            transition={{ delay: 0.1 }}
          >
            Latest <span className="bg-gradient-to-r from-sky-400 via-primary to-indigo-400 bg-clip-text text-transparent">Blog Posts</span>
          </motion.h2>

          <motion.p
            className="text-sm sm:text-base text-slate-300 mt-2.5 leading-relaxed"
            {...fadeInUp}
            transition={{ delay: 0.15 }}
          >
            Deep technical articles, software architecture practices, and developer guides.
          </motion.p>
        </div>

        {/* Dynamic Balanced Cards Grid with Standardized Equal Heights */}
        <motion.div
          className={`${gridLayoutClass} gap-6 sm:gap-8 items-stretch`}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {blogsToRender.map((blog: any) => (
            <motion.article
              key={blog.slug}
              className="group relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 hover:border-primary/50 overflow-hidden shadow-xl hover:shadow-[0_0_30px_rgba(78,128,247,0.12)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 h-full"
              variants={fadeInUp}
              {...cardHoverSmall}
            >
              {/* Subtle hover background sheen */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

              <div className="flex flex-col flex-1">
                {/* Feature Image with Standardized 16/10 Ratio */}
                <Link
                  href={`/blog/${blog.slug}`}
                  className="block relative aspect-[16/10] w-full overflow-hidden bg-slate-950/80 border-b border-slate-800/60 flex-shrink-0"
                  aria-label={`Read article: ${blog.title}`}
                >
                  <Image
                    src={resolveImageUrl(blog.feature_image)}
                    alt={blog.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </Link>

                <div className="p-5 sm:p-6 flex flex-col flex-1">
                  {/* Title: Standardized Height & Typography */}
                  <Link href={`/blog/${blog.slug}`} aria-label={`Read article: ${blog.title}`}>
                    <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-sky-300 transition-colors line-clamp-2 h-14 flex items-center mb-2 leading-snug">
                      {blog.title}
                    </h3>
                  </Link>

                  {/* Excerpt: Standardized 2-line 40px Box */}
                  <p className="text-sm text-slate-300 leading-relaxed line-clamp-2 h-10 mb-4">
                    {blog.excerpt}
                  </p>
                </div>
              </div>

              {/* Card Footer Metadata: Standardized Typography & 14px Icons */}
              <div className="px-5 sm:px-6 pb-5 pt-3.5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-300 gap-2 mt-auto">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1.5">
                    <FaCalendarAlt className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                    <span>{new Date(blog.date).toLocaleDateString()}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <FaClock className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span>{blog.readTime}</span>
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <span className="flex items-center gap-1">
                    <FaEye className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                    <span>{blog.views}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <FaHeart className="h-3.5 w-3.5 text-rose-500" aria-hidden="true" />
                    <span>{blog.likes}</span>
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        {/* Modern Action Button - Theme Aligned */}
        <motion.div
          className="text-center mt-12 sm:mt-14"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            href="/blog"
            className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary/15 via-blue-600/15 to-indigo-600/15 hover:from-primary/25 hover:to-indigo-600/25 border border-primary/30 hover:border-sky-400 text-white font-semibold text-sm shadow-[0_0_25px_rgba(78,128,247,0.15)] hover:shadow-[0_0_35px_rgba(78,128,247,0.28)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer backdrop-blur-md"
          >
            <span>Read All Articles</span>
            <FaArrowRight className="text-xs text-sky-400 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
