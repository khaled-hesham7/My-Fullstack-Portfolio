"use client";

import Link from "next/link";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
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
  const rawArticles = data && (Array.isArray(data.Article) ? data.Article : data.Article?.data) || [];

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

  return (
    <section className="py-20">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.h2
          className="text-3xl font-bold mb-12 text-center"
          {...fadeInUp}
        >
          Latest Blog Posts
        </motion.h2>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {blogsToRender.map((blog: any) => (
            <motion.article
              key={blog.slug}
              className="bg-white dark:bg-dark dark:border dark:border-tag-border rounded-lg shadow-md overflow-hidden flex flex-col"
              variants={fadeInUp}
              {...cardHoverSmall}
            >
              {/* Feature Image */}
              <div className="relative h-48 w-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                <img
                  src={resolveImageUrl(blog.feature_image)}
                  alt={blog.title}
                  className="object-cover w-full h-full hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  <Link href={`/blog/${blog.slug}`}>
                    <motion.h3
                      className="text-xl font-semibold mb-2 hover:text-primary transition-colors line-clamp-2 min-h-[3rem]"
                      whileHover={{ x: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      {blog.title}
                    </motion.h3>
                  </Link>
                  <motion.p
                    className="text-gray-600 dark:text-description mb-4 line-clamp-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    {blog.excerpt}
                  </motion.p>
                </div>
                <motion.div
                  className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-4 border-t border-gray-100 dark:border-gray-800"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.span
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaCalendarAlt className="h-3.5 w-3.5" />
                    <span>{new Date(blog.date).toLocaleDateString()}</span>
                  </motion.span>
                  <motion.span
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <FaClock className="h-3.5 w-3.5" />
                    <span>{blog.readTime}</span>
                  </motion.span>
                  <motion.span
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>👁️</span>
                    <span>{blog.views || 0} views</span>
                  </motion.span>
                  <motion.span
                    className="flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                  >
                    <span>❤️</span>
                    <span>{blog.likes || 0} likes</span>
                  </motion.span>
                </motion.div>
              </div>
            </motion.article>
          ))}
        </motion.div>

        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              href="/blog"
              className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors"
            >
              View All Posts
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
