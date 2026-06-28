"use client";

import React, { useEffect, useState } from "react";
import { FaGithub, FaJava } from "react-icons/fa";
import { 
  SiPhp, 
  SiLaravel, 
  SiIntellijidea, 
  SiPostman, 
  SiSelenium 
} from "react-icons/si";
import { VscVscode } from "react-icons/vsc";

const icons = [
  SiPhp,
  SiLaravel,
  FaJava,
  SiIntellijidea,
  VscVscode,
  FaGithub,
  SiPostman,
  SiSelenium,
  SiLaravel,  // Duplicated to increase frequency
  FaGithub,   // Duplicated to increase frequency
  SiSelenium, // Duplicated to increase frequency
];

const snippets = [
  "Route::get('/api/users', [UserController::class, 'index']);",
  "public void testAuthFlow() {",
  "Assert.assertEquals(200, res.status);",
  "$user->posts()->where('active', true)->get();",
  "public static void main(String[] args)",
  "const [data, setData] = useState(null);",
  "composer require laravel/sanctum",
  "System.out.println(\"Testing system backend...\");",
  "auth()->attempt($credentials)",
  "@Test public void verifyDatabaseConnection()",
  "driver.findElement(By.id(\"submit\")).click();",
  "git commit -m \"feat: add db layer\"",
  "php artisan make:model Post -m",
  "mvn clean install",
  "public class DatabaseConnector {"
];

interface BackdropItem {
  id: number;
  type: "icon" | "snippet";
  contentIndex: number;
  top: number; // percentage
  left: number; // percentage
  rotate: number; // degrees
  scale: number;
  delay: string;
  duration: string;
}

export default function ScatteredBackdrop() {
  const [items, setItems] = useState<BackdropItem[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const generated: BackdropItem[] = [];
    const totalItems = 28; // 14 icons, 14 snippets

    for (let i = 0; i < totalItems; i++) {
      const type = i % 2 === 0 ? "icon" : "snippet";
      
      // Distribute evenly across a grid, then apply random jitter
      const row = Math.floor(i / 7);
      const col = i % 7;
      
      const baseTop = 8 + row * 22; // ranges from 8% to 74%
      const baseLeft = 6 + col * 13; // ranges from 6% to 84%
      
      const jitterTop = (Math.random() - 0.5) * 12;
      const jitterLeft = (Math.random() - 0.5) * 10;
      
      const top = Math.min(Math.max(baseTop + jitterTop, 3), 90);
      const left = Math.min(Math.max(baseLeft + jitterLeft, 3), 90);
      
      const rotate = Math.floor(Math.random() * 40) - 20; // -20 to 20 degrees
      const scale = parseFloat((0.85 + Math.random() * 0.35).toFixed(2)); // 0.85 to 1.2
      
      // Randomize animation delay and duration client-side
      const durationVal = 6 + Math.random() * 4; // 6s to 10s
      const duration = `${durationVal.toFixed(1)}s`;
      const delay = `-${(Math.random() * durationVal).toFixed(1)}s`;
      
      generated.push({
        id: i,
        type,
        contentIndex: i,
        top,
        left,
        rotate,
        scale,
        delay,
        duration,
      });
    }

    setItems(generated);
  }, []);

  if (!mounted) return null;

  const renderItem = (item: BackdropItem) => {
    if (item.type === "icon") {
      const IconComponent = icons[item.contentIndex % icons.length];
      return <IconComponent style={{ width: "100%", height: "100%" }} />;
    } else {
      const snippetText = snippets[item.contentIndex % snippets.length];
      return (
        <span className="font-mono text-xs whitespace-nowrap block">
          {snippetText}
        </span>
      );
    }
  };

  return (
    <>
      {/* Base Layer - Ultra Subtle Muted Base */}
      <div 
        className="pointer-events-none fixed inset-0 z-[-10] select-none text-white/50 lg:block hidden"
        style={{ opacity: 0.03 }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute animate-float-drift will-change-transform"
            style={{
              top: `${item.top}%`,
              left: `${item.left}%`,
              animationDelay: item.delay,
              animationDuration: item.duration,
            }}
          >
            <div
              style={{
                transform: `translate(-50%, -50%) rotate(${item.rotate}deg) scale(${item.scale})`,
                width: item.type === "icon" ? "2.25rem" : "auto",
                height: item.type === "icon" ? "2.25rem" : "auto",
              }}
            >
              {renderItem(item)}
            </div>
          </div>
        ))}
      </div>

      {/* Spotlight Layer - Illuminated Overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[-10] select-none text-primary lg:block hidden"
        style={{
          opacity: 0.20,
          maskImage: `radial-gradient(180px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 20%, transparent 100%)`,
          WebkitMaskImage: `radial-gradient(180px at var(--mouse-x, -1000px) var(--mouse-y, -1000px), black 20%, transparent 100%)`,
        }}
      >
        {items.map((item) => (
          <div
            key={item.id}
            className="absolute animate-float-drift will-change-transform"
            style={{
              top: `${item.top}%`,
              left: `${item.left}%`,
              animationDelay: item.delay,
              animationDuration: item.duration,
            }}
          >
            <div
              style={{
                transform: `translate(-50%, -50%) rotate(${item.rotate}deg) scale(${item.scale})`,
                width: item.type === "icon" ? "2.25rem" : "auto",
                height: item.type === "icon" ? "2.25rem" : "auto",
              }}
            >
              {renderItem(item)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
