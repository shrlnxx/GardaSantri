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
    <section className="max-w-6xl mx-auto min-h-[calc(100vh-4rem)] pt-6 pb-16 px-4 sm:px-6 flex flex-col items-center justify-between">
      {/* Header & Identity */}
      <div className="text-center max-w-3xl mx-auto mt-2 mb-2 flex flex-col items-center">
        {/* Official Pesantren Logo & Badge */}
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-white p-1 shadow-md border border-emerald-200/80 flex items-center justify-center">
            <img
              src="/logo-shirothul-fuqoha.png"
              alt="Logo PP Salafiyah Shirothul Fuqoha Malang"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50/90 border border-emerald-200/90 text-emerald-900 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
            </span>
            <span className="tracking-wide">
              PP Salafiyah Shirothul Fuqoha&apos; Malang • Anjungan Mandiri Santri
            </span>
          </div>
        </div>

        <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight">
          GardaSantri <span className="text-emerald-600 drop-shadow-sm">Kiosk</span>
        </h1>
        <p className="text-emerald-800 text-base md:text-xl mt-3 font-bold tracking-tight leading-relaxed max-w-2xl mx-auto">
          Tempat Pelaporan Santri Yang Aman
        </p>
        <p className="text-xs text-slate-400 mt-2 max-w-xl mx-auto leading-normal">
          Pilih layanan di bawah. Khusus pelaporan krisis/insiden, Anda memiliki hak penuh menentukan tingkat kerahasiaan:{" "}
          <strong className="text-slate-700 font-semibold">100% Anonim</strong> atau{" "}
          <strong className="text-emerald-700 font-semibold">Terverifikasi KTS</strong>.
        </p>
      </div>

      {/* Main Gateway Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mt-6 max-w-5xl items-stretch">
        {/* Card A: Layanan Fasilitas (Scan Barcode KTS) */}
        <div
          ref={cardFacilityRef}
          onMouseMove={handleCardMouseMove}
          onMouseLeave={handleCardMouseLeave}
          onClick={onSelectFacilityScan}
          className="group bg-gradient-to-br from-emerald-50 via-teal-50/70 to-emerald-100/50 p-8 md:p-10 rounded-3xl cursor-pointer border border-emerald-300/80 transition-all duration-500 ease-out flex flex-col justify-between relative overflow-hidden h-full shadow-lg hover:shadow-2xl hover:border-emerald-400"
        >
          <div className="absolute -right-8 -top-8 w-44 h-44 bg-emerald-300/30 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-white shadow-md border border-emerald-200 flex items-center justify-center text-emerald-600 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                <Wrench className="w-7 h-7" />
              </div>
              <Badge variant="emerald" className="bg-emerald-600/15 text-emerald-900 border-emerald-300/80 shadow-sm">
                Sarana &amp; Prasarana
              </Badge>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-slate-900 group-hover:text-emerald-800 transition-colors tracking-tight">
              Layanan Fasilitas (Scan Barcode KTS)
            </h3>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Pelaporan kerusakan asrama, inventaris kamar, air bersih, kelistrikan, serta pengajuan perlengkapan harian santri secara cepat via pemindaian barcode Kartu Tanda Santri.
            </p>
          </div>

          {/* Barcode Laser Target Bar */}
          <div className="mt-8 pt-5 border-t border-emerald-200/70 flex items-center justify-between text-emerald-800 font-semibold text-sm relative z-10 bg-white/80 backdrop-blur-sm p-3.5 rounded-2xl border border-emerald-200/80 shadow-sm group-hover:border-emerald-400 group-hover:bg-white transition-all overflow-hidden">
            {/* Sweeping Laser Beam */}
            <div className="scan-radar-beam absolute inset-0 w-28 bg-gradient-to-r from-transparent via-rose-500/30 to-transparent pointer-events-none"></div>
            <div className="barcode-laser-line pointer-events-none"></div>

            <span className="flex items-center space-x-2.5 text-xs md:text-sm font-medium text-emerald-900 relative z-10">
              <ScanBarcode className="w-4 h-4 text-rose-600 animate-pulse" />
              <span>Arahkan Barcode KTS ke Scanner Kamera...</span>
            </span>
            <div className="w-9 h-9 rounded-full bg-emerald-600 text-white shadow-sm flex items-center justify-center group-hover:translate-x-1 group-hover:scale-105 group-hover:bg-emerald-700 transition-all relative z-10">
              <ArrowRight className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Card B: Safe Space Crisis Reporting */}
        <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 p-8 md:p-10 rounded-3xl border border-slate-700/80 transition-all duration-500 ease-out flex flex-col justify-between relative overflow-hidden shadow-2xl h-full group/cardb hover:-translate-y-2 hover:shadow-rose-950/30">
          <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-rose-500/15 rounded-full blur-3xl group-hover/cardb:scale-125 transition-transform duration-700 pointer-events-none"></div>

          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div className="w-14 h-14 rounded-2xl bg-slate-800/90 shadow-lg border border-slate-700/90 flex items-center justify-center text-rose-400 group-hover/cardb:border-rose-400/60 transition-colors">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <Badge variant="destructive" className="bg-rose-500/20 text-rose-300 border-rose-500/30">
                Bilik Perlindungan &amp; Pengaduan
              </Badge>
            </div>

            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Bilik Ruang Aman Santri
            </h3>
            <p className="text-slate-300 text-xs md:text-sm mt-3 leading-relaxed">
              Saluran pengaduan kasus perundungan (bullying), kekerasan, intimidasi, dan krisis mental. Tentukan privasi Anda:
            </p>

            {/* Two Quick-Entry Privacy Buttons */}
            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3.5 items-stretch">
              {/* Option 1: 100% Anonymous */}
              <button
                type="button"
                onClick={() => onSelectCrisisMode("ANONYMOUS")}
                className="group/btn relative text-left p-4 rounded-2xl bg-slate-800/90 hover:bg-slate-800 border border-slate-700/80 hover:border-rose-400/90 hover:shadow-lg hover:shadow-rose-950/50 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex flex-col justify-between h-full shadow-sm overflow-hidden"
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
                className="group/btn relative text-left p-4 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-700/60 hover:border-emerald-400 hover:shadow-lg hover:shadow-emerald-950/60 hover:scale-[1.02] active:scale-95 transition-all duration-300 flex flex-col justify-between h-full shadow-sm overflow-hidden"
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

          <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between relative z-10">
            <span className="flex items-center space-x-1.5">
              <HeartHandshake className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>Komitmen Kerahasiaan &amp; Jaminan Anti-Retaliasi</span>
            </span>
            <span className="text-slate-500 font-mono text-[10px] uppercase tracking-wider">
              WebCrypto AEAD
            </span>
          </div>
        </div>
      </div>

      {/* Anonymous Token Status Tracker Bar */}
      <div className="w-full max-w-5xl mt-6">
        <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900/90 to-teal-950/80 border border-emerald-700/60 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5 text-center sm:text-left">
            <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shrink-0">
              <Search className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  Layanan Santri
                </span>
                <span className="text-xs text-slate-200 font-bold">
                  Sudah Pernah Melapor? Cek Respon Konselor
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Masukkan <strong>8-karakter kode token</strong> rahasia Anda untuk melihat alibi pemanggilan dan status penanganan tanpa membuka identitas.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenTracker}
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm flex items-center space-x-2 shadow-md shadow-emerald-950 transition-all active:scale-95 shrink-0"
          >
            <Lock className="w-4 h-4" />
            <span>Lacak Status Tiket</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Bottom Emergency Quick Panic Button */}
      <div className="flex flex-col items-center mt-8 mb-2 w-full max-w-lg mx-auto">
        <div className="relative w-full">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-rose-500 to-rose-700 opacity-60 blur-sm animate-pulse pointer-events-none"></div>
          <button
            type="button"
            onClick={onTriggerPanic}
            className="relative w-full bg-gradient-to-r from-rose-600 via-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white rounded-full px-8 py-3.5 font-bold shadow-xl shadow-rose-600/30 hover:shadow-rose-600/60 border border-rose-400/50 transition-all duration-300 ease-out flex items-center justify-center space-x-3 active:scale-95 group overflow-hidden"
          >
            <AlertOctagon className="w-5 h-5 group-hover:scale-125 transition-transform duration-300 animate-bounce" />
            <span className="text-xs md:text-sm tracking-wider font-extrabold uppercase drop-shadow-sm">
              Tombol Darurat / Tutup Cepat (ESC)
            </span>
          </button>
        </div>
        <span className="text-[11px] text-slate-400 mt-2.5 font-mono text-center flex items-center justify-center space-x-1.5 leading-tight">
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
