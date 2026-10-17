"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { Wrench, ArrowRight, ShieldAlert, Lock, BadgeCheck, HeartHandshake, AlertOctagon, EyeOff, ScanBarcode, Search } from "lucide-react";
import { Badge } from "./ui/badge";

interface KioskGatewayProps {
  onSelectFacilityScan: () => void;
  onSelectCrisisMode: (mode: "ANONYMOUS" | "VERIFIED_KTS") => void;
  onTriggerPanic: () => void;
  onOpenTracker: () => void;
}

export function KioskGateway({
  onSelectFacilityScan,
  onSelectCrisisMode,
  onTriggerPanic,
  onOpenTracker,
}: KioskGatewayProps) {
  const cardFacilityRef = useRef<HTMLDivElement>(null);

  const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // Disable 3D tilt on touch screens or small viewports to avoid layout shake
    if (typeof window !== "undefined" && window.matchMedia("(max-width: 768px), (pointer: coarse)").matches) return;
    const card = cardFacilityRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = (y / (rect.height / 2)) * -4;
    const tiltY = (x / (rect.width / 2)) * 4;
    card.style.transform = `perspective(1000px) rotateX(${tiltX.toFixed(2)}deg) rotateY(${tiltY.toFixed(2)}deg) translateY(-8px) scale(1.015)`;
  };

  const handleCardMouseLeave = () => {
    if (cardFacilityRef.current) {
      cardFacilityRef.current.style.transform = "";
    }
  };

  return (
    <section className="max-w-6xl mx-auto min-h-[calc(100vh-6rem)] pt-2 sm:pt-6 pb-12 sm:pb-16 px-3.5 sm:px-6 flex flex-col items-center justify-between">
      {/* Header & Identity */}
      <div className="text-center max-w-3xl mx-auto mt-2 mb-2 flex flex-col items-center">
        {/* Official Pesantren Logo & Badge */}
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:space-x-3 mb-3 sm:mb-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white p-1 shadow-md border border-emerald-200/80 flex items-center justify-center shrink-0">
            <img
              src="/logo-shirothul-fuqoha.png"
              alt="Logo PP Salafiyah Shirothul Fuqoha Malang"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50/90 border border-emerald-200/90 text-emerald-900 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full text-[11px] sm:text-xs font-semibold shadow-sm backdrop-blur-sm text-center">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="tracking-wide">
              PP Salafiyah Shirothul Fuqoha&apos; Malang • Anjungan Mandiri
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          GardaSantri <span className="text-emerald-600 drop-shadow-sm">Kiosk</span>
        </h1>
        <p className="text-emerald-800 text-sm sm:text-base md:text-xl mt-2 sm:mt-3 font-bold tracking-tight leading-relaxed max-w-2xl mx-auto">
          Tempat Pelaporan Santri Yang Aman
        </p>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto leading-relaxed px-2">
          Pilih layanan di bawah. Khusus pelaporan krisis/insiden, Anda memiliki hak penuh menentukan tingkat kerahasiaan:{" "}
          <strong className="text-slate-800 font-semibold">100% Anonim</strong> atau{" "}
          <strong className="text-emerald-700 font-semibold">Terverifikasi KTS</strong>.
        </p>
      </div>

      {/* Main Gateway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8 w-full mt-5 sm:mt-6 max-w-5xl items-stretch">
        {/* Card A: Layanan Fasilitas (Scan Barcode KTS) */}
        <div
          ref={cardFacilityRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          onClick={onSelectFacilityScan}
          className="group bg-gradient-to-br from-emerald-50 via-teal-50/70 to-emerald-100/50 p-6 sm:p-8 md:p-10 rounded-3xl cursor-pointer border border-emerald-300/80 transition-all duration-300 ease-out flex flex-col justify-between relative overflow-hidden h-full shadow-lg hover:shadow-2xl hover:border-emerald-400 active:scale-[0.99]"
        >
          <div className="absolute -right-8 -top-8 w-44 h-44 bg-emerald-300/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white shadow-md border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Wrench className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <Badge variant="emerald" className="bg-emerald-600/15 text-emerald-900 border-emerald-300/80 shadow-sm text-[11px] sm:text-xs">
                Sarana &amp; Prasarana
              </Badge>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-emerald-800 transition-colors tracking-tight">
              Layanan Fasilitas (Scan Barcode KTS)
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed">
              Pelaporan kerusakan asrama, inventaris kamar, air bersih, kelistrikan, serta pengajuan perlengkapan harian santri secara cepat via pemindaian barcode Kartu Tanda Santri.
            </p>
          </div>

          {/* Barcode Laser Target Bar */}
          <div className="mt-6 sm:mt-8 pt-4 sm:pt-5 border-t border-emerald-200/70 flex items-center justify-between text-emerald-800 font-semibold text-xs sm:text-sm relative z-10 bg-white/80 backdrop-blur-sm p-3 sm:p-3.5 rounded-2xl border border-emerald-200/80 shadow-sm group-hover:border-emerald-400 group-hover:bg-white transition-all overflow-hidden gap-2">
            {/* Sweeping Laser Beam */}
            <div className="scan-radar-beam absolute inset-0 w-28 bg-gradient-to-r from-transparent via-rose-500/30 to-transparent pointer-events-none"></div>
            <div className="barcode-laser-line pointer-events-none"></div>

            <span className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-emerald-900 relative z-10 truncate">
              <ScanBarcode className="w-4 h-4 text-rose-600 animate-pulse shrink-0" />
              <span className="truncate">Arahkan Barcode KTS ke Kamera...</span>
            </span>
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 text-white shadow-sm flex items-center justify-center group-hover:translate-x-1 group-hover:scale-105 group-hover:bg-emerald-700 transition-all relative z-10 shrink-0">
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>

        {/* Card B: Safe Space Crisis Reporting */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-6 sm:p-8 md:p-10 rounded-3xl border border-slate-700/80 transition-all duration-300 ease-out flex flex-col justify-between relative overflow-hidden shadow-2xl h-full group/cardb hover:-translate-y-1 hover:shadow-rose-950/30">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl group-hover/cardb:scale-125 transition-transform duration-700 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-800/90 shadow-lg border border-slate-700/90 flex items-center justify-center text-rose-400 group-hover/cardb:border-rose-400/60 transition-colors">
                <ShieldAlert className="w-6 h-6 sm:w-7 sm:h-7" />
              </div>
              <Badge variant="destructive" className="bg-rose-500/20 text-rose-300 border-rose-500/30 text-[11px] sm:text-xs">
                Bilik Perlindungan &amp; Pengaduan
              </Badge>
            </div>

            <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-tight">
              Bilik Ruang Aman Santri
            </h3>
            <p className="text-slate-300 text-xs sm:text-sm mt-2 sm:mt-3 leading-relaxed">
              Saluran pengaduan kasus perundungan (bullying), kekerasan, intimidasi, dan krisis mental. Tentukan privasi Anda:
            </p>

            {/* Two Quick-Entry Privacy Buttons */}
            <div className="mt-4 sm:mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-3.5 items-stretch">
              {/* Option 1: 100% Anonymous */}
              <button
                type="button"
                onClick={() => onSelectCrisisMode("ANONYMOUS")}
                className="group/btn relative text-left p-3.5 sm:p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-rose-400/90 hover:shadow-lg hover:shadow-rose-950/50 active:scale-95 transition-all duration-200 flex flex-col justify-between h-full shadow-sm overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-400 flex items-center space-x-1.5">
                      <Lock className="w-3.5 h-3.5 animate-pulse" />
                      <span>100% Anonim</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover/btn:text-rose-400 group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    Tanpa nama &amp; KTS. Diberikan 8-digit kode token unik untuk komunikasi aman.
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-mono text-rose-300/80 group-hover/btn:text-rose-300 uppercase tracking-wider block font-semibold">
                  Zero-Knowledge Mode →
                </span>
              </button>

              {/* Option 2: Verified KTS */}
              <button
                type="button"
                onClick={() => onSelectCrisisMode("VERIFIED_KTS")}
                className="group/btn relative text-left p-3.5 sm:p-4 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/60 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/60 active:scale-95 transition-all duration-200 flex flex-col justify-between h-full shadow-sm overflow-hidden"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5">
                      <BadgeCheck className="w-3.5 h-3.5 animate-pulse" />
                      <span>Terverifikasi KTS</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-emerald-400 group-hover/btn:text-white group-hover/btn:translate-x-1 transition-transform" />
                  </div>
                  <p className="text-[11px] text-slate-300 mt-2 leading-relaxed">
                    Identitas resmi terlampir untuk pendampingan personal langsung Satgas &amp; Konselor.
                  </p>
                </div>
                <span className="mt-3 text-[10px] font-mono text-emerald-300/80 group-hover/btn:text-emerald-300 uppercase tracking-wider block font-semibold">
                  Jalur Cepat &amp; Terlindungi →
                </span>
              </button>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 pt-3.5 sm:pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between relative z-10">
            <span className="flex items-center space-x-1.5 truncate mr-2">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400 animate-pulse shrink-0" />
              <span className="truncate">Komitmen Kerahasiaan Santri</span>
            </span>
            <span className="text-slate-500 font-mono text-[10px] uppercase tracking-wider shrink-0">
              WebCrypto AEAD
            </span>
          </div>
        </div>
      </div>

      {/* Anonymous Token Status Tracker Bar */}
      <div className="w-full max-w-5xl mt-5 sm:mt-6">
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-teal-950/80 border border-emerald-700/60 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <Search className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Layanan Santri
                </span>
                <span className="text-xs sm:text-sm text-slate-200 font-bold">
                  Sudah Pernah Melapor? Cek Respon Konselor
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Masukkan <strong>8-karakter kode token</strong> rahasia Anda untuk melihat alibi pemanggilan dan status penanganan tanpa membuka identitas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenTracker}
            className="w-full sm:w-auto justify-center px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-md shadow-emerald-950 transition-all active:scale-95 shrink-0"
          >
            <Lock className="w-4 h-4" />
            <span>Lacak Status Tiket</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Emergency Quick Panic Button */}
      <div className="flex flex-col items-center mt-6 sm:mt-8 mb-2 w-full max-w-lg mx-auto px-2">
        <div className="relative w-full">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-500 to-rose-700 opacity-60 blur-sm animate-pulse pointer-events-none"></div>
          <button
            type="button"
            onClick={onTriggerPanic}
            className="relative w-full bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-full px-5 sm:px-8 py-3.5 font-bold shadow-xl shadow-rose-600/30 hover:shadow-rose-600/60 border border-rose-400/50 transition-all duration-200 ease-out flex items-center justify-center space-x-2.5 sm:space-x-3 active:scale-95 group overflow-hidden"
          >
            <AlertOctagon className="w-5 h-5 group-hover:scale-125 transition-transform duration-300 animate-bounce shrink-0" />
            <span className="text-xs sm:text-sm tracking-wider font-extrabold uppercase drop-shadow-sm text-center">
              Tombol Darurat / Tutup Cepat (ESC)
            </span>
          </button>
        </div>
        <span className="text-[10px] sm:text-[11px] text-slate-400 mt-2.5 font-mono text-center flex items-center justify-center space-x-1.5 leading-tight px-2">
          <EyeOff className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>Jika ada yang mendekat saat Anda melapor, tekan tombol ini atau tombol ESC untuk menyamarkan layar seketika</span>
        </span>
      </div>

      {/* Discreet Officer Portal Access */}
      <div className="mt-4 text-center">
        <Link
          href="/petugas"
          className="inline-flex items-center space-x-1 text-[10px] text-slate-400/80 hover:text-slate-600 font-mono transition-colors opacity-60 hover:opacity-100"
          title="Area Khusus Petugas Posko (Memerlukan PIN Keamanan)"
        >
          <Lock className="w-3 h-3 text-slate-400" />
          <span>Portal Petugas (PIN Terproteksi)</span>
        </Link>
      </div>
    </section>
  );
}
