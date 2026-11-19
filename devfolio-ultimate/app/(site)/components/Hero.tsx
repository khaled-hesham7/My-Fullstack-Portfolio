"use client";

import React, { useState, useEffect } from "react";
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
  FaStackOverflow
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
import { resolveImageUrl } from "@/lib/utils";

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
    if (!profile?.skills) {
      setDisplayedLines([]);
      setCurrentLineTyping("");
      return;
    }
    const lines = profile.skills.split("\n");
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
    <div className="w-full max-w-lg mx-auto lg:mx-0 rounded-lg overflow-hidden border border-[#1f293d] bg-black/50 backdrop-blur-md text-left shadow-[0_0_30px_rgba(78,128,247,0.15)] font-mono text-xs text-green-400 select-none">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f293d] bg-white/[0.03]">
        <div className="flex space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]"></span>
          <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f]"></span>
        </div>
        <span className="text-[10px] text-gray-500 font-sans font-medium">bash - local</span>
      </div>
      
      {/* Console Area */}
      <div className="p-4 space-y-1.5 min-h-[280px] leading-relaxed whitespace-pre-wrap">
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

  useEffect(() => {
    const texts = profile?.typewriter_text
      ? profile.typewriter_text.split(/\r?\n|,|&&|;/).map((s: string) => s.trim()).filter(Boolean)
      : [];
    
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
    <section className="py-28 relative overflow-hidden group/hero">
      <div className="container max-w-7xl mx-auto px-4 relative z-10">
        {/* Two-column grid on desktop (lg+), stacked on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-center lg:text-left">
          
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
                      alt="Profile"
                      width={144}
                      height={144}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
 
            {/* Headings */}
            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-4"
              {...fadeInUp}
              transition={{ delay: 0.3 }}
            >
              Hi, I&apos;m{" "}
              <motion.span
                className="bg-gradient-to-r from-white to-sky-blue bg-clip-text text-transparent inline-block font-extrabold"
                {...fadeIn}
                transition={{ delay: 0.8 }}
              >
                {profile?.name || ""}
              </motion.span>
            </motion.h1>
 
            <motion.h2
              className="text-xl md:text-2xl text-accent-blue dark:text-sky-blue font-semibold mb-4 animate-fade-in"
              {...fadeInUp}
              transition={{ delay: 0.4 }}
            >
              {profile?.description || ""}
            </motion.h2>
 
            <motion.p
              className="text-lg text-gray-600 dark:text-description max-w-2xl mb-8 leading-relaxed min-h-[32px] flex items-center justify-center lg:justify-start"
            >
              <span>{typedText}</span>
              <span className="inline-block w-[2px] h-5 bg-[#4e80f7] dark:bg-sky-blue ml-1 animate-pulse" />
            </motion.p>

            {/* Social Links */}
            <motion.div
              className="flex justify-center lg:justify-start space-x-4"
              {...fadeInUp}
              transition={{ delay: 0.55 }}
            >
              {(() => {
                const links = Array.isArray(data?.SocialLink)
                  ? data.SocialLink
                  : Array.isArray(data?.social_links)
                  ? data.social_links
                  : data?.SocialLink?.data || data?.social_links?.data || [];
                if (!links || links.length === 0) return null;
                return links.map((link: any) => {
                  const Icon = getSocialIcon(link.platform);
                  return (
                    <motion.a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-2xl text-gray-600 hover:text-primary dark:text-gray-300 dark:hover:text-primary transition-colors"
                      whileHover={{ scale: 1.2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Icon />
                    </motion.a>
                  );
                });
              })()}
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
