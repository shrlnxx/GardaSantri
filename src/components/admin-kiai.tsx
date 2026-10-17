"use client";

import React from "react";
import { BookMarked } from "lucide-react";
import { Card } from "./ui/card";

export function AdminKiai() {
  return (
    <section className="max-w-7xl mx-auto min-h-[calc(100vh-6rem)] pt-2 sm:pt-6 pb-12 sm:pb-16 px-3.5 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5 sm:pb-6 mb-6 sm:mb-8">
        <div className="flex items-start space-x-3.5 sm:space-x-4">
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white p-1 shadow-sm border border-slate-200 flex items-center justify-center shrink-0">
            <img
              src="/logo-shirothul-fuqoha.png"
              alt="Logo PP Salafiyah Shirothul Fuqoha"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 truncate">
                Dewan Masyayikh &amp; Pimpinan Pondok
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
              Laporan Eksekutif Iklim Keamanan &amp; Kesejahteraan Santri
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Analisis tren agregat tanpa kompromi data privasi: Tingkat kepuasan fasilitas vs kepatuhan perlindungan santri (Safe Sanctuary).
            </p>
          </div>
        </div>

        <div className="text-[11px] sm:text-xs font-mono text-slate-500 bg-slate-100 px-3 py-1.5 sm:py-2 rounded-xl border border-slate-200 self-start md:self-auto shrink-0">
          Tahun Ajaran: <span className="font-bold text-slate-800">1447-1448 H / 2026</span>
        </div>
      </div>

      {/* Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
        <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 hover:-translate-y-1 transition-transform">
          <span className="text-[10px] sm:text-xs font-mono uppercase text-slate-400 font-semibold block">Indeks Ruang Aman</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600 font-mono mt-1 sm:mt-2">98.4%</div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">↑ 3.8% via KTS &amp; ZK</p>
        </Card>

        <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 hover:-translate-y-1 transition-transform">
          <span className="text-[10px] sm:text-xs font-mono uppercase text-slate-400 font-semibold block">Respon Krisis</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-rose-600 font-mono mt-1 sm:mt-2">&lt; 3.2 Jam</div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">SLA Target: 6.0 Jam</p>
        </Card>

        <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 hover:-translate-y-1 transition-transform">
          <span className="text-[10px] sm:text-xs font-mono uppercase text-slate-400 font-semibold block">Fasilitas Sarpras</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-teal-600 font-mono mt-1 sm:mt-2">91.2%</div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">48 Tiket tuntas bulan ini</p>
        </Card>

        <Card className="p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-sm border border-slate-200 hover:-translate-y-1 transition-transform">
          <span className="text-[10px] sm:text-xs font-mono uppercase text-slate-400 font-semibold block">Panic SLA RAM</span>
          <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600 font-mono mt-1 sm:mt-2">12.4 ms</div>
          <p className="text-[11px] sm:text-xs text-slate-500 mt-1">Hardware Lolos Uji</p>
        </Card>
      </div>

      {/* Executive Narrative Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-xl">
        <h3 className="text-lg sm:text-xl font-bold mb-3 flex items-center space-x-2">
          <BookMarked className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>Tausiyah &amp; Arahan Kebijakan Pesantren</span>
        </h3>
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed max-w-4xl">
          &ldquo;Sistem ini dihadirkan untuk mewujudkan prinsip <i>Dharuriyyat al-Khams</i>, khususnya perlindungan jiwa (<i>Hifz an-Nafs</i>) dan kehormatan santri (<i>Hifz al-&apos;Ird</i>). Kiosk fisik memungkinkan santri yang terintimidasi tetap memiliki akses pertolongan tanpa rasa takut terhadap stigma sosial asrama. Keberadaan opsi KTS terverifikasi memberi jalur pendampingan hukum dan psikologis secara cepat bagi santri yang siap didampingi secara langsung.&rdquo;
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-mono text-emerald-400 border-t border-slate-800 pt-4">
          <span>• Status Keamanan: Sangat Kondusif</span>
          <span>• Audit Trail: Terverifikasi Kriptografis WebCrypto</span>
          <span>• Arsitektur: Offline-First Docker / SQLite LAN</span>
        </div>
      </div>
    </section>
  );
}
