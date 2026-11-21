"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaHome, 
  FaUser, 
  FaBriefcase, 
  FaBookOpen, 
  FaEnvelope 
} from "react-icons/fa";

const dockItems = [
  { href: "/", label: "Home", icon: FaHome },
  { href: "/about", label: "About", icon: FaUser },
  { href: "/projects", label: "Projects", icon: FaBriefcase },
  { href: "/blog", label: "Blogs", icon: FaBookOpen },
  { href: "/contact", label: "Contact", icon: FaEnvelope },
];

export default function Navbar() {
  const pathname = usePathname();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringDock, setIsHoveringDock] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const isHoveringDockRef = useRef(false);
  const isMouseNearBottomRef = useRef(false);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isHoveringDockRef.current = isHoveringDock;
  }, [isHoveringDock]);

  useEffect(() => {
    // Check if on touch/mobile device
    const checkTouch = () => {
      const touch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
      setIsTouchDevice(touch);
      if (touch) {
        setIsVisible(true);
      }
    };

    checkTouch();
    window.addEventListener("resize", checkTouch);

    const handleScroll = () => {
      setIsVisible(true);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
      scrollTimerRef.current = setTimeout(() => {
        scrollTimerRef.current = null;
        if (!isHoveringDockRef.current && !isMouseNearBottomRef.current) {
          // Keep visible on touch devices
          const touch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
          if (!touch) {
            setIsVisible(false);
          }
        }
      }, 400);
    };

    const handleMouseMove = (e: MouseEvent) => {
      const nearBottom = window.innerHeight - e.clientY < 140;
      isMouseNearBottomRef.current = nearBottom;

      if (nearBottom || isHoveringDockRef.current || scrollTimerRef.current !== null) {
        setIsVisible(true);
      } else {
        const touch = window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 768;
        if (!touch) {
          setIsVisible(false);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    return () => {
      window.removeEventListener("resize", checkTouch);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    };
  }, []);

  const showDock = isTouchDevice || isVisible || isHoveringDock;

  return (
    <>
      {/* Top Left Floating Brand Logo */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 md:left-12 z-50 pointer-events-auto">
        <Link
          href="/"
          className="text-xl block dark:hidden font-bold text-primary"
          aria-label="The Forge Homepage"
        >
          <Image
            src="/logo/light-logo.webp"
            width={120}
            height={78}
            alt="The Forge Logo"
            priority
            className="w-24 sm:w-28 md:w-32 h-auto object-contain hue-rotate-[190deg] brightness-150 contrast-125 transition-all duration-500 animate-pulse drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]"
          />
        </Link>
        <Link
          href="/"
          className="text-xl hidden dark:block font-bold text-primary"
          aria-label="The Forge Homepage"
        >
          <Image
            src="/logo/dark-logo.webp"
            width={120}
            height={78}
            alt="The Forge Logo"
            priority
            className="w-24 sm:w-28 md:w-32 h-auto object-contain hue-rotate-[190deg] brightness-150 contrast-125 transition-all duration-500 animate-pulse drop-shadow-[0_0_6px_rgba(6,182,212,0.5)]"
          />
        </Link>
      </div>

      {/* Floating Bottom Dock Menu with Auto-Hide & Motion */}
      <nav aria-label="Main Navigation">
        <motion.div 
          initial={{ y: 40, opacity: 0 }}
          animate={{ 
            y: showDock ? 0 : 40, 
            opacity: showDock ? 1 : 0,
          }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          style={{ pointerEvents: showDock ? "auto" : "none" }}
          className="fixed bottom-4 sm:bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-[calc(100vw-20px)]"
          onMouseEnter={() => {
            setIsHoveringDock(true);
            setIsVisible(true);
          }}
          onMouseLeave={() => {
            setIsHoveringDock(false);
            if (!isMouseNearBottomRef.current && scrollTimerRef.current === null && !isTouchDevice) {
              setIsVisible(false);
            }
          }}
        >
          {/* Outer glowing border wrapper */}
          <div className="relative rounded-full p-[1.5px] bg-white/5 shadow-[0_10px_30px_rgba(0,0,0,0.6),0_0_25px_rgba(34,211,238,0.15)] flex items-center justify-center">
            {/* Contain the rotating beam within the rounded bounds of the dock */}
            <div className="absolute inset-0 overflow-hidden rounded-full z-0 pointer-events-none">
              {/* Rotating Neon Beam */}
              <div className="absolute inset-[-150%] bg-[conic-gradient(from_0deg,transparent_45%,#22d3ee_50%,transparent_55%)] animate-[spin_4s_linear_infinite] will-change-transform" />
            </div>
            
            {/* Inner Content Container */}
            <div className="relative z-10 px-3.5 sm:px-6 py-2 sm:py-2.5 rounded-full bg-[#030712]/92 backdrop-blur-xl flex items-center justify-center space-x-2.5 sm:space-x-5 md:space-x-6 w-full h-full">
              {dockItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));

                return (
                  <Link 
                    key={item.href} 
                    href={item.href} 
                    className="group relative flex flex-col items-center"
                    aria-label={item.label}
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                  >
                    {/* Tooltip Popup (Framer Motion AnimatePresence) */}
                    <AnimatePresence>
                      {hoveredIndex === index && !isTouchDevice && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.85, y: 4, x: "-50%" }}
                          animate={{ opacity: 1, scale: 1, y: 0, x: "-50%" }}
                          exit={{ opacity: 0, scale: 0.85, y: 4, x: "-50%" }}
                          transition={{ duration: 0.15, ease: "easeOut" }}
                          className="absolute bottom-full mb-2 left-1/2 px-3 py-1 rounded-md bg-[#030712]/95 border border-white/10 backdrop-blur-md text-xs font-medium tracking-wide text-white pointer-events-none shadow-xl whitespace-nowrap z-50 w-auto"
                        >
                          {item.label}
                          {/* Tooltip Arrow */}
                          <span className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-[#030712] border-r border-b border-white/10" />
                        </motion.span>
                      )}
                    </AnimatePresence>

                    {/* Animated Icon Container */}
                    <motion.div
                      whileHover={{ scale: 1.2, y: -3 }}
                      whileTap={{ scale: 0.92 }}
                      className={`p-2 sm:p-2.5 rounded-full transition-colors ${
                        isActive 
                          ? "text-primary bg-white/[0.08] border border-white/10" 
                          : "text-slate-300 hover:text-cyan-400 hover:bg-white/[0.03]"
                      }`}
                    >
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
                    </motion.div>

                    {/* Active Indicator Glowing Dot */}
                    {isActive && (
                      <span className="absolute bottom-[-2px] w-1.5 h-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(78,128,247,0.8)] animate-pulse" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.div>
      </nav>
    </>
  );
}
