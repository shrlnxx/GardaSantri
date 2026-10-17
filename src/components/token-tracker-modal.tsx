"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  X,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Lock,
  ArrowRight,
  Sparkles,
  FileText,
  BadgeAlert,
  Trash2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface TrackedTicket {
  token: string;
  mode: string;
  category: string;
  urgency: string;
  alibi: string;
  status: string;
  created_at: string;
}

interface TokenTrackerModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialToken?: string;
  onShowToast: (msg: string) => void;
}

export function TokenTrackerModal({
  isOpen,
  onClose,
  initialToken = "",
  onShowToast,
}: TokenTrackerModalProps) {
  const [tokenInput, setTokenInput] = useState(initialToken);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [ticket, setTicket] = useState<TrackedTicket | null>(null);

  useEffect(() => {
    if (initialToken) {
      setTokenInput(initialToken.toUpperCase());
    }
  }, [initialToken]);

  // Emergency Panic Wipe listener to immediately clear state and close modal
  useEffect(() => {
    const handlePanic = () => {
      setTokenInput("");
      setTicket(null);
      setErrorMsg(null);
      onClose();
    };
    window.addEventListener("emergency-panic-wipe", handlePanic);
    return () => window.removeEventListener("emergency-panic-wipe", handlePanic);
  }, [onClose]);

  if (!isOpen) return null;

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanToken = tokenInput.trim().toUpperCase();

    if (!cleanToken) {
      setErrorMsg("Masukkan 8-karakter kode token tiket Anda");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setTicket(null);

    try {
      const res = await fetch(`/api/crisis/track?token=${encodeURIComponent(cleanToken)}`);
      const data = await res.json();

      if (res.ok && data.success) {
        setTicket(data.ticket);
        onShowToast(`Tiket [${cleanToken}] berhasil ditemukan.`);
      } else {
        setErrorMsg(
          data.error || "Tiket tidak ditemukan. Pastikan 8-karakter token Anda benar."
        );
      }
    } catch {
      setErrorMsg("Koneksi gagal saat menghubungi server kiosk.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setTokenInput("");
    setTicket(null);
    setErrorMsg(null);
  };

  const getAlibiDescription = (alibiKey: string) => {
    switch (alibiKey?.toLowerCase()) {
      case "medical":
      case "kesehatan":
        return "Surat Pemanggilan Pemeriksaan Kesehatan Rutin di Poskestren";
      case "academic":
      case "akademik":
        return "Surat Undangan Evaluasi Belajar / Musabaqah Santri";
      case "dormitory":
      case "asrama":
        return "Surat Penugasan Inventaris & Koordinasi Kamar";
      default:
        return "Surat Administrasi Internal Pesantren";
    }
  };

  return (
    <div className="fixed inset-0 z-[130] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700/80 text-white rounded-3xl max-w-lg w-full p-6 shadow-2xl relative flex flex-col justify-between max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center">
              <Search className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-100">
                Pelacak Status Tiket Konseling
              </h3>
              <p className="text-xs text-slate-400 font-mono">
                Pemeriksaan Tindak Lanjut via Token 8-Karakter
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              handleClear();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearch} className="my-5 space-y-3">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold">
            Masukkan 8-Digit Kode Akses Token Anda:
          </label>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => {
                  // Only allow alphanumeric uppercase
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "");
                  setTokenInput(val);
                  setErrorMsg(null);
                }}
                maxLength={8}
                placeholder="CONTOH: K7M9P2X4"
                autoFocus
                className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 rounded-2xl py-3 px-4 font-mono font-bold text-lg text-emerald-400 tracking-widest placeholder-slate-600 outline-none transition-colors"
              />
              {tokenInput && (
                <button
                  type="button"
                  onClick={() => setTokenInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            <Button
              type="submit"
              disabled={isLoading || tokenInput.length < 4}
              className="h-12 px-5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-md transition-all active:scale-95"
            >
              {isLoading ? (
                <span className="text-xs font-mono">Mencari...</span>
              ) : (
                <span className="flex items-center space-x-1.5 text-xs">
                  <span>Cek Status</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              )}
            </Button>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-light">
            Token Anda di-hash secara lokal menggunakan <strong>SHA-256</strong>. Tidak ada identitas pribadi yang dipublikasikan atau disimpan pada pelacak ini.
          </p>
        </form>

        {/* Error Message */}
        {errorMsg && (
          <div className="p-3.5 rounded-2xl bg-rose-950/70 border border-rose-800/80 text-rose-300 text-xs flex items-center space-x-2.5 mb-4 animate-in fade-in duration-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Result Card */}
        {ticket && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-4 mb-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
                  Kode Akses Tiket
                </span>
                <span className="font-mono font-extrabold text-lg text-emerald-400">
                  {ticket.token}
                </span>
              </div>
              <Badge
                className={`text-xs font-mono font-bold ${
                  ticket.status === "MASUK"
                    ? "bg-amber-950 text-amber-300 border-amber-800"
                    : ticket.status === "DIPROSES"
                    ? "bg-sky-950 text-sky-300 border-sky-800"
                    : "bg-emerald-950 text-emerald-300 border-emerald-800"
                }`}
              >
                {ticket.status === "MASUK"
                  ? "MENUNGGU DITINJAU"
                  : ticket.status === "DIPROSES"
                  ? "SEDANG DITANGANI"
                  : "SELESAI DITANGANI"}
              </Badge>
            </div>

            {/* Stepper Progress */}
            <div className="py-2">
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-2">
                <span className="text-emerald-400 font-bold">1. Diterima Posko</span>
                <span
                  className={
                    ticket.status === "DIPROSES" || ticket.status === "SELESAI"
                      ? "text-sky-400 font-bold"
                      : "text-slate-600"
                  }
                >
                  2. Intervensi Konselor
                </span>
                <span
                  className={
                    ticket.status === "SELESAI" ? "text-emerald-400 font-bold" : "text-slate-600"
                  }
                >
                  3. Selesai
                </span>
              </div>
              <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                <div className="bg-emerald-500 h-full w-1/3"></div>
                <div
                  className={`h-full w-1/3 transition-all ${
                    ticket.status === "DIPROSES" || ticket.status === "SELESAI"
                      ? "bg-sky-500"
                      : "bg-transparent"
                  }`}
                ></div>
                <div
                  className={`h-full w-1/3 transition-all ${
                    ticket.status === "SELESAI" ? "bg-emerald-400" : "bg-transparent"
                  }`}
                ></div>
              </div>
            </div>

            {/* Alibi Call Guidance */}
            <div className="bg-emerald-950/40 border border-emerald-800/60 rounded-xl p-3.5 space-y-1.5">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 flex items-center space-x-1.5">
                <FileText className="w-3.5 h-3.5" />
                <span>Kamuflase Surat Pemanggilan Resmi:</span>
              </span>
              <p className="text-xs text-slate-200 font-medium">
                {getAlibiDescription(ticket.alibi)}
              </p>
              <p className="text-[11px] text-slate-400 leading-normal">
                Jika Anda dipanggil pengurus dengan alasan di atas, ini adalah panggilan resmi dari Konselor Bilik Aman. Teman sekamar Anda tidak akan mengetahui alasan sebenarnya.
              </p>
            </div>

            {/* Metadata Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-mono">Moda Pelaporan</span>
                <span className="font-semibold text-slate-200">
                  {ticket.mode === "VERIFIED_KTS" ? "Terverifikasi KTS" : "100% Anonim (Zero-Knowledge)"}
                </span>
              </div>
              <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block font-mono">Kategori Kasus</span>
                <span className="font-semibold text-slate-200">{ticket.category}</span>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="text-slate-400 hover:text-rose-400 hover:bg-slate-800 flex items-center space-x-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Bersihkan Layar</span>
          </Button>

          <Button
            type="button"
            onClick={() => {
              handleClear();
              onClose();
            }}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-4 rounded-xl"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
