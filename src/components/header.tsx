"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image"; // Import Image component

import { cn } from "@/lib/utils";
import HeaderAuth from "@/components/header-auth";
import SearchBar from "./ui/SearchBar";

function SparklesCore({ count = 48, particleColor = "#FFFFFF", className = "" }: { count?: number; particleColor?: string; className?: string }) {
  const [particles, setParticles] = useState<Array<{
    left: number;
    top: number;
    size: number;
    delay: number;
    duration: number;
    opacity: number;
    rotate: number;
  }> | null>(null);
  const [animName, setAnimName] = useState("");

  useEffect(() => {
    const newParticles = Array.from({ length: count }).map(() => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      size: 1 + Math.random() * 8,
      delay: Math.random() * 2,
      duration: 1.2 + Math.random() * 1.6,
      opacity: 0.6 + Math.random() * 0.6,
      rotate: Math.random() * 360,
    }));
    setParticles(newParticles);
    setAnimName(`sparkleAnim_${Math.floor(Math.random() * 100000)}`);
  }, [count]);

  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {animName && (
        <style dangerouslySetInnerHTML={{
          __html: `
          @keyframes ${animName} {
            0% { transform: translateY(0) scale(0.6) rotate(0deg); opacity: 0; }
            10% { opacity: 1; }
            50% { transform: translateY(-8px) scale(1) rotate(45deg); opacity: 0.9; }
            100% { transform: translateY(-18px) scale(0.8) rotate(90deg); opacity: 0; }
          }
        ` }} />
      )}

      {particles?.map((p, i) => (
        <span
          key={i}
          style={{
            position: "absolute",
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: particleColor,
            opacity: p.opacity,
            borderRadius: "50%",
            transform: `translate(-50%, -50%) rotate(${p.rotate}deg)`,
            boxShadow: `0 0 ${Math.max(6, p.size)}px ${particleColor}`,
            animation: `${animName} ${p.duration}s linear ${p.delay}s infinite`,
            willChange: "transform, opacity",
          }}
        />
      ))}
    </div>
  );
}

export default function Header() {
  return (
    <nav className={cn("relative shadow mb-6 flex bg-gradient-to-r from-slate-950 via-black to-slate-950 items-center justify-between p-4 gap-3 overflow-hidden")}>
      {/* Sparkles overlay (subtle) */}
      <SparklesCore count={18} particleColor="#FFFFFF" />

      {/* Brand */}
      <div className="flex items-center gap-2 relative z-10">
        <div>
          <Image src="/caimax_logo.jpg" alt="Caimax Properties Logo" width={50} height={50} /> {/* Insert logo image */}
        </div>
        <div className="flex flex-col text-sm md:text-lg hover:shadow-red-500/50 transition-shadow duration-300 relative z-10">
          <Link href="/" className="font-bold text-white hover:text-red-500 relative z-20">
            Caimax Properties
          </Link>

          {/* Visible divider under the brand. Made slightly taller and a bit more opaque so it shows on the dark gradient. */}
          <div className="mt-1 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent z-20" />
        </div>
      </div>

      {/* Center Content (Search) */}
      <div className="flex-1 flex justify-center px-4 relative z-10">
        <div className="w-full max-w-2xl">
          <SearchBar />
        </div>
      </div>

      {/* Right Content (Authentication) */}
      <div className="relative z-10">
        <HeaderAuth />
      </div>
    </nav>
  );
}
