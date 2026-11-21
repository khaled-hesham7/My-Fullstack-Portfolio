"use client";
import React, { useEffect, useRef } from "react";

export default function MouseGlow() {
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && (window.innerWidth < 1024 || window.matchMedia("(pointer: coarse)").matches)) {
      return;
    }

    let rafId: number | null = null;
    let mouseX = -1000;
    let mouseY = -1000;
    let visible = false;

    const updateGlow = () => {
      if (glowRef.current) {
        if (!visible) {
          glowRef.current.style.opacity = "1";
          visible = true;
        }
        glowRef.current.style.transform = `translate3d(${mouseX - 300}px, ${mouseY - 300}px, 0)`;
      }
      document.documentElement.style.setProperty("--mouse-x", `${mouseX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${mouseY}px`);
      rafId = null;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (!rafId) {
        rafId = requestAnimationFrame(updateGlow);
      }
    };

    const handleMouseLeave = () => {
      if (glowRef.current) {
        glowRef.current.style.opacity = "0";
        visible = false;
      }
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.body.addEventListener("mouseleave", handleMouseLeave, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={glowRef}
      className="pointer-events-none fixed top-0 left-0 w-[600px] h-[600px] rounded-full z-30 transition-opacity duration-300 lg:block hidden will-change-transform"
      style={{
        opacity: 0,
        background: "radial-gradient(circle, rgba(78, 128, 247, 0.07) 0%, transparent 70%)",
      }}
    />
  );
}
