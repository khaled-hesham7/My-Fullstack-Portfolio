"use client";
import React, { useEffect, useState } from "react";

export default function MouseGlow() {
  const [opacity, setOpacity] = useState(0);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty("--mouse-x", `${e.clientX}px`);
      document.documentElement.style.setProperty("--mouse-y", `${e.clientY}px`);
      if (opacity === 0) {
        setOpacity(1);
      }
    };

    const handleMouseLeave = () => {
      setOpacity(0);
    };

    const handleMouseEnter = () => {
      setOpacity(1);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);
    document.body.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
      document.body.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [opacity]);

  return (
    <div
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-500 lg:block hidden"
      style={{
        opacity,
        background: `radial-gradient(600px at var(--mouse-x, 0px) var(--mouse-y, 0px), rgba(78, 128, 247, 0.06), transparent 80%)`,
      }}
    />
  );
}
