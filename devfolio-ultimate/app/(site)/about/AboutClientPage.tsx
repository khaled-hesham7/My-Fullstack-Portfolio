// app/about/AboutClient.tsx
"use client";

import * as Icons from "react-icons/fa";
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
  const Icon = (Icons as Record<string, React.ComponentType<{ className?: string }>>)[iconName];
  if (!Icon) {
    return <Icons.FaCode className="h-8 w-8 text-primary mb-4" />;
  }
  return <Icon className="h-8 w-8 text-primary mb-4" />;
};

export default function AboutClient({ data }: { data: AboutData | null }) {
  const resolvedData = data || fallbackData;

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

          {/* Dynamic CV Downloads Grid */}
          {((resolvedData.cvs && resolvedData.cvs.length > 0) || resolvedData.about) && (
            <div className="flex flex-wrap justify-center gap-3 mt-6">
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
                      className={`group inline-flex items-center gap-2.5 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 ${theme.border} text-slate-300 hover:text-white transition-all duration-300 text-xs font-medium cursor-pointer shadow-sm backdrop-blur-md`}
                    >
                      <span className={`p-1 rounded ${theme.bg} ${theme.text} ${theme.hoverBg} transition-colors`}>
                        <Icons.FaFilePdf className="h-3.5 w-3.5" />
                      </span>
                      <span>{cvItem.title}</span>
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
                      className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 text-slate-300 hover:text-white transition-all duration-300 text-xs font-medium cursor-pointer shadow-sm backdrop-blur-md"
                    >
                      <span className="p-1 rounded bg-red-500/10 text-red-400 group-hover:bg-red-500/20 transition-colors">
                        <Icons.FaFilePdf className="h-3.5 w-3.5" />
                      </span>
                      <span>General CV</span>
                    </a>
                  )}

                  {resolvedData.about?.backend_cv_url && resolvedData.about.backend_cv_url !== "" && (
                    <a
                      href={resolveImageUrl(resolvedData.about.backend_cv_url)}
                      target="_blank"
                      download
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-emerald-500/50 text-slate-300 hover:text-white transition-all duration-300 text-xs font-medium cursor-pointer shadow-sm backdrop-blur-md"
                    >
                      <span className="p-1 rounded bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-colors">
                        <Icons.FaFilePdf className="h-3.5 w-3.5" />
                      </span>
                      <span>Backend Developer CV</span>
                    </a>
                  )}

                  {resolvedData.about?.qa_cv_url && resolvedData.about.qa_cv_url !== "" && (
                    <a
                      href={resolveImageUrl(resolvedData.about.qa_cv_url)}
                      target="_blank"
                      download
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-2.5 px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/50 text-slate-300 hover:text-white transition-all duration-300 text-xs font-medium cursor-pointer shadow-sm backdrop-blur-md"
                    >
                      <span className="p-1 rounded bg-cyan-500/10 text-cyan-400 group-hover:bg-cyan-500/20 transition-colors">
                        <Icons.FaFilePdf className="h-3.5 w-3.5" />
                      </span>
                      <span>QA Engineer CV</span>
                    </a>
                  )}
                </>
              )}
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

      {/* Experience Section */}
      {resolvedData.experience && resolvedData.experience.length > 0 && (
        <motion.section className="mb-16" {...fadeIn} transition={{ delay: 0.4 }}>
          <motion.h2 className="section-title text-center text-3xl font-bold mb-8" {...fadeInUp}>
            Experience
          </motion.h2>
          <div className="max-w-4xl mx-auto relative border-l-2 border-gray-200 dark:border-tag-border pl-6 space-y-12">
            {resolvedData.experience.map((exp) => (
              <motion.div
                key={exp.id}
                className="relative bg-white dark:bg-dark/50 p-6 rounded-lg shadow-md border border-gray-100 dark:border-tag-border"
                variants={fadeInUp}
                initial="initial"
                whileInView="animate"
                viewport={{ once: true }}
                {...cardHoverSmall}
              >
                {/* Timeline Dot */}
                <span className="absolute -left-[35px] top-[26px] flex h-4 w-4 items-center justify-center rounded-full bg-primary ring-4 ring-white dark:ring-deep-dark">
                  <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
                </span>

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
            ))}
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
