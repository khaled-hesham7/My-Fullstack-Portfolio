"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  FaGithub, 
  FaTwitter, 
  FaLinkedin, 
  FaFacebook, 
  FaInstagram, 
  FaYoutube, 
  FaGlobe,
  FaBriefcase,
  FaCoins,
  FaLaptopCode,
  FaHandshake,
  FaWhatsapp,
  FaTelegram,
  FaTiktok,
  FaSnapchat,
  FaBehance,
  FaDribbble,
  FaMedium,
  FaPinterest,
  FaDiscord,
  FaStackOverflow,
  FaFilePdf,
  FaDownload,
  FaChevronDown
} from "react-icons/fa";
import {
  SiUpwork,
  SiFiverr,
  SiFreelancer,
  SiHackerrank,
  SiCodeforces,
  SiLeetcode,
  SiCodewars,
  SiHackerearth
} from "react-icons/si";
import { motion } from "framer-motion";
import { fadeInUp, fadeIn, scaleIn } from "@/utils/animations";
import { resolveImageUrl, getApiBaseUrl, isClientFetchAllowed } from "@/lib/utils";

const getSocialIcon = (platform: string) => {
  switch (platform.toLowerCase()) {
    case "github":
      return FaGithub;
    case "twitter":
    case "x":
      return FaTwitter;
    case "linkedin":
      return FaLinkedin;
    case "facebook":
      return FaFacebook;
    case "instagram":
      return FaInstagram;
    case "youtube":
      return FaYoutube;
    case "whatsapp":
      return FaWhatsapp;
    case "telegram":
      return FaTelegram;
    case "tiktok":
      return FaTiktok;
    case "snapchat":
      return FaSnapchat;
    case "behance":
      return FaBehance;
    case "dribbble":
      return FaDribbble;
    case "medium":
      return FaMedium;
    case "pinterest":
      return FaPinterest;
    case "discord":
      return FaDiscord;
    case "stackoverflow":
      return FaStackOverflow;
    case "upwork":
      return SiUpwork;
    case "fiverr":
      return SiFiverr;
    case "freelancer":
      return SiFreelancer;
    case "leetcode":
      return SiLeetcode;
    case "hackerrank":
      return SiHackerrank;
    case "codeforces":
      return SiCodeforces;
    case "codewars":
      return SiCodewars;
    case "hackerearth":
      return SiHackerearth;
    case "khamsat":
      return FaCoins;
    case "mostaql":
      return FaBriefcase;
    case "website":
    default:
      return FaGlobe;
  }
};

const DEFAULT_SKILLS = `~/the-forge $ php artisan developer:info --backend
> Loading developer profile...
~/the-forge $ cat Developer.php
<?php
namespace App\\Profile;

class KhaledHesham extends BackendDeveloper {
  public array $stack = ['PHP', 'Laravel', 'MySQL'];
  public array $strengths = ['RESTful APIs', 'Unit Testing', 'Clean Architecture'];

  public function craft(): string {
    return 'Building high-performance, robust software...';
  }
}`;

const DEFAULT_TYPEWRITER = "Backend Developer & Software Engineer, Building robust web applications with PHP & Laravel, Crafting scalable RESTful APIs & Clean Architecture";

const DEFAULT_SOCIAL_LINKS = [
  { id: 1, platform: "github", url: "https://github.com/khaled-hesham7" },
  { id: 2, platform: "linkedin", url: "https://www.linkedin.com/in/khaled-hesham-031a08233/" },
  { id: 3, platform: "twitter", url: "https://twitter.com/Heshamdev" },
];

function MiniTerminal({ data }: { data: any }) {
  const profile = data?.profile;
  const [displayedLines, setDisplayedLines] = useState<string[]>([]);
  const [currentLineTyping, setCurrentLineTyping] = useState("");
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 500);
    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    const skillsText = profile?.skills || DEFAULT_SKILLS;
    const lines = skillsText.split("\n");
    let active = true;

    const runTerminalSimulation = async () => {
      while (active) {
        setDisplayedLines([]);
        setCurrentLineTyping("");
        
        await new Promise((resolve) => setTimeout(resolve, 800));
        if (!active) return;

        for (let i = 0; i < lines.length; i++) {
          if (!active) return;
          const line = lines[i];
          
          const trimmed = line.trim();
          const isCommand = trimmed.startsWith("~/") || trimmed.startsWith("$");
          
          if (isCommand) {
            for (let j = 0; j <= line.length; j++) {
              if (!active) return;
              setCurrentLineTyping(line.slice(0, j));
              await new Promise((resolve) => setTimeout(resolve, 30 + Math.random() * 20));
            }
            setDisplayedLines((prev) => [...prev, line]);
            setCurrentLineTyping("");
            await new Promise((resolve) => setTimeout(resolve, 200));
          } else {
            setDisplayedLines((prev) => [...prev, line]);
            await new Promise((resolve) => setTimeout(resolve, 80));
          }
        }
        
        await new Promise((resolve) => setTimeout(resolve, 8000));
      }
    };

    runTerminalSimulation();

    return () => {
      active = false;
    };
  }, [profile?.skills]);

  return (
    <div className="w-full max-w-lg mx-auto lg:mx-0 rounded-xl overflow-hidden border border-[#1f293d] bg-black/50 backdrop-blur-md text-left shadow-[0_0_30px_rgba(78,128,247,0.15)] font-mono text-xs text-green-400 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f293d] bg-white/[0.03]">
        <div className="flex space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
        </div>
        <span className="text-[10px] text-slate-400 font-sans font-medium">bash - local</span>
      </div>
      
      {/* Console Area */}
      <div className="p-3.5 sm:p-5 space-y-1.5 min-h-[220px] sm:min-h-[280px] leading-relaxed whitespace-pre-wrap break-words overflow-x-auto text-xs sm:text-[13px]">
        {displayedLines.map((line, idx) => (
          <div key={idx}>{line}</div>
        ))}
        {currentLineTyping ? (
          <div>
            {currentLineTyping}
            {showCursor && <span className="inline-block w-1.5 h-3.5 bg-green-400 ml-0.5 align-middle"></span>}
          </div>
        ) : (
          displayedLines.length > 0 && showCursor && (
            <span className="inline-block w-1.5 h-3.5 bg-green-400 align-middle"></span>
          )
        )}
      </div>
    </div>
  );
}

export default function Hero({ data }: { data: any }) {
  const profile = data?.profile;
  const [typedText, setTypedText] = useState("");
  const [cvList, setCvList] = useState<{ id: number; title: string; file_url: string }[]>([]);
  const [isCvOpen, setIsCvOpen] = useState(false);
  const cvDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (data?.cvs && Array.isArray(data.cvs) && data.cvs.length > 0) {
      setCvList(data.cvs);
      return;
    }
    if (!isClientFetchAllowed()) {
      return;
    }
    const fetchCvs = async () => {
      try {
        const apiBase = getApiBaseUrl();
        const res = await fetch(`${apiBase}/cvs`);
        if (res.ok) {
          const payload = await res.json();
          if (payload.success && Array.isArray(payload.data)) {
            setCvList(payload.data);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Could not load CVs dynamically:", err);
        }
      }
    };
    fetchCvs();
  }, [data]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (cvDropdownRef.current && !cvDropdownRef.current.contains(event.target as Node)) {
        setIsCvOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const rawTypewriter = profile?.typewriter_text || DEFAULT_TYPEWRITER;
    const texts = rawTypewriter.split(/\r?\n|,|&&|;/).map((s: string) => s.trim()).filter(Boolean);
    
    if (texts.length === 0) {
      setTypedText("");
      return;
    }

    let active = true;

    const runTypewriterLoop = async () => {
      let index = 0;
      while (active) {
        const textToType = texts[index];
        if (!textToType) break;
        // Typing phase
        for (let i = 0; i <= textToType.length; i++) {
          if (!active) return;
          setTypedText(textToType.slice(0, i));
          await new Promise((resolve) => setTimeout(resolve, 80));
        }

        // Wait at the end of typing
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Deleting phase
        for (let i = textToType.length; i >= 0; i--) {
          if (!active) return;
          setTypedText(textToType.slice(0, i));
          await new Promise((resolve) => setTimeout(resolve, 40));
        }

        // Wait before restarting next word
        await new Promise((resolve) => setTimeout(resolve, 500));
        index = (index + 1) % texts.length;
      }
    };

    runTypewriterLoop();

    return () => {
      active = false;
    };
  }, [profile?.typewriter_text]);

  return (
    <section className="py-20 sm:py-24 md:py-28 relative overflow-hidden group/hero">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Two-column grid on desktop (lg+), stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center text-center lg:text-left">
          
          {/* Left Column: Avatar, Text, Buttons, Socials */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start animate-fade-in">
            
            {/* Profile Avatar Container */}
            <motion.div
              className="flex flex-col items-center lg:items-start mb-6"
              {...scaleIn}
              transition={{ delay: 0.2 }}
            >
              <div className="relative flex items-center justify-center">
                {/* Profile Avatar Glow */}
                <div className="bg-blue-500/10 blur-3xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-48 w-48 rounded-full -z-10 pointer-events-none"></div>
                
                {/* Spinning Gradient Border Container */}
                <div className="relative rounded-full w-36 h-36 p-[2px] overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(78,128,247,0.4)] bg-transparent">
                  {/* Rotating Gradient Background */}
                  <div 
                    className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-gradient-to-r from-primary via-blue-500 to-transparent animate-spin"
                    style={{ animationDuration: "4s" }}
                  />
                  {/* Inner static container */}
                  <div className="w-full h-full rounded-full bg-deep-dark overflow-hidden relative z-10">
                    <Image
                      src={resolveImageUrl(profile?.image_url)}
                      alt={profile?.name ? `${profile.name} profile photo` : "Profile photo"}
                      width={144}
                      height={144}
                      priority
                      fetchPriority="high"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
 
            {/* Headings */}
            <motion.h1
              className="text-3xl sm:text-5xl md:text-6xl font-bold mb-3 tracking-tight"
              {...fadeInUp}
              transition={{ delay: 0.3 }}
            >
              Hi, I&apos;m{" "}
              <motion.span
                className="bg-gradient-to-r from-white to-sky-blue bg-clip-text text-transparent inline-block font-extrabold"
                {...fadeIn}
                transition={{ delay: 0.8 }}
              >
                {profile?.name || "Khaled Hesham"}
              </motion.span>
            </motion.h1>
 
            <motion.h2
              className="text-xl sm:text-2xl text-accent-blue dark:text-sky-blue font-semibold mb-3 tracking-tight animate-fade-in"
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              {profile?.description || "Backend Developer & Software Engineer"}
            </motion.h2>
 
            <motion.p
              className="text-base sm:text-lg text-slate-300 max-w-2xl mb-8 leading-relaxed min-h-[36px] flex items-center justify-center lg:justify-start"
            >
              <span>{typedText}</span>
              <span className="inline-block w-[2px] h-5 bg-[#4e80f7] dark:bg-sky-blue ml-1.5 animate-pulse" />
            </motion.p>

            {/* Actions & Social Links Row */}
            <motion.div
              className="flex flex-wrap items-center justify-center lg:justify-start gap-4"
              {...fadeInUp}
              transition={{ delay: 0.55 }}
            >
              {/* CV Download Button / Dropdown */}
              {cvList.length === 1 ? (
                <a
                  href={resolveImageUrl(cvList[0].file_url)}
                  target="_blank"
                  download
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-indigo-500/15 hover:from-cyan-500/25 hover:to-indigo-500/25 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all duration-200 cursor-pointer backdrop-blur-md"
                  title="Download Resume"
                >
                  <FaFilePdf className="text-cyan-400 text-sm group-hover:scale-110 transition-transform" />
                  <span>Download CV</span>
                  <FaDownload className="text-[11px] text-slate-400 group-hover:text-white transition-colors" />
                </a>
              ) : cvList.length > 1 ? (
                <div className="relative" ref={cvDropdownRef}>
                  <button
                    onClick={() => setIsCvOpen(!isCvOpen)}
                    className="group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-indigo-500/15 hover:from-cyan-500/25 hover:to-indigo-500/25 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all duration-200 cursor-pointer backdrop-blur-md"
                    aria-expanded={isCvOpen}
                  >
                    <FaFilePdf className="text-cyan-400 text-sm group-hover:scale-110 transition-transform" />
                    <span>Download CV</span>
                    <FaChevronDown className={`text-[10px] text-cyan-400 transition-transform duration-200 ${isCvOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isCvOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 sm:left-0 sm:translate-x-0 mt-2 w-60 rounded-xl bg-slate-950/95 border border-slate-800 shadow-2xl p-1.5 z-50 backdrop-blur-xl animate-fade-in">
                      <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-slate-400 border-b border-slate-800/80 mb-1">
                        Select Resume Version
                      </div>
                      {cvList.map((cv) => (
                        <a
                          key={cv.id}
                          href={resolveImageUrl(cv.file_url)}
                          target="_blank"
                          download
                          rel="noopener noreferrer"
                          onClick={() => setIsCvOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-slate-800/80 text-xs text-slate-200 hover:text-cyan-300 transition-colors group/item"
                        >
                          <span className="flex items-center gap-2 truncate">
                            <FaFilePdf className="text-cyan-400 text-xs shrink-0" />
                            <span className="truncate">{cv.title}</span>
                          </span>
                          <FaDownload className="text-[10px] text-slate-500 group-hover/item:text-cyan-400 shrink-0 ml-2" />
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/about"
                  className="group inline-flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/15 via-blue-500/15 to-indigo-500/15 hover:from-cyan-500/25 hover:to-indigo-500/25 border border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(6,182,212,0.12)] transition-all duration-200 cursor-pointer backdrop-blur-md"
                >
                  <FaFilePdf className="text-cyan-400 text-sm group-hover:scale-110 transition-transform" />
                  <span>View Resume</span>
                  <FaDownload className="text-[11px] text-slate-400 group-hover:text-white transition-colors" />
                </Link>
              )}

              {/* Social Links */}
              <div className="flex items-center gap-3">
                {(() => {
                  const rawLinks = Array.isArray(data?.SocialLink)
                    ? data.SocialLink
                    : Array.isArray(data?.social_links)
                    ? data.social_links
                    : data?.SocialLink?.data || data?.social_links?.data;
                  const links = Array.isArray(rawLinks) && rawLinks.length > 0 ? rawLinks : DEFAULT_SOCIAL_LINKS;
                  return links.map((link: any) => {
                    const Icon = getSocialIcon(link.platform);
                    return (
                      <motion.a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xl sm:text-2xl text-slate-300 hover:text-cyan-400 transition-colors"
                        whileHover={{ scale: 1.15 }}
                        whileTap={{ scale: 0.95 }}
                        title={link.platform || "Social Profile"}
                        aria-label={`Visit Khaled on ${link.platform || "Social Media"}`}
                      >
                        <Icon aria-hidden="true" />
                      </motion.a>
                    );
                  });
                })()}
              </div>
            </motion.div>

          </div>

          {/* Right Column: Mini-Terminal */}
          <div className="lg:col-span-5 w-full flex justify-center lg:justify-end">
            <motion.div
              {...fadeInUp}
              transition={{ delay: 0.48 }}
              className="w-full"
            >
              <MiniTerminal data={data} />
            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
