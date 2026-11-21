// app/about/AboutClient.tsx
"use client";

import { useState, useMemo } from "react";
import { FaFilePdf, FaCode, FaDownload } from "react-icons/fa";
import { getSkillIcon } from "@/lib/skillIcons";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  fadeInUp,
  fadeInDown,
  fadeIn,
  staggerContainer,
  cardHover,
  cardHoverSmall,
} from "@/utils/animations";
import { resolveImageUrl } from "@/lib/utils";

interface SkillGroup {
  id: number;
  title: string;
  icon: string;
  skills: string[];
}

interface Experience {
  id: number;
  type?: string | null;
  job_title: string;
  company: string;
  location: string;
  duration: string;
  tasks: string[];
}

interface Education {
  id: number;
  type?: string | null;
  degree: string;
  university?: string | null;
  location?: string | null;
  duration?: string | null;
  grade?: string | null;
  description?: string | null;
}

interface CvItem {
  id: number;
  title: string;
  file_url: string;
}

interface AboutData {
  about: {
    id: number;
    title: string;
    description: string;
    image_url: string;
    cv_url: string;
    general_cv_url?: string | null;
    backend_cv_url?: string | null;
    qa_cv_url?: string | null;
    updated_at: string;
  } | null;
  skills: SkillGroup[];
  experience: Experience[];
  education: Education[];
  cvs?: CvItem[];
}

const fallbackData: AboutData = {
  about: null,
  skills: [],
  experience: [],
  education: [],
  cvs: []
};

const cvColorThemes = [
  { border: "hover:border-emerald-500/50", bg: "bg-emerald-500/10", text: "text-emerald-400", hoverBg: "group-hover:bg-emerald-500/20" },
  { border: "hover:border-cyan-500/50", bg: "bg-cyan-500/10", text: "text-cyan-400", hoverBg: "group-hover:bg-cyan-500/20" },
  { border: "hover:border-purple-500/50", bg: "bg-purple-500/10", text: "text-purple-400", hoverBg: "group-hover:bg-purple-500/20" },
  { border: "hover:border-rose-500/50", bg: "bg-rose-500/10", text: "text-rose-400", hoverBg: "group-hover:bg-rose-500/20" },
  { border: "hover:border-amber-500/50", bg: "bg-amber-500/10", text: "text-amber-400", hoverBg: "group-hover:bg-amber-500/20" },
];

const IconComponent = (iconName: string) => {
  const Icon = getSkillIcon(iconName);
  return <Icon className="h-8 w-8 text-primary mb-4" />;
};

export default function AboutClient({ data }: { data: AboutData | null }) {
  const resolvedData = data || fallbackData;
  const [expFilter, setExpFilter] = useState<"all" | "job" | "internship">("all");

  const hasInternships = useMemo(() => {
    return resolvedData.experience?.some((e) => (e.type || "").toLowerCase() === "internship");
  }, [resolvedData.experience]);

  const filteredExperiences = useMemo(() => {
    if (!resolvedData.experience) return [];
    if (expFilter === "job") {
      return resolvedData.experience.filter((e) => (e.type || "Job").toLowerCase() !== "internship");
    }
    if (expFilter === "internship") {
      return resolvedData.experience.filter((e) => (e.type || "").toLowerCase() === "internship");
    }
    return resolvedData.experience;
  }, [resolvedData.experience, expFilter]);

  return (
    <div className="container max-w-7xl mx-auto py-12 px-4">
      <motion.h1
        className="text-4xl font-bold mb-8 text-center"
        {...fadeInDown}
      >
        About Me
      </motion.h1>

      {/* Bio Section */}
      {resolvedData.about && (
        <motion.section className="mb-16 flex flex-col items-center gap-6" {...fadeInUp}>
          {resolvedData.about.image_url && (
            <div className="relative rounded-full w-36 h-36 p-[2px] overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(78,128,247,0.4)] bg-transparent">
              <div
                className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-gradient-to-r from-primary via-blue-500 to-transparent animate-spin"
                style={{ animationDuration: "4s" }}
              />
              <div className="w-full h-full rounded-full bg-deep-dark overflow-hidden relative z-10">
                <Image
                  src={resolveImageUrl(resolvedData.about.image_url)}
                  alt="Profile"
                  width={144}
                  height={144}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          )}
          <p className="text-lg text-secondary max-w-3xl mx-auto text-center leading-relaxed">
            Seeking a challenging career in{" "}
            <span className="font-semibold text-cyan-400">
              {resolvedData.about.title || "Software Engineering"}
            </span>
            , {resolvedData.about.description}
          </p>

          {/* Dynamic CV Downloads Showcase */}
          {((resolvedData.cvs && resolvedData.cvs.length > 0) || resolvedData.about) && (
            <div className="mt-10 pt-8 border-t border-slate-800/60 max-w-4xl mx-auto w-full">
              {/* Header Label */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <span className="h-px w-10 sm:w-16 bg-gradient-to-r from-transparent to-cyan-500/40" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <FaFilePdf className="text-cyan-400 text-xs" />
                  Curriculum Vitae / Official Resumes
                </span>
                <span className="h-px w-10 sm:w-16 bg-gradient-to-l from-transparent to-cyan-500/40" />
              </div>

              {/* Cards Container */}
              <div className="flex flex-wrap items-center justify-center gap-4">
                {resolvedData.cvs && resolvedData.cvs.length > 0 ? (
                  resolvedData.cvs.map((cvItem, index) => {
                    const theme = cvColorThemes[index % cvColorThemes.length];
                    return (
                      <a
                        key={cvItem.id}
                        href={resolveImageUrl(cvItem.file_url)}
                        target="_blank"
                        download
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-500/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 min-w-[260px] max-w-sm flex-1"
                      >
                        {/* Hover glow sheen */}
                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/5 via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

                        <div className="flex items-center gap-3.5 relative z-10 min-w-0">
                          {/* PDF Icon Badge */}
                          <div className={`w-11 h-11 rounded-xl ${theme.bg} ${theme.text} border border-white/10 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-all shadow-inner`}>
                            <FaFilePdf />
                          </div>

                          {/* Title & Info */}
                          <div className="text-left min-w-0">
                            <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                              {cvItem.title}
                            </h4>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Verified PDF</span>
                            </p>
                          </div>
                        </div>

                        {/* Download Icon */}
                        <div className="w-9 h-9 rounded-xl bg-slate-800/80 group-hover:bg-cyan-500 text-slate-400 group-hover:text-slate-950 flex items-center justify-center text-xs transition-all duration-300 group-hover:translate-y-0.5 shrink-0 ml-3 shadow-md relative z-10">
                          <FaDownload />
                        </div>
                      </a>
                    );
                  })
                ) : (
                  <>
                    {resolvedData.about?.general_cv_url && resolvedData.about.general_cv_url !== "" && (
                      <a
                        href={resolveImageUrl(resolvedData.about.general_cv_url)}
                        target="_blank"
                        download
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 hover:border-red-500/50 shadow-lg hover:shadow-red-500/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 min-w-[260px] max-w-sm flex-1"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-all">
                            <FaFilePdf />
                          </div>
                          <div className="text-left min-w-0">
                            <h4 className="text-sm font-bold text-white group-hover:text-red-300 transition-colors truncate">
                              General CV
                            </h4>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Fullstack Profile</span>
                            </p>
                          </div>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-slate-800/80 group-hover:bg-red-500 text-slate-400 group-hover:text-white flex items-center justify-center text-xs transition-all duration-300 group-hover:translate-y-0.5 shrink-0 ml-3 shadow-md">
                          <FaDownload />
                        </div>
                      </a>
                    )}

                    {resolvedData.about?.backend_cv_url && resolvedData.about.backend_cv_url !== "" && (
                      <a
                        href={resolveImageUrl(resolvedData.about.backend_cv_url)}
                        target="_blank"
                        download
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 hover:border-emerald-500/50 shadow-lg hover:shadow-emerald-500/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 min-w-[260px] max-w-sm flex-1"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-all">
                            <FaFilePdf />
                          </div>
                          <div className="text-left min-w-0">
                            <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors truncate">
                              Backend Developer CV
                            </h4>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>Backend Track</span>
                            </p>
                          </div>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-slate-800/80 group-hover:bg-emerald-500 text-slate-400 group-hover:text-white flex items-center justify-center text-xs transition-all duration-300 group-hover:translate-y-0.5 shrink-0 ml-3 shadow-md">
                          <FaDownload />
                        </div>
                      </a>
                    )}

                    {resolvedData.about?.qa_cv_url && resolvedData.about.qa_cv_url !== "" && (
                      <a
                        href={resolveImageUrl(resolvedData.about.qa_cv_url)}
                        target="_blank"
                        download
                        rel="noopener noreferrer"
                        className="group relative flex items-center justify-between p-3.5 sm:p-4 rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-slate-800/80 hover:border-cyan-500/50 shadow-lg hover:shadow-cyan-500/10 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 min-w-[260px] max-w-sm flex-1"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <div className="w-11 h-11 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center text-lg shrink-0 group-hover:scale-105 transition-all">
                            <FaFilePdf />
                          </div>
                          <div className="text-left min-w-0">
                            <h4 className="text-sm font-bold text-white group-hover:text-cyan-300 transition-colors truncate">
                              QA Engineer CV
                            </h4>
                            <p className="text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              <span>QA Track</span>
                            </p>
                          </div>
                        </div>
                        <div className="w-9 h-9 rounded-xl bg-slate-800/80 group-hover:bg-cyan-500 text-slate-400 group-hover:text-slate-950 flex items-center justify-center text-xs transition-all duration-300 group-hover:translate-y-0.5 shrink-0 ml-3 shadow-md">
                          <FaDownload />
                        </div>
                      </a>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </motion.section>
      )}

      {/* Skills Section */}
      {resolvedData.skills && resolvedData.skills.length > 0 && (
        <motion.section className="mb-16" {...fadeIn} transition={{ delay: 0.2 }}>
          <motion.h2 className="section-title text-center text-3xl font-bold mb-8" {...fadeInUp}>
            Skills
          </motion.h2>
          <motion.div
            className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {resolvedData.skills.map((skillGroup) => (
              <motion.div
                key={skillGroup.id}
                className="bg-white dark:bg-dark/50 p-6 rounded-lg shadow-md border border-gray-100 dark:border-tag-border"
                variants={fadeInUp}
                {...cardHover}
              >
                {IconComponent(skillGroup.icon)}
                <h3 className="text-xl font-semibold mb-2">{skillGroup.title}</h3>
                <ul className="text-secondary space-y-2">
                  {skillGroup.skills.map((sk, index) => (
                    <li key={index}>{sk}</li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </motion.div>
        </motion.section>
      )}

      {/* Experience & Internships Section */}
      {resolvedData.experience && resolvedData.experience.length > 0 && (
        <motion.section className="mb-16" {...fadeIn} transition={{ delay: 0.4 }}>
          <motion.h2 className="section-title text-center text-3xl font-bold mb-3" {...fadeInUp}>
            {hasInternships ? "Experience & Internships" : "Experience"}
          </motion.h2>

          {hasInternships && (
            <div className="flex justify-center items-center gap-2 mb-10">
              <button
                onClick={() => setExpFilter("all")}
                className={`px-3.5 py-1 text-xs rounded-full font-medium transition-all ${expFilter === "all"
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-white/5 text-secondary hover:text-white"
                  }`}
              >
                All Records
              </button>
              <button
                onClick={() => setExpFilter("job")}
                className={`px-3.5 py-1 text-xs rounded-full font-medium transition-all ${expFilter === "job"
                  ? "bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                  : "bg-white/5 text-secondary hover:text-white"
                  }`}
              >
                Work Experience
              </button>
              <button
                onClick={() => setExpFilter("internship")}
                className={`px-3.5 py-1 text-xs rounded-full font-medium transition-all ${expFilter === "internship"
                  ? "bg-purple-500 text-white shadow-md shadow-purple-500/20"
                  : "bg-white/5 text-secondary hover:text-white"
                  }`}
              >
                Internships
              </button>
            </div>
          )}

          <div className="max-w-4xl mx-auto ml-3 sm:mx-auto relative border-l-2 border-gray-200 dark:border-tag-border pl-6 sm:pl-8 space-y-8 sm:space-y-12">
            {filteredExperiences.map((exp) => {
              const expType = exp.type || "Job";
              const isInternship = expType.toLowerCase() === "internship";

              return (
                <motion.div
                  key={exp.id}
                  className="relative bg-white dark:bg-dark/50 p-4 sm:p-6 rounded-xl shadow-md border border-gray-100 dark:border-tag-border"
                  variants={fadeInUp}
                  initial="initial"
                  whileInView="animate"
                  viewport={{ once: true }}
                  {...cardHoverSmall}
                >
                  {/* Timeline Dot */}
                  <span className={`absolute -left-[33px] sm:-left-[41px] top-[22px] flex h-4 w-4 items-center justify-center rounded-full ring-4 ring-white dark:ring-deep-dark ${isInternship ? "bg-purple-500" : "bg-primary"
                    }`}>
                    <span className={`h-2 w-2 rounded-full ${isInternship ? "bg-purple-300" : "bg-cyan-400"}`}></span>
                  </span>

                  {/* Header Badge */}
                  <div className="flex items-center gap-2 mb-2">
                    {isInternship ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/30">
                        Internship
                      </span>
                    ) : expType.toLowerCase() === "freelance" ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                        Freelance Contract
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Work Experience
                      </span>
                    )}
                  </div>

                  <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                        {exp.job_title}
                      </h3>
                      <p className="text-primary font-medium">{exp.company}</p>
                    </div>
                    <div className="text-left md:text-right mt-2 md:mt-0 text-sm text-secondary">
                      <p className="font-semibold text-slate-700 dark:text-cyan-400">{exp.duration}</p>
                      <p className="text-xs">{exp.location}</p>
                    </div>
                  </div>

                  {exp.tasks && exp.tasks.length > 0 && (
                    <ul className="list-disc pl-5 space-y-2 text-secondary text-sm">
                      {exp.tasks.map((task, i) => (
                        <li key={i}>{task}</li>
                      ))}
                    </ul>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>
      )}

      {/* Education Section */}
      {resolvedData.education && resolvedData.education.length > 0 && (
        <motion.section {...fadeIn} transition={{ delay: 0.6 }}>
          <motion.h2 className="section-title text-center text-3xl font-bold mb-8" {...fadeInUp}>
            Education & Qualifications
          </motion.h2>
          <motion.div
            className="max-w-3xl mx-auto space-y-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {resolvedData.education.map((edu) => {
              const eduType = edu.type || "Education";

              const badgeColor =
                eduType === "Certification"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : eduType === "Course"
                    ? "bg-purple-500/10 text-purple-400 border-purple-500/20"
                    : eduType === "Bootcamp"
                      ? "bg-rose-500/10 text-rose-400 border-rose-500/20"
                      : eduType === "Diploma"
                        ? "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                        : eduType === "Internship"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : eduType === "Workshop"
                            ? "bg-orange-500/10 text-orange-400 border-orange-500/20"
                            : eduType === "Fellowship"
                              ? "bg-teal-500/10 text-teal-400 border-teal-500/20"
                              : eduType === "Award & Honor"
                                ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                : "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";

              const details = [
                edu.university,
                edu.location,
                edu.duration
              ].filter(Boolean).join(" • ");

              return (
                <motion.div
                  key={edu.id}
                  className="bg-white dark:bg-dark/50 p-6 rounded-2xl shadow-lg border border-gray-100 dark:border-tag-border relative overflow-hidden backdrop-blur-md"
                  variants={fadeInUp}
                  {...cardHoverSmall}
                >
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {edu.degree}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border whitespace-nowrap ${badgeColor}`}>
                      {eduType}
                    </span>
                  </div>

                  {details && (
                    <p className="text-primary font-medium text-sm mb-2">
                      {details}
                      {edu.grade && <span className="text-secondary ml-1 font-normal">(Grade: {edu.grade})</span>}
                    </p>
                  )}

                  {!details && edu.grade && (
                    <p className="text-secondary text-sm mb-2 font-medium">
                      Grade: {edu.grade}
                    </p>
                  )}

                  {edu.description && (
                    <p className="text-secondary text-sm leading-relaxed mt-2">
                      {edu.description}
                    </p>
                  )}
                </motion.div>
              );
            })}
          </motion.div>
        </motion.section>
      )}
    </div>
  );
}
