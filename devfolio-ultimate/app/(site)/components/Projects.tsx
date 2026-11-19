'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaGithub, FaExternalLinkAlt, FaArrowRight, FaCode } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, cardHoverSmall } from '@/utils/animations'
import { resolveImageUrl, getApiBaseUrl } from '@/lib/utils'

const MAX_DESC_LENGTH = 110;

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  githubLink: string;
  demoLink: string;
}

function ProjectCard({ project }: { project: Project }) {
  const isLong = (project.description || "").length > MAX_DESC_LENGTH;
  const displayedDesc =
    isLong
      ? project.description.slice(0, MAX_DESC_LENGTH).trimEnd() + "…"
      : project.description || "Production-ready software project showcasing full-stack capabilities.";

  return (
    <motion.article
      className="group relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 hover:border-cyan-500/50 p-5 shadow-xl hover:shadow-cyan-500/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 h-full"
      variants={fadeInUp}
      {...cardHoverSmall}
    >
      {/* Subtle hover background sheen */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div>
        {/* Project Thumbnail Image */}
        <Link
          href={`/projects/${project.id}`}
          className="block relative aspect-video mb-4 rounded-xl overflow-hidden border border-slate-800/60 bg-slate-950/80 group-hover:border-cyan-500/30 transition-colors"
        >
          <motion.div
            className="w-full h-full relative"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.4 }}
          >
            <Image
              src={project.image}
              alt={project.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </motion.div>
        </Link>

        {/* Title */}
        <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-2">
          <Link href={`/projects/${project.id}`}>{project.title}</Link>
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 min-h-[2.5rem] mb-4">
          {displayedDesc}
        </p>

        {/* Technologies Pills */}
        {project.technologies && project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {project.technologies.slice(0, 3).map((tech) => (
              <span
                key={tech}
                className="px-2.5 py-0.5 text-[11px] font-medium rounded-lg bg-slate-800/80 text-slate-300 border border-slate-700/60"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 3 && (
              <span className="px-2 py-0.5 text-[10px] font-semibold rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                +{project.technologies.length - 3}
              </span>
            )}
          </div>
        )}
      </div>

      {/* Card Footer Actions */}
      <div className="border-t border-slate-800/80 pt-3.5 mt-auto flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {project.githubLink && project.githubLink !== "#" && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors"
            >
              <FaGithub className="h-4 w-4" />
              <span>Code</span>
            </a>
          )}
          {project.demoLink && project.demoLink !== "#" && (
            <a
              href={project.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-cyan-400 transition-colors"
            >
              <FaExternalLinkAlt className="h-3 w-3" />
              <span>Live Demo</span>
            </a>
          )}
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group/link"
        >
          <span>Details</span>
          <FaArrowRight className="text-[10px] group-hover/link:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </motion.article>
  );
}

export default function Projects({ data: initialData }: { data?: any }) {
  const [projectsToRender, setProjectsToRender] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (initialData) {
      const rawProjects = Array.isArray(initialData.Project) 
        ? initialData.Project 
        : Array.isArray(initialData.projects)
        ? initialData.projects
        : initialData.Project?.data || initialData.projects?.data;

      if (rawProjects && rawProjects.length > 0) {
        setProjectsToRender(rawProjects.slice(0, 3).map((p: any, index: number) => ({
          id: p.id || index + 1,
          title: p.title,
          description: p.description,
          image: resolveImageUrl(p.image_url, "/images/placeholder.jpg"),
          technologies: p.tags || [],
          githubLink: p.github_link || "#",
          demoLink: p.demo_link || "#",
        })));
        setIsLoading(false);
        return;
      }
    }

    const fetchProjects = async () => {
      try {
        const apiBase = getApiBaseUrl();
        const response = await fetch(`${apiBase}/projects`);
        if (response.ok) {
          const payload = await response.json();
          const rawProjects = Array.isArray(payload.data)
            ? payload.data
            : Array.isArray(payload.data?.data)
            ? payload.data.data
            : [];
          if (rawProjects.length > 0) {
            const mapped = rawProjects.slice(0, 3).map((p: any, index: number) => ({
              id: p.id || index + 1,
              title: p.title,
              description: p.description,
              image: resolveImageUrl(p.image_url, "/images/placeholder.jpg"),
              technologies: p.tags || [],
              githubLink: p.github_link || "#",
              demoLink: p.demo_link || "#",
            }));
            setProjectsToRender(mapped);
          } else {
            setProjectsToRender([]);
          }
        }
      } catch (err) {
        console.error("Failed to load projects dynamically:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [initialData]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20 gap-2 text-slate-400">
        <span className="w-5 h-5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin"></span>
        <span className="text-sm">Loading Featured Projects...</span>
      </div>
    );
  }

  // Grid layout adapts perfectly based on project count
  const gridLayoutClass =
    projectsToRender.length === 1
      ? "grid grid-cols-1 max-w-md mx-auto"
      : projectsToRender.length === 2
      ? "grid grid-cols-1 md:grid-cols-2 max-w-4xl mx-auto"
      : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto";

  return (
    <section className="py-24 relative">
      <div className="container max-w-7xl mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-bold uppercase tracking-widest mb-3"
            {...fadeInUp}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Featured Creations</span>
          </motion.div>

          <motion.h2
            className="text-3xl md:text-4xl font-extrabold text-white tracking-tight"
            {...fadeInUp}
            transition={{ delay: 0.1 }}
          >
            Selected <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Projects</span>
          </motion.h2>

          <motion.p
            className="text-sm text-slate-400 mt-2.5 leading-relaxed"
            {...fadeInUp}
            transition={{ delay: 0.15 }}
          >
            Real-world systems, architectural backends, and full-stack software built for production.
          </motion.p>
        </div>

        {/* Dynamic Balanced Cards Grid */}
        <motion.div 
          className={`${gridLayoutClass} gap-6 sm:gap-8 items-stretch`}
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {projectsToRender.length === 0 ? (
            <div className="col-span-full text-center py-12 text-slate-400">
              No projects found.
            </div>
          ) : (
            projectsToRender.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </motion.div>

        {/* Modern Action Button */}
        {projectsToRender.length > 0 && (
          <motion.div
            className="text-center mt-14"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link
              href="/projects"
              className="group inline-flex items-center gap-3 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-indigo-500/10 hover:from-cyan-500/20 hover:to-indigo-500/20 border border-cyan-500/30 hover:border-cyan-400 text-white font-semibold text-sm shadow-[0_0_25px_rgba(6,182,212,0.12)] hover:shadow-[0_0_35px_rgba(6,182,212,0.22)] transition-all duration-300 hover:-translate-y-0.5 cursor-pointer backdrop-blur-md"
            >
              <span>Explore All Projects</span>
              <FaArrowRight className="text-xs text-cyan-400 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        )}
      </div>
    </section>
  )
}
