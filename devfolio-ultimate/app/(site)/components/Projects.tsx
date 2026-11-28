'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaGithub, FaExternalLinkAlt, FaArrowRight } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, cardHoverSmall } from '@/utils/animations'
import { resolveImageUrl, getApiBaseUrl, isClientFetchAllowed } from '@/lib/utils'

const MAX_DESC_LENGTH = 120;

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  githubLink: string;
  demoLink: string;
}

const FALLBACK_PROJECTS: Project[] = [
  {
    id: 1,
    title: "Sirrush Software Solutions",
    description: "Enterprise software architecture and scalable backend services with Laravel and MySQL.",
    image: "/projects/e-commerce-website.png",
    technologies: ["PHP", "Laravel", "MySQL", "REST API"],
    githubLink: "https://github.com/khaled-hesham7",
    demoLink: "#",
  },
  {
    id: 2,
    title: "The Forge Portfolio System",
    description: "High-performance full-stack web application with Next.js 15, React 19, and Tailwind CSS.",
    image: "/projects/portfolio-website.jpg",
    technologies: ["Next.js", "TypeScript", "Tailwind", "Docker"],
    githubLink: "https://github.com/khaled-hesham7/My-Fullstack-Portfolio",
    demoLink: "https://khaled-the-forge.vercel.app",
  },
  {
    id: 3,
    title: "Task & Expense Management API",
    description: "Robust RESTful backend with token authentication, caching layer, and automated tests.",
    image: "/projects/task-manager.webp",
    technologies: ["Laravel", "Sanctum", "Redis", "PHPUnit"],
    githubLink: "https://github.com/khaled-hesham7",
    demoLink: "#",
  },
];

function ProjectCard({ project }: { project: Project }) {
  const isLong = (project.description || "").length > MAX_DESC_LENGTH;
  const displayedDesc =
    isLong
      ? project.description.slice(0, MAX_DESC_LENGTH).trimEnd() + "…"
      : project.description || "Production-ready software project showcasing full-stack capabilities.";

  return (
    <motion.article
      className="group relative flex flex-col justify-between rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-900/60 to-slate-950 border border-slate-800/80 hover:border-cyan-500/50 p-5 sm:p-6 shadow-xl hover:shadow-cyan-500/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1.5 h-full"
      variants={fadeInUp}
      {...cardHoverSmall}
    >
      {/* Subtle hover background sheen */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

      <div className="flex flex-col flex-1">
        {/* Project Thumbnail Image with Standardized 16/10 Ratio */}
        <Link
          href={`/projects/${project.id}`}
          className="block relative aspect-[16/10] w-full mb-4 rounded-xl overflow-hidden border border-slate-800/60 bg-slate-950/80 group-hover:border-cyan-500/30 transition-colors flex-shrink-0"
          aria-label={`View details for ${project.title}`}
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

        {/* Title: Standardized Height & Typography */}
        <h3 className="text-lg sm:text-xl font-bold text-white group-hover:text-cyan-300 transition-colors line-clamp-1 mb-2 h-7 flex items-center">
          <Link href={`/projects/${project.id}`} className="truncate">{project.title}</Link>
        </h3>

        {/* Description: Standardized 2-line 40px Box for Equal Card Height */}
        <p className="text-sm text-slate-300 leading-relaxed line-clamp-2 h-10 mb-4">
          {displayedDesc}
        </p>

        {/* Technologies Pills: Standardized 28px Height & Uniform Dimensions */}
        <div className="h-7 flex items-center flex-wrap gap-1.5 mb-5 overflow-hidden">
          {project.technologies && project.technologies.slice(0, 3).map((tech) => (
            <span
              key={tech}
              className="h-6 inline-flex items-center px-2.5 text-xs font-mono font-medium rounded-md bg-slate-800/80 text-slate-300 border border-slate-700/60"
            >
              {tech}
            </span>
          ))}
          {project.technologies && project.technologies.length > 3 && (
            <span className="h-6 inline-flex items-center px-2 text-xs font-mono font-semibold rounded-md bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              +{project.technologies.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* Card Footer Actions: Standardized Alignment & Icon Sizes */}
      <div className="border-t border-slate-800/80 pt-4 mt-auto flex items-center justify-between text-xs">
        <div className="flex items-center gap-3">
          {project.githubLink && project.githubLink !== "#" && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
              aria-label={`Source code for ${project.title}`}
            >
              <FaGithub className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Code</span>
            </a>
          )}
          {project.demoLink && project.demoLink !== "#" && (
            <a
              href={project.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-slate-300 hover:text-cyan-400 transition-colors"
              aria-label={`Live demo for ${project.title}`}
            >
              <FaExternalLinkAlt className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Live Demo</span>
            </a>
          )}
        </div>

        <Link
          href={`/projects/${project.id}`}
          className="inline-flex items-center gap-1 font-semibold text-cyan-400 hover:text-cyan-300 transition-colors group/link ml-auto"
          aria-label={`Project details for ${project.title}`}
        >
          <span>Details</span>
          <FaArrowRight className="text-[11px] group-hover/link:translate-x-0.5 transition-transform" aria-hidden="true" />
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

    if (!isClientFetchAllowed()) {
      setProjectsToRender(FALLBACK_PROJECTS);
      setIsLoading(false);
      return;
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
            setProjectsToRender(FALLBACK_PROJECTS);
          }
        } else {
          setProjectsToRender(FALLBACK_PROJECTS);
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to load projects dynamically:", err);
        }
        setProjectsToRender(FALLBACK_PROJECTS);
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
        <span className="text-sm font-medium">Loading Featured Projects...</span>
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
    <section className="py-20 sm:py-24 relative">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-14">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold uppercase tracking-wider mb-3"
            {...fadeInUp}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>Featured Creations</span>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight"
            {...fadeInUp}
            transition={{ delay: 0.1 }}
          >
            Selected <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">Projects</span>
          </motion.h2>

          <motion.p
            className="text-sm sm:text-base text-slate-300 mt-2.5 leading-relaxed"
            {...fadeInUp}
            transition={{ delay: 0.15 }}
          >
            Real-world systems, architectural backends, and full-stack software built for production.
          </motion.p>
        </div>

        {/* Dynamic Balanced Cards Grid with Standardized Equal Heights */}
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
            className="text-center mt-12 sm:mt-14"
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
