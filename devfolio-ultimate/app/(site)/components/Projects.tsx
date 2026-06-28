'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { FaGithub, FaExternalLinkAlt } from 'react-icons/fa'
import { motion } from 'framer-motion'
import { fadeInUp, staggerContainer, cardHoverSmall } from '@/utils/animations'
import { resolveImageUrl, getApiBaseUrl } from '@/lib/utils'

const MAX_DESC_LENGTH = 120;

interface ProjectData {
  id?: number;
  title: string;
  description: string;
  image_url: string;
  github_link: string;
  demo_link: string;
  tags: string[];
}

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
  const [expanded, setExpanded] = useState(false);

  const isLong = project.description?.length > MAX_DESC_LENGTH;
  const displayedDesc =
    isLong && !expanded
      ? project.description.slice(0, MAX_DESC_LENGTH).trimEnd() + "…"
      : project.description;

  return (
    <motion.article
      className="bg-white dark:bg-dark dark:border dark:border-tag-border rounded-lg shadow-md p-6 flex flex-col"
      variants={fadeInUp}
      {...cardHoverSmall}
    >
      {/* Project Image */}
      <Link href={`/projects/${project.id}`} className="block relative aspect-video mb-4 rounded-lg overflow-hidden flex-shrink-0">
        <motion.div
          className="w-full h-full relative"
          whileHover={{ scale: 1.05 }}
          transition={{ type: "spring", stiffness: 300 }}
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
      <motion.h3
        className="text-xl font-semibold mb-2 hover:text-cyan-400 transition-colors"
        whileHover={{ x: 5 }}
        transition={{ type: "spring", stiffness: 300 }}
      >
        <Link href={`/projects/${project.id}`}>{project.title}</Link>
      </motion.h3>

      {/* Description with Read More */}
      <div className="text-gray-600 dark:text-description mb-4 text-sm leading-relaxed">
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
        <motion.div
          className="flex flex-wrap gap-2 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {project.technologies.map((tech) => (
            <motion.span
              key={tech}
              className="px-3 py-1 bg-gray-100 dark:bg-dark text-gray-700 dark:text-gray-300 border border-transparent dark:border-tag-border rounded-full text-sm"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {tech}
            </motion.span>
          ))}
        </motion.div>
      )}

      {/* Links */}
      <motion.div
        className="flex items-center gap-4 mt-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        {project.githubLink && project.githubLink !== "#" && (
          <motion.a
            href={project.githubLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm"
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaGithub className="h-5 w-5" />
            <span>Code</span>
          </motion.a>
        )}
        {project.demoLink && project.demoLink !== "#" && (
          <motion.a
            href={project.demoLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-secondary hover:text-primary transition-colors text-sm"
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaExternalLinkAlt className="h-5 w-5" />
            <span>Live Demo</span>
          </motion.a>
        )}
        {isLong && (
          <Link
            href={`/projects/${project.id}`}
            className="ml-auto text-xs font-semibold text-cyan-500 hover:text-cyan-400 transition-colors"
          >
            View details →
          </Link>
        )}
      </motion.div>
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
        : initialData.Project?.data;
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
      } else {
        setProjectsToRender([]);
      }
      setIsLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        const apiBase = getApiBaseUrl();
        const response = await fetch(`${apiBase}/projects`);
        if (response.ok) {
          const payload = await response.json();
          if (payload.success && payload.data && Array.isArray(payload.data.data)) {
            const rawProjects = payload.data.data;
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
      <div className="flex justify-center items-center py-20 gap-2 text-gray-500 dark:text-gray-400">
        <span className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin"></span>
        <span>Loading Featured Projects...</span>
      </div>
    );
  }

  return (
    <section className="py-20">
      <div className="container max-w-7xl mx-auto px-4">
        <motion.h2 
          className="text-3xl font-bold mb-12 text-center"
          {...fadeInUp}
        >
          Featured Projects
        </motion.h2>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="initial"
          animate="animate"
        >
          {projectsToRender.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
              No projects found.
            </div>
          ) : (
            projectsToRender.map((project: Project) => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </motion.div>

        {projectsToRender.length > 0 && (
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/projects"
                className="inline-block bg-primary text-white px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors cursor-pointer"
              >
                View All Projects
              </Link>
            </motion.div>
          </motion.div>
        )}
      </div>
    </section>
  )
}