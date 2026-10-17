"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";

interface PanicWipeOverlayProps {
  isVisible: boolean;
  onDismiss: () => void;
}

interface PrayerTime {
  name: string;
  time: string;
  isNext?: boolean;
}

export function PanicWipeOverlay({ isVisible, onDismiss }: PanicWipeOverlayProps) {
  const [clockString, setClockString] = useState("18:02:19");
  const [dateString, setDateString] = useState("Jumat Legi, 14 Sya'ban 1447 H • 15 Oktober 2026");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, "0");
      const m = String(now.getMinutes()).padStart(2, "0");
      const s = String(now.getSeconds()).padStart(2, "0");
      setClockString(`${h}:${m}:${s}`);

      const days = ["Ahad", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const dayName = days[now.getDay()];
      setDateString(`${dayName}, 14 Sya'ban 1447 H • 15 Oktober 2026`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isVisible) return null;

  const prayerSchedule: PrayerTime[] = [
    { name: "Subuh", time: "04:18" },
    { name: "Terbit", time: "05:34" },
    { name: "Dzuhur", time: "11:52" },
    { name: "Ashar", time: "15:10" },
    { name: "Maghrib", time: "17:58", isNext: true },
    { name: "Isya'", time: "19:08" },
  ];

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      onClick={onDismiss}
      className="fixed inset-0 z-[150] bg-[#031b11] text-slate-100 flex flex-col justify-between p-4 sm:p-8 md:p-10 select-none cursor-pointer overflow-y-auto animate-in fade-in duration-0"
    >
      {/* Background Architectural Islamic Arabesque Motif & Radial Lighting */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `radial-gradient(circle at 50% 50%, #38bdf8 1.2px, transparent 1.2px),
            linear-gradient(45deg, transparent 48%, #10b981 49%, #10b981 51%, transparent 52%),
            linear-gradient(-45deg, transparent 48%, #10b981 49%, #10b981 51%, transparent 52%)`,
          backgroundSize: "48px 48px, 48px 48px, 48px 48px",
        }}
      />

      {/* Harmonic Ambient Lights based on Official Logo Colors (Emerald + Cyan-Blue + Gold) */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[700px] h-[320px] bg-sky-500/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute top-10 right-1/4 w-[600px] h-[300px] bg-emerald-500/12 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[260px] bg-amber-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Main Content Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-6xl mx-auto flex flex-col justify-between min-h-full relative z-10 py-2 sm:py-0"
      >
        {/* 1. Header: Authentic Official Logo & Live Clock */}
        <header className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-emerald-900/50 gap-3 sm:gap-4">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Official Logo Crest Container */}
            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-white p-1 sm:p-1.5 shadow-xl shadow-emerald-950/80 border-2 border-emerald-500/40 flex items-center justify-center shrink-0">
              <Image
                src="/logo-shirothul-fuqoha.png"
                alt="Logo Pondok Pesantren Salafiyah Shirothul Fuqoha Malang"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800/60">
                  Pesantren Salafiyah
                </span>
                <span className="text-[9px] sm:text-[10px] text-emerald-400 font-medium tracking-wider">
                  Malang • Jawa Timur
                </span>
              </div>
              <h1 className="text-base sm:text-2xl font-bold tracking-tight text-white mt-1">
                Pondok Pesantren Salafiyah Shirothul Fuqoha&apos;
              </h1>
              <p className="text-[11px] sm:text-xs text-emerald-300/80 font-medium">
                Pusat Informasi Waktu Ibadah &amp; Mutiara Hikmah Santri
              </p>
            </div>
          </div>

          <div className="sm:text-right flex sm:flex-col justify-between items-baseline sm:items-end">
            <div className="flex items-baseline space-x-1.5 sm:space-x-2">
              <span className="text-2xl sm:text-5xl font-mono font-bold tracking-tight text-sky-100 tabular-nums">
                {clockString}
              </span>
              <span className="text-[10px] sm:text-xs font-semibold text-sky-400 font-mono">WIB</span>
            </div>
            <p className="text-[10px] sm:text-xs text-emerald-300/80 tracking-wider mt-0.5 sm:mt-1 font-medium">
              {dateString}
            </p>
          </div>
        </header>

        {/* 2. Centerpiece: Sacred Reflection Plaque Harmonized with Logo Identity */}
        <section className="my-auto py-4 sm:py-8 max-w-4xl mx-auto w-full text-center flex flex-col items-center">
          {/* Subtle Gilded Label matched to the Logo's Yellow Banner */}
          <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full bg-emerald-950/80 border border-amber-500/40 text-[10px] sm:text-[11px] font-medium text-amber-300 tracking-wider mb-3 sm:mb-5 shadow-sm">
            <span>Kalam Mutiara • Doa Kebaikan Dunia &amp; Akhirat</span>
          </div>

          {/* Basmalah */}
          <div className="py-1 sm:py-2">
            <p className="font-arabic text-2xl sm:text-4xl md:text-5xl text-amber-100/95 leading-relaxed tracking-wide drop-shadow-sm">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
          </div>

          {/* Main Ayat Calligraphy */}
          <div className="py-1 sm:py-2 px-2 sm:px-4 max-w-3xl">
            <p className="font-arabic text-xl sm:text-3xl md:text-4xl text-emerald-50 leading-[1.8] sm:leading-[2] tracking-normal font-normal">
              رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ
            </p>
          </div>

          {/* Translation */}
          <p className="text-[11px] sm:text-sm text-emerald-200/80 max-w-2xl mt-2 sm:mt-3 leading-relaxed font-light italic px-2 sm:px-4">
            &ldquo;Wahai Tuhan kami, anugerahkanlah kepada kami kebaikan di dunia dan kebaikan di akhirat, serta peliharalah kami dari siksa api neraka.&rdquo;
          </p>
          <span className="text-[10px] sm:text-[11px] text-amber-300/80 uppercase tracking-widest font-semibold mt-1 sm:mt-2">
            Surah Al-Baqarah : 201
          </span>

          {/* Authentic Daily Agenda Ticker with Shirothul Fuqoha details */}
          <div className="mt-8 w-full max-w-2xl bg-emerald-950/50 border border-emerald-800/50 rounded-2xl px-5 py-3 flex items-center justify-between text-xs backdrop-blur-sm shadow-inner">
            <span className="font-bold text-amber-300 text-[11px] uppercase tracking-wider shrink-0 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
              Agenda Pesantren
            </span>
            <span className="truncate ml-3 text-slate-200 font-light">
              Kajian Ba&apos;da Maghrib: Kitab Fathul Qorib &amp; Ta&apos;lim Muta&apos;allim di Masjid Jami&apos;
            </span>
          </div>
        </section>

        {/* 3. Prayer Times: Clean Grid with Logo-Harmonized Highlights */}
        <section className="pt-6 border-t border-emerald-900/50">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
            {prayerSchedule.map((p) => {
              const highlight = p.isNext;
              return (
                <div
                  key={p.name}
                  className={`py-3.5 px-3 rounded-2xl text-center transition-all duration-300 ${
                    highlight
                      ? "bg-gradient-to-b from-sky-900/70 via-emerald-900/90 to-emerald-950/90 border-2 border-sky-400/70 shadow-xl shadow-sky-950/50"
                      : "bg-emerald-950/40 border border-emerald-900/50 hover:border-emerald-800/80"
                  }`}
                >
                  <div className="flex items-center justify-center space-x-1">
                    <span
                      className={`text-[11px] font-medium uppercase tracking-wider ${
                        highlight ? "text-amber-300 font-bold" : "text-emerald-400/90"
                      }`}
                    >
                      {p.name}
                    </span>
                    {highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse ml-0.5" />
                    )}
                  </div>
                  <div
                    className={`text-xl sm:text-2xl font-mono font-bold mt-1 tabular-nums ${
                      highlight ? "text-white" : "text-emerald-100/90"
                    }`}
                  >
                    {p.time}
                  </div>
                  <span
                    className={`text-[9px] uppercase tracking-wider block mt-0.5 ${
                      highlight ? "text-sky-300 font-semibold" : "text-emerald-500/70"
                    }`}
                  >
                    {highlight ? "Waktu Berikutnya" : "Jadwal Shalat"}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 4. Natural Kiosk Footer */}
        <footer className="flex flex-col sm:flex-row items-center justify-between pt-6 mt-2 text-xs text-emerald-400/70 gap-3">
          <div className="flex items-center space-x-2 text-[11px] text-emerald-300/70 font-light">
            <span>Anjungan Mandiri Santri</span>
            <span>•</span>
            <span>PP Salafiyah Shirothul Fuqoha&apos; Malang</span>
          </div>

          <button
            onClick={onDismiss}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-800 to-teal-800 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-semibold border border-emerald-600/50 transition-all shadow-md active:scale-95"
          >
            Lanjutkan ke Layanan Kiosk
          </button>
        </footer>
      </div>
    </div>
  );
}
