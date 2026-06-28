"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaGithub, FaExternalLinkAlt, FaArrowLeft, FaCalendarAlt, FaTag } from "react-icons/fa";
import { resolveImageUrl } from "@/lib/utils";
import { fadeInUp, fadeIn } from "@/utils/animations";

interface Project {
  id: number;
  title: string;
  description: string;
  github_link: string | null;
  demo_link: string | null;
  tags: string[];
  image_url: string;
  created_at: string;
}

export default function ProjectDetailClient({ project }: { project: Project }) {
  const imageUrl = resolveImageUrl(project.image_url, "/images/placeholder.jpg");
  const createdDate = new Date(project.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
      {/* Back button */}
      <div className="container max-w-5xl mx-auto px-4 pt-8">
        <motion.div {...fadeInUp}>
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-slate-400 hover:text-cyan-400 transition-colors text-sm font-medium group"
          >
            <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
            Back to Projects
          </Link>
        </motion.div>
      </div>

      {/* Hero image */}
      <div className="container max-w-5xl mx-auto px-4 mt-6">
        <motion.div
          className="relative w-full aspect-video rounded-2xl overflow-hidden border border-slate-800 shadow-2xl"
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={imageUrl}
            alt={project.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 1024px"
            priority
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
        </motion.div>
      </div>

      {/* Content */}
      <div className="container max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* Left — main content */}
          <div className="lg:col-span-2 space-y-8">

            {/* Title */}
            <motion.div {...fadeInUp}>
              <h1 className="text-3xl sm:text-4xl font-bold text-white/95 leading-tight mb-3">
                {project.title}
              </h1>
              <div className="flex items-center gap-2 text-slate-500 text-sm">
                <FaCalendarAlt />
                <span>{createdDate}</span>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm"
              {...fadeIn}
            >
              <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500 mb-4">
                About This Project
              </h2>
              <p className="text-slate-300 leading-relaxed text-base whitespace-pre-line">
                {project.description}
              </p>
            </motion.div>

            {/* Tags */}
            {project.tags && project.tags.length > 0 && (
              <motion.div {...fadeInUp}>
                <div className="flex items-center gap-2 mb-4">
                  <FaTag className="text-cyan-500 text-sm" />
                  <h2 className="text-xs font-bold uppercase tracking-widest text-cyan-500">
                    Technologies Used
                  </h2>
                </div>
                <div className="flex flex-wrap gap-2">
                  {project.tags.map((tag, i) => (
                    <motion.span
                      key={i}
                      className="px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 text-sm font-medium hover:border-cyan-500/50 hover:text-cyan-400 transition-all cursor-default"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right — sidebar links */}
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm sticky top-8">
              <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-5">
                Project Links
              </h2>
              <div className="space-y-3">

                {project.github_link && project.github_link !== "#" && (
                  <a
                    href={project.github_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white transition-all group"
                  >
                    <span className="w-9 h-9 rounded-lg bg-slate-900 flex items-center justify-center flex-shrink-0 group-hover:bg-slate-800 transition-colors">
                      <FaGithub className="text-lg" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Source Code</p>
                      <p className="text-xs text-slate-500">View on GitHub</p>
                    </div>
                  </a>
                )}

                {project.demo_link && project.demo_link !== "#" && (
                  <a
                    href={project.demo_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-500/10 hover:from-cyan-500/20 hover:to-blue-500/20 border border-cyan-500/30 hover:border-cyan-500/50 text-cyan-300 hover:text-cyan-200 transition-all group"
                  >
                    <span className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0 group-hover:bg-cyan-500/20 transition-colors">
                      <FaExternalLinkAlt className="text-sm" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold">Live Demo</p>
                      <p className="text-xs text-cyan-500/60">View live project</p>
                    </div>
                  </a>
                )}

                {(!project.github_link || project.github_link === "#") &&
                  (!project.demo_link || project.demo_link === "#") && (
                  <p className="text-slate-600 text-sm text-center py-4">
                    No links available
                  </p>
                )}
              </div>

              {/* Back to all projects */}
              <div className="mt-6 pt-5 border-t border-slate-800">
                <Link
                  href="/projects"
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:border-slate-600 transition-all text-sm font-medium group"
                >
                  <FaArrowLeft className="transition-transform group-hover:-translate-x-1 text-xs" />
                  All Projects
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
