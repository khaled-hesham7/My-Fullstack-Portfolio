"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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
import { getApiBaseUrl } from "@/lib/utils";

interface SocialLinkItem {
  id: number;
  platform: string;
  url: string;
}

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

const fallbackLinks: SocialLinkItem[] = [];

export default function Footer() {
  const [socialLinks, setSocialLinks] = useState<SocialLinkItem[]>([]);

  useEffect(() => {
    const fetchSocialLinks = async () => {
      try {
        const apiBase = getApiBaseUrl();
        const res = await fetch(`${apiBase}/SocialLinkindex`);
        if (res.ok) {
          const payload = await res.json();
          if (payload.success && Array.isArray(payload.data)) {
            setSocialLinks(payload.data);
          }
        }
      } catch (err) {
        if (process.env.NODE_ENV === "development") {
          console.warn("Failed to fetch footer social links:", err);
        }
      }
    };
    fetchSocialLinks();
  }, []);

  const linksToRender = socialLinks.length > 0 ? socialLinks : fallbackLinks;

  return (
    <footer className="bg-white dark:bg-dark border-t border-gray-200 dark:border-gray-800 relative z-10">
      <div className="container max-w-7xl mx-auto px-4 py-8 pb-24 sm:pb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-0">
          <div className="flex flex-col items-center md:items-start">
            <Link
              href="/"
              className="text-xl block dark:hidden font-bold text-primary"
              aria-label="The Forge Homepage"
            >
              <Image
                src="/logo/light-logo.webp"
                width={130}
                height={80}
                alt="The Forge Logo"
                className="w-28 sm:w-36 h-auto object-contain hue-rotate-[190deg] brightness-150 contrast-125 transition-all duration-500 animate-pulse drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]"
              />
            </Link>
            <Link
              href="/"
              className="text-xl hidden dark:block font-bold text-primary"
              aria-label="The Forge Homepage"
            >
              <Image
                src="/logo/dark-logo.webp"
                width={130}
                height={80}
                alt="The Forge Logo"
                className="w-28 sm:w-36 h-auto object-contain hue-rotate-[190deg] brightness-150 contrast-125 transition-all duration-500 animate-pulse drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]"
              />
            </Link>
            <p className="text-sm text-center md:text-left text-slate-400 mt-2">
              © {new Date().getFullYear()} Khaled Hesham{" "}
              <span className="text-cyan-400 font-medium">The Forge</span>. All rights
              reserved.
            </p>
          </div>

          <div className="flex flex-wrap justify-center items-center gap-4 sm:gap-6">
            {linksToRender.map((link) => {
              const Icon = getSocialIcon(link.platform);
              return (
                <a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-cyan-400 transition-colors"
                  aria-label={`Visit ${link.platform}`}
                >
                  <Icon className="h-6 w-6" aria-hidden="true" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
