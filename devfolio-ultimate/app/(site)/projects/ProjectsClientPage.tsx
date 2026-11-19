"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaGithub, FaExternalLinkAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, cardHoverSmall } from "@/utils/animations";
import { resolveImageUrl, getApiBaseUrl } from "@/lib/utils";

const MAX_DESC_LENGTH = 120; // characters before "Read More" appears

interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  technologies: string[];
  githubLink: string;
  demoLink: string;
}

// ─── Single project card (module-level to avoid focus/remount bugs) ───────────
function ProjectCard({ project }: { project: Project }) {
  const [expanded, setExpanded] = useState(false);

  const isLong = project.description?.length > MAX_DESC_LENGTH;
  const displayedDesc =
    isLong && !expanded
      ? project.description.slice(0, MAX_DESC_LENGTH).trimEnd() + "…"
      : project.description;

  return (
    <motion.div
      className="bg-white dark:bg-dark dark:border dark:border-tag-border rounded-lg shadow-md overflow-hidden flex flex-col"
      variants={fadeInUp}
      {...cardHoverSmall}
    >
      {/* Project image */}
      <Link href={`/projects/${project.id}`} className="block flex-shrink-0">
        <motion.div
          className="aspect-video bg-gray-200 dark:bg-gray-800 relative overflow-hidden"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Image
            src={project.image}
            alt={project.title}
            fill
            className="object-cover w-full h-full"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </motion.div>
      </Link>

      <div className="p-6 flex flex-col flex-1">
        {/* Title */}
        <motion.h3
          className="text-xl font-semibold mb-2 hover:text-cyan-400 transition-colors"
          whileHover={{ x: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <Link href={`/projects/${project.id}`}>{project.title}</Link>
        </motion.h3>

        {/* Description with Read More */}
        <div className="text-secondary mb-4 text-sm leading-relaxed">
          <span>{displayedDesc}</span>
          {isLong && (
            <button
              onClick={(e) => {
                e.preventDefault();
                setExpanded((v) => !v);
              }}
              className="ml-1 text-cyan-500 hover:text-cyan-400 font-semibold text-xs whitespace-nowrap transition-colors"
            >
              {expanded ? " Show less" : " Read more"}
            </button>
          )}
        </div>

        {/* Tags */}
        {project.technologies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {project.technologies.map((tech, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-gray-100 dark:bg-dark text-gray-700 dark:text-gray-300 border border-transparent dark:border-tag-border rounded-full text-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        <div className="flex items-center gap-4 mt-auto">
          {project.githubLink && project.githubLink !== "#" && (
            <a
              href={project.githubLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm"
            >
              <FaGithub className="h-5 w-5" />
              <span>Code</span>
            </a>
          )}
          {project.demoLink && project.demoLink !== "#" && (
            <a
              href={project.demoLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm"
            >
              <FaExternalLinkAlt className="h-4 w-4" />
              <span>Live Demo</span>
            </a>
          )}
          {isLong && (
            <Link
              href={`/projects/${project.id}`}
              className="ml-auto text-xs font-semibold text-cyan-500 hover:text-cyan-400 transition-colors"
            >
              View details →
            </Link>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ProjectsClientPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const apiBase = getApiBaseUrl();
        const response = await fetch(`${apiBase}/projects`);
        if (response.ok) {
          const payload = await response.json();
          const items = Array.isArray(payload.data)
            ? payload.data
            : Array.isArray(payload.data?.data)
            ? payload.data.data
            : [];
          if (items.length > 0) {
            const mapped = items.map((p: any) => ({
              id: p.id,
              title: p.title || "Untitled",
              description: p.description || "",
              image: resolveImageUrl(p.image_url, "/images/placeholder.jpg"),
              technologies: p.tags || [],
              githubLink: p.github_link || "#",
              demoLink: p.demo_link || "#",
            }));
            setProjects(mapped);
          } else {
            setProjects([]);
          }
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProjects();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24 gap-2 text-gray-500 dark:text-gray-400">
        <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        <span>Loading Projects...</span>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <motion.h1
        className="text-4xl font-bold mb-4 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        My Projects
      </motion.h1>
      <motion.p
        className="text-lg text-secondary mb-16 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Here are some of my recent projects. Click on any card to explore the
        full details.
      </motion.p>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        variants={staggerContainer}
        initial="initial"
        animate="animate"
      >
        {projects.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
            No projects found. Please check back later!
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        )}
      </motion.div>
    </div>
  );
}
