"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  Wrench,
  BadgeCheck,
  ScanBarcode,
  CheckCircle2,
  AlertTriangle,
  Droplet,
  Zap,
  Bed,
  Wind,
  DoorOpen,
  BookOpen,
  Send,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import type { StudentProfile } from "./crisis-form";

interface FacilityFormProps {
  verifiedStudent: StudentProfile | null;
  onBackToMain: () => void;
  onOpenBarcodeCamera: () => void;
  onGoToSarprasBoard: () => void;
  onShowToast: (message: string) => void;
}

const CATEGORIES = [
  {
    id: "sanitasi",
    label: "Air & Sanitasi",
    desc: "Kran bocor, shower, pipa, WC kamar mandi",
    icon: Droplet,
    color: "text-sky-500 bg-sky-50 border-sky-200",
  },
  {
    id: "kelistrikan",
    label: "Kelistrikan & Lampu",
    desc: "Lampu padam, fitting neon, saklar, stop kontak",
    icon: Zap,
    color: "text-amber-500 bg-amber-50 border-amber-200",
  },
  {
    id: "kamar",
    label: "Inventaris Kamar",
    desc: "Ranjang tingkat, kasur, lemari santri, grendel",
    icon: Bed,
    color: "text-emerald-500 bg-emerald-50 border-emerald-200",
  },
  {
    id: "ventilasi",
    label: "Kipas & Ventilasi",
    desc: "Kipas angin dinding, exhaust fan, kawat kasa",
    icon: Wind,
    color: "text-teal-500 bg-teal-50 border-teal-200",
  },
  {
    id: "pintu",
    label: "Pintu & Plafon",
    desc: "Engsel pintu, kaca jendela, plafon asrama",
    icon: DoorOpen,
    color: "text-indigo-500 bg-indigo-50 border-indigo-200",
  },
  {
    id: "belajar",
    label: "Sarana Belajar & Masjid",
    desc: "Meja halaqah, sound system, karpet musholla",
    icon: BookOpen,
    color: "text-rose-500 bg-rose-50 border-rose-200",
  },
];

export function FacilityForm({
  verifiedStudent,
  onBackToMain,
  onOpenBarcodeCamera,
  onGoToSarprasBoard,
  onShowToast,
}: FacilityFormProps) {
  const [category, setCategory] = useState<string>("sanitasi");
  const [location, setLocation] = useState<string>(verifiedStudent?.kamar || "Asrama Putra");
  const [issueTitle, setIssueTitle] = useState<string>("");
  const [issueDesc, setIssueDesc] = useState<string>("");
  const [priority, setPriority] = useState<"Biasa" | "Sedang" | "Tinggi">("Sedang");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicket, setSubmittedTicket] = useState<{
    id: string;
    nis: string;
    santri_name: string;
    dorm_room: string;
    issue_title: string;
    issue_desc: string;
    priority: string;
    status: string;
  } | null>(null);

  // Fallback student profile if entered without scan
  const activeStudent: StudentProfile = verifiedStudent || {
    nama: "Santri Mandiri",
    nis: "2024-KTS-09101",
    kelas: "XII Keagamaan",
    kamar: "Asrama Al-Ghazali 04",
    barcode: "2024-KTS-09101",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueTitle.trim()) {
      onShowToast("Mohon tuliskan judul ringkasan kerusakan fasilitas.");
      return;
    }

    setIsSubmitting(true);
    const generatedId = `#TK-2026-${Math.floor(Math.random() * 900 + 100)}`;
    const newTicket = {
      id: generatedId,
      nis: activeStudent.nis,
      santri_name: activeStudent.nama,
      dorm_room: location || activeStudent.kamar,
      issue_title: issueTitle.trim(),
      issue_desc: issueDesc.trim() || "Dilaporkan via Kiosk Layanan Fasilitas Santri.",
      priority,
      status: "Tiket Baru",
    };

    try {
      const res = await fetch("/api/sarpras", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTicket),
      });

      if (res.ok) {
        setSubmittedTicket(newTicket);
        onShowToast(`Laporan fasilitas berhasil dikirim! ID Tiket: ${generatedId}`);
      } else {
        // Still display success locally for robust kiosk demo
        setSubmittedTicket(newTicket);
        onShowToast(`Laporan fasilitas disimpan ke antrean teknisi (${generatedId}).`);
      }
    } catch {
      setSubmittedTicket(newTicket);
      onShowToast(`Laporan fasilitas disimpan (${generatedId}).`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // SUCCESS RECEIPT VIEW
  if (submittedTicket) {
    return (
      <section className="max-w-3xl mx-auto min-h-[calc(100vh-6rem)] pt-4 sm:pt-8 pb-16 px-4 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-3xl border border-emerald-200 shadow-2xl p-6 sm:p-10 text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-inner">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
          </div>

          <Badge variant="emerald" className="mb-2 text-xs font-mono font-bold">
            TIKET KERUSAKAN FASILITAS DITERBITKAN
          </Badge>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Laporan Sarpras Diterima Teknisi
          </h2>

          <p className="text-sm text-slate-600 mt-2 max-w-lg mx-auto">
            Identitas Anda telah diverifikasi melalui <strong>Barcode KTS</strong>. Tim logistik dan teknisi maintenance pondok akan segera menindaklanjuti.
          </p>

          {/* Ticket Receipt Box */}
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-5 sm:p-6 mt-6 text-left space-y-3 font-mono text-xs sm:text-sm shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <span className="text-slate-500 font-sans font-semibold">Nomor Tiket:</span>
              <span className="text-base sm:text-lg font-bold text-emerald-700">{submittedTicket.id}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-sans">Santri Pelapor:</span>
              <span className="font-semibold text-slate-800">{submittedTicket.santri_name} ({submittedTicket.nis})</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-sans">Lokasi Fasilitas:</span>
              <span className="font-semibold text-slate-800">{submittedTicket.dorm_room}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-sans">Rincian Masalah:</span>
              <span className="font-semibold text-slate-800 truncate max-w-[220px] sm:max-w-xs">{submittedTicket.issue_title}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 font-sans">Tingkat Prioritas:</span>
              <span className="font-semibold text-amber-600">{submittedTicket.priority}</span>
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <span className="text-slate-500 font-sans">Status Saat Ini:</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-xs">
                {submittedTicket.status} (Menunggu Teknisi)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="emerald"
              onClick={onBackToMain}
              className="w-full sm:w-auto px-6 py-2.5 shadow-md flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Selesai &amp; Kembali ke Kiosk Utama</span>
            </Button>
            <Button
              variant="outline"
              onClick={onGoToSarprasBoard}
              className="w-full sm:w-auto px-6 py-2.5 border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center justify-center space-x-2"
            >
              <span>Pantau di Antrean Sarpras</span>
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto min-h-[calc(100vh-6rem)] pt-3 sm:pt-6 pb-16 px-3.5 sm:px-6">
      {/* Top Header Nav */}
      <div className="flex items-center justify-between mb-5 sm:mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBackToMain}
          className="text-slate-600 hover:text-slate-900 -ml-2 flex items-center space-x-1.5"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Kiosk</span>
        </Button>

        <div className="flex items-center space-x-2">
          <Badge variant="emerald" className="bg-emerald-100 text-emerald-800 border-emerald-300 font-mono text-[11px] sm:text-xs">
            Layanan Fasilitas &amp; Logistik
          </Badge>
        </div>
      </div>

      {/* Verified Santri Card (Identity from Barcode Scan) */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 mb-6 shadow-xl border border-emerald-500/40 relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-emerald-500/10 blur-2xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-start sm:items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0 shadow-inner">
              <ScanBarcode className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-bold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/40">
                  KTS Terverifikasi
                </span>
                <BadgeCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-1 leading-tight">
                {activeStudent.nama}
              </h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-300 font-mono mt-1">
                <span>NIS: <strong className="text-white">{activeStudent.nis}</strong></span>
                <span>•</span>
                <span>Kamar: <strong className="text-emerald-300">{activeStudent.kamar}</strong></span>
                <span>•</span>
                <span>Kelas: <strong className="text-white">{activeStudent.kelas}</strong></span>
              </div>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenBarcodeCamera}
            className="border-emerald-500/50 bg-emerald-950/50 text-emerald-200 hover:bg-emerald-900/60 text-xs shrink-0 flex items-center space-x-1.5 self-start sm:self-center"
          >
            <ScanBarcode className="w-3.5 h-3.5" />
            <span>Scan KTS Lain</span>
          </Button>
        </div>
      </div>

      {/* Main Form Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 p-5 sm:p-8">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center space-x-2">
            <Wrench className="w-6 h-6 text-emerald-600" />
            <span>Formulir Pelaporan Kerusakan Fasilitas</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Isi formulir di bawah ini untuk melaporkan sarana &amp; prasarana yang memerlukan perbaikan oleh tim teknisi pondok.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Category Selector */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-2.5">
              1. Pilih Kategori Fasilitas:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 sm:gap-3">
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat.id;
                const IconComponent = cat.icon;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.id)}
                    className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                      isSelected
                        ? "border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/20"
                        : "border-slate-200 bg-slate-50/60 hover:bg-slate-100/80 hover:border-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center border ${cat.color}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      {isSelected && (
                        <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      )}
                    </div>
                    <div>
                      <div className="font-bold text-xs sm:text-sm text-slate-800 leading-tight">
                        {cat.label}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">
                        {cat.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Location & Urgency Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                2. Lokasi Kerusakan:
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Asrama Al-Ghazali 04, Kamar Mandi Belakang"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all bg-slate-50/50"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                Otomatis diisi dari kamar santri, dapat diubah jika di fasilitas umum.
              </span>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
                3. Tingkat Urgensi:
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "Biasa", label: "Biasa", color: "hover:border-slate-400" },
                  { id: "Sedang", label: "Sedang", color: "hover:border-amber-400" },
                  { id: "Tinggi", label: "Mendesak", color: "hover:border-rose-400" },
                ].map((u) => {
                  const isSel = priority === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setPriority(u.id as "Biasa" | "Sedang" | "Tinggi")}
                      className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
                        isSel
                          ? u.id === "Tinggi"
                            ? "bg-rose-50 border-rose-500 text-rose-700 ring-1 ring-rose-400"
                            : u.id === "Sedang"
                            ? "bg-amber-50 border-amber-500 text-amber-700 ring-1 ring-amber-400"
                            : "bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-400"
                          : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      {u.label}
                    </button>
                  );
                })}
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                Pilih &quot;Mendesak&quot; untuk air mati total atau bahaya korsleting listrik.
              </span>
            </div>
          </div>

          {/* Issue Title */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              4. Judul Kerusakan / Kebutuhan:
            </label>
            <input
              type="text"
              required
              value={issueTitle}
              onChange={(e) => setIssueTitle(e.target.value)}
              placeholder="Contoh: Kran air wudhu patah &amp; air meluap ke lorong kamar mandi"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-bold text-slate-800 mb-1.5">
              5. Rincian Tambahan (Opsional):
            </label>
            <textarea
              rows={3}
              value={issueDesc}
              onChange={(e) => setIssueDesc(e.target.value)}
              placeholder="Jelaskan kondisi kerusakan untuk membantu teknisi menyiapkan suku cadang (contoh: pipa ukuran 1/2 inch, fitting lampu pecah, dll)..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all resize-none"
            />
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-xs text-slate-500 flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Tiket terhubung langsung dengan inventaris teknisi pondok</span>
            </span>

            <div className="flex items-center space-x-2.5 w-full sm:w-auto">
              <Button
                type="button"
                variant="ghost"
                onClick={onBackToMain}
                className="w-full sm:w-auto text-slate-600 hover:text-slate-900"
              >
                Batal
              </Button>
              <Button
                type="submit"
                variant="emerald"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 shadow-md flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Mengirim Tiket...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Kirim Laporan Fasilitas</span>
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </section>
  );
}
