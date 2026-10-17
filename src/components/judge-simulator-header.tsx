"use client";

import React from "react";
import Link from "next/link";
import { Monitor, ShieldCheck, Wrench, Landmark, ZapOff, ScanBarcode, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

export type SimulatorView =
  | "kiosk-main"
  | "crisis-form"
  | "facility-form"
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
  const navItems = [
    {
      id: "kiosk-main" as SimulatorView,
      label: "Kiosk Santri",
      icon: <Monitor className="w-3.5 h-3.5" />,
      active:
        currentView === "kiosk-main" ||
        currentView === "crisis-form" ||
        currentView === "facility-form",
    },
    {
      id: "kts-cards" as SimulatorView,
      label: "3 Kartu KTS",
      shortLabel: "KTS",
      icon: <ScanBarcode className="w-3.5 h-3.5 text-emerald-400" />,
      active: currentView === "kts-cards",
    },
    {
      id: "admin-konselor" as SimulatorView,
      label: "Konselor & Satgas",
      shortLabel: "Konselor",
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
      badge: unreadCrisisCount > 0 ? unreadCrisisCount : undefined,
      active: currentView === "admin-konselor",
    },
    {
      id: "admin-sarpras" as SimulatorView,
      label: "Sarpras KTS",
      shortLabel: "Sarpras",
      icon: <Wrench className="w-3.5 h-3.5" />,
      active: currentView === "admin-sarpras",
    },
    {
      id: "admin-kiai" as SimulatorView,
      label: "Kiai Executive",
      shortLabel: "Masyayikh",
      icon: <Landmark className="w-3.5 h-3.5" />,
      active: currentView === "admin-kiai",
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] backdrop-blur-md bg-slate-950/95 text-white border-b border-slate-800/90 shadow-2xl">
      {/* Top Bar Row */}
      <div className="h-14 flex items-center justify-between px-3 sm:px-6">
        {/* Left: System Identity */}
        <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-white p-0.5 flex items-center justify-center shrink-0 border border-emerald-400/50 shadow-sm">
            <img
              src="/logo-shirothul-fuqoha.png"
              alt="Logo PP Salafiyah Shirothul Fuqoha"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-xs font-mono font-bold tracking-wider text-slate-200">
                GardaSantri
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 hidden sm:inline">
                SIMULATOR PENJURIAN
              </span>
            </div>
            <span className="text-[9px] sm:text-[10px] text-emerald-400/90 font-mono tracking-wider leading-none truncate max-w-[150px] sm:max-w-none">
              PP SHIROTHUL FUQOHA&apos;
            </span>
          </div>
        </div>

        {/* Center: Desktop-only Persona Views Switcher */}
        <nav
          aria-label="Simulator Views Desktop"
          className="hidden lg:flex items-center space-x-1 sm:space-x-1.5 bg-slate-900/90 p-1 rounded-full border border-slate-800 shadow-inner"
          role="tablist"
        >
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "px-3 sm:px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 active:scale-95 group",
                item.active
                  ? item.id === "kts-cards"
                    ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 shadow-sm"
                    : "bg-white/20 text-white shadow-sm hover:bg-white/30"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.badge && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-bold bg-rose-500 text-white rounded-full animate-bounce">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Right: Panic Trigger & Portal Petugas */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          <Link
            href="/petugas"
            className="px-2.5 py-1.5 rounded-full bg-sky-950/80 hover:bg-sky-900 text-sky-300 border border-sky-700/60 text-[11px] sm:text-xs font-semibold transition-all flex items-center space-x-1 shadow-sm active:scale-95"
            title="Buka Portal Khusus Petugas Posko"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Portal Petugas</span>
            <span className="sm:hidden">Petugas</span>
          </Link>

          <button
            onClick={onTriggerPanic}
            className="px-2.5 sm:px-3 py-1.5 rounded-full bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/40 text-[11px] sm:text-xs font-semibold transition-all duration-200 flex items-center space-x-1 active:scale-90 hover:shadow-lg hover:shadow-rose-600/30"
            title="Tekan tombol ESC pada keyboard kapan saja untuk menyamarkan layar"
          >
            <ZapOff className="w-3.5 h-3.5 text-rose-400 animate-pulse shrink-0" />
            <span className="hidden sm:inline">[ESC] Panic Wipe</span>
            <span className="sm:hidden font-mono">Panic</span>
          </button>

          <div className="hidden xl:flex items-center space-x-2 bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full text-xs font-mono font-semibold shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span>Panic: &lt;16ms</span>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Persona Switcher Sub-Bar (Swipeable & Touch Friendly) */}
      <div className="lg:hidden border-t border-slate-800/80 bg-slate-900/90 px-2 py-1.5 overflow-x-auto scrollbar-none">
        <nav className="flex items-center space-x-1.5 min-w-max" aria-label="Simulator Views Mobile">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 flex items-center space-x-1.5 active:scale-95 shrink-0",
                item.active
                  ? item.id === "kts-cards"
                    ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/50 shadow-sm font-semibold"
                    : "bg-white/20 text-white border border-white/20 shadow-sm font-semibold"
                  : "text-slate-400 hover:text-white hover:bg-white/10"
              )}
            >
              {item.icon}
              <span>{item.shortLabel || item.label}</span>
              {item.badge && (
                <span className="inline-flex items-center justify-center px-1.5 py-0.2 text-[9px] font-bold bg-rose-500 text-white rounded-full">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
