"use client";

import React, { useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { KartuTandaSantriViewer } from "@/components/kartu-tanda-santri-viewer";

export default function KtsPrintPage() {
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-16">
      {/* Top Banner Navigation */}
      <div className="bg-slate-950 text-white px-6 py-3 border-b border-slate-800 flex items-center justify-between print:hidden">
        <Link
          href="/"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-emerald-400 hover:text-emerald-300"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Kiosk Utama</span>
        </Link>
        <span className="text-xs font-mono text-slate-400">
          PP SALAFIYAH SHIROTHUL FUQOHA&apos; • MODUL CETAK KTS
        </span>
      </div>

      <KartuTandaSantriViewer onShowToast={showToast} />

      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] max-w-md w-full px-4 animate-in fade-in duration-200">
          <div className="bg-slate-950/95 border border-emerald-500/50 shadow-2xl text-emerald-300 text-xs sm:text-sm font-medium py-3 px-4 rounded-2xl flex items-center justify-center">
            {toastMsg}
          </div>
        </div>
      )}
    </div>
  );
}
