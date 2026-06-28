import Link from "next/link";
import React from "react";
import GridShape from "../../components/common/GridShape";
import "../../globals.css";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full bg-[#0B0F17] text-white overflow-hidden flex items-center justify-center">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 flex w-full min-h-screen items-stretch">
        {/* Form Container (Left Column) */}
        <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-6 sm:p-12 z-20">
          <div className="lg:hidden flex flex-col justify-center items-center mb-8">
            <Link href="/" className="flex justify-center mb-2">
              <img
                className="h-16 w-auto object-contain drop-shadow-[0_0_15px_rgba(34,211,238,0.3)] hue-rotate-[190deg] brightness-150 contrast-125"
                src="/logo/dark-logo.webp"
                alt="The Forge logo"
              />
            </Link>
          </div>
          <div className="w-full max-w-md">
            {children}
          </div>
        </div>

        {/* Branding & Visual Hero Panel (Right Column) */}
        <div className="hidden lg:flex w-1/2 bg-[#0E1422]/70 border-l border-white/5 relative flex-col items-center justify-center p-12 overflow-hidden backdrop-blur-md">
          <GridShape />
          <div className="relative z-10 flex flex-col items-center max-w-md text-center p-8 rounded-2xl bg-white/[0.02] border border-white/10 shadow-2xl backdrop-blur-xl">
            <Link href="/" className="block mb-6 group">
              <img
                className="h-20 w-auto object-contain drop-shadow-[0_0_20px_rgba(34,211,238,0.4)] group-hover:scale-105 transition-transform duration-300 hue-rotate-[190deg] brightness-150 contrast-125"
                src="/logo/dark-logo.webp"
                alt="The Forge logo"
              />
            </Link>
            <h3 className="text-xl font-bold text-white mb-2">
              The Forge Dashboard
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Welcome to your executive control center. Sign in to manage your portfolio content, projects, and site settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
