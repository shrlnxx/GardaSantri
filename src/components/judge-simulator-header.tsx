"use client";

import React from "react";
import Link from "next/link";
import { Monitor, ShieldCheck, Wrench, Landmark, ZapOff, ScanBarcode, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export type SimulatorView =
  | "kiosk-main"
  | "crisis-form"
  | "admin-konselor"
  | "admin-sarpras"
  | "admin-kiai"
  | "kts-cards";

interface JudgeSimulatorHeaderProps {
  currentView: SimulatorView;
  onViewChange: (view: SimulatorView) => void;
  onTriggerPanic: () => void;
  unreadCrisisCount?: number;
}

export function JudgeSimulatorHeader({
  currentView,
  onViewChange,
  onTriggerPanic,
  unreadCrisisCount = 2,
}: JudgeSimulatorHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 h-14 backdrop-blur-md bg-slate-950/95 text-white flex items-center justify-between px-4 sm:px-6 border-b border-slate-800 z-[100] shadow-2xl">
      {/* Left: System Identity */}
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0 border border-emerald-400/50 shadow-sm">
          <img
            src="/logo-shirothul-fuqoha.png"
            alt="Logo PP Salafiyah Shirothul Fuqoha"
            className="w-full h-full object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-mono font-bold tracking-wider text-slate-200">
            SANTRIVISION 2026
          </span>
          <span className="text-[10px] text-emerald-400 font-mono tracking-widest leading-none">
            JUDGE SIMULATOR • NEXT.JS
          </span>
        </div>
        <span className="hidden xl:inline-block px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-700/60 ml-2">
          PP SALAFIYAH SHIROTHUL FUQOHA&apos;
        </span>
      </div>

      {/* Center: Persona Views Navigation Switcher */}
      <nav
        aria-label="Simulator Views"
        className="flex items-center space-x-1 sm:space-x-1.5 bg-slate-900/90 p-1 rounded-full border border-slate-800 shadow-inner"
        role="tablist"
      >
        <button
          onClick={() => onViewChange("kiosk-main")}
          className={cn(
            "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out flex items-center space-x-1.5 active:scale-95",
            currentView === "kiosk-main" || currentView === "crisis-form"
              ? "bg-white/20 text-white shadow-sm hover:bg-white/30"
              : "text-slate-400 hover:text-white hover:bg-white/10"
          )}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Kiosk Santri</span>
        </button>

        <button
          onClick={() => onViewChange("kts-cards")}
          className={cn(
            "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out flex items-center space-x-1.5 active:scale-95 group",
            currentView === "kts-cards"
              ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 shadow-sm"
              : "text-slate-400 hover:text-white hover:bg-white/10"
          )}
        >
          <ScanBarcode className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
          <span className="hidden md:inline">3 Kartu KTS</span>
          <span className="md:hidden">KTS</span>
        </button>

        <button
          onClick={() => onViewChange("admin-konselor")}
          className={cn(
            "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out flex items-center space-x-1.5 active:scale-95 group",
            currentView === "admin-konselor"
              ? "bg-white/20 text-white shadow-sm hover:bg-white/30"
              : "text-slate-400 hover:text-white hover:bg-white/10"
          )}
        >
          <ShieldCheck className="w-3.5 h-3.5 group-hover:rotate-6 transition-transform" />
          <span>Konselor &amp; Satgas</span>
          {unreadCrisisCount > 0 && (
            <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-bold bg-rose-500/90 text-white rounded-full animate-bounce">
              {unreadCrisisCount}
            </span>
          )}
        </button>

        <button
          onClick={() => onViewChange("admin-sarpras")}
          className={cn(
            "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out flex items-center space-x-1.5 active:scale-95 group",
            currentView === "admin-sarpras"
              ? "bg-white/20 text-white shadow-sm hover:bg-white/30"
              : "text-slate-400 hover:text-white hover:bg-white/10"
          )}
        >
          <Wrench className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
          <span>Sarpras KTS</span>
        </button>

        <button
          onClick={() => onViewChange("admin-kiai")}
          className={cn(
            "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 ease-out flex items-center space-x-1.5 active:scale-95 group",
            currentView === "admin-kiai"
              ? "bg-white/20 text-white shadow-sm hover:bg-white/30"
              : "text-slate-400 hover:text-white hover:bg-white/10"
          )}
        >
          <Landmark className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Kiai Executive</span>
        </button>
      </nav>

      {/* Right: Panic Trigger & Portal Petugas */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <Link
          href="/petugas"
          className="px-2.5 py-1.5 rounded-full bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-700/60 text-xs font-semibold transition-all flex items-center space-x-1 shadow-sm active:scale-95"
          title="Buka Dashboard Khusus Petugas"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Portal Petugas</span>
        </Link>

        <button
          onClick={onTriggerPanic}
          className="px-3 py-1.5 rounded-full bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/40 text-xs font-semibold transition-all duration-200 flex items-center space-x-1.5 active:scale-90 hover:shadow-lg hover:shadow-rose-600/30"
          title="Tekan tombol ESC pada keyboard kapan saja"
        >
          <ZapOff className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
          <span className="hidden sm:inline">[ESC] Panic Wipe</span>
          <span className="sm:hidden">ESC</span>
        </button>
        <div className="hidden md:flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-mono font-semibold shadow-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span>Panic SLA: &lt;16ms</span>
        </div>
      </div>
    </header>
  );
}
