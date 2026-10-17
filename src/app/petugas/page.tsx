"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import JsBarcode from "jsbarcode";
import {
  ShieldAlert,
  Wrench,
  Users,
  Search,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Trash2,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Lock,
  Unlock,
  Check,
  Building2,
  FileText,
  BadgeCheck,
  LogOut,
  Sparkles,
  Barcode as BarcodeIcon,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { decryptPayloadWithHybrid } from "@/lib/crypto";

// Types
interface CrisisTicket {
  id: number;
  token: string;
  token_hash: string;
  mode: "ANONYMOUS" | "VERIFIED_KTS";
  category: string;
  urgency: string;
  ciphertext: string;
  iv_hex: string;
  encrypted_key?: string | null;
  alibi: string;
  status: string;
  santri_nis: string | null;
  santri_name: string | null;
  created_at: string;
}

interface SarprasTicket {
  id: string;
  nis: string;
  santri_name: string;
  dorm_room: string;
  issue_title: string;
  issue_desc: string;
  priority: string;
  status: string;
  created_at?: string;
}

interface StudentRecord {
  nis: string;
  barcode: string;
  name: string;
  class_name: string;
  dorm_room: string;
}

function LiveBarcodePreview({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current && value.trim()) {
      try {
        JsBarcode(svgRef.current, value.trim(), {
          format: "CODE128",
          lineColor: "#0f172a",
          width: 2,
          height: 48,
          displayValue: true,
          font: "monospace",
          fontSize: 12,
          fontOptions: "bold",
          textMargin: 2,
          background: "#ffffff",
        });
      } catch {
        // Ignore invalid character while typing
      }
    }
  }, [value]);

  if (!value.trim()) {
    return (
      <div className="h-16 flex items-center justify-center text-xs text-slate-400 border border-dashed border-slate-300 rounded-xl bg-slate-50">
        Masukkan NIS untuk pratinjau barcode
      </div>
    );
  }

  return (
    <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center">
      <svg ref={svgRef} className="w-full max-w-[240px] h-auto" />
    </div>
  );
}

export default function PetugasDashboardPage() {
  const [activeTab, setActiveTab] = useState<"crisis" | "sarpras" | "students">("crisis");

  // Security Authentication Gate states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [officerPin, setOfficerPin] = useState<string>("");
  const [pinInput, setPinInput] = useState<string>("");
  const [pinError, setPinError] = useState<string | null>(null);
  const [isVerifyingPin, setIsVerifyingPin] = useState<boolean>(false);
  const [showPin, setShowPin] = useState<boolean>(false);

  // Data states
  const [crisisTickets, setCrisisTickets] = useState<CrisisTicket[]>([]);
  const [sarprasTickets, setSarprasTickets] = useState<SarprasTicket[]>([]);
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [crisisFilter, setCrisisFilter] = useState<string>("ALL");
  const [studentSearch, setStudentSearch] = useState("");

  // Input Student Form State
  const [newStudent, setNewStudent] = useState({
    name: "",
    nis: "",
    class_name: "Kelas 10 Wustho Salafiyah",
    dorm_room: "Asrama Al-Fath Kamar 01",
  });
  const [isSubmittingStudent, setIsSubmittingStudent] = useState(false);

  // Selected Detail Modal
  const [selectedCrisis, setSelectedCrisis] = useState<CrisisTicket | null>(null);
  const [decryptedNarratives, setDecryptedNarratives] = useState<Record<string, { narrative: string; identity?: any }>>({});
  const [decryptingTokens, setDecryptingTokens] = useState<Record<string, boolean>>({});

  // Toast
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }, []);

  // Hybrid Decryption Handler for Counselors
  const handleDecryptTicket = async (ticket: CrisisTicket) => {
    if (!ticket.encrypted_key) {
      showToast("Tiket ini tidak memiliki amplop kunci RSA-OAEP (tiket legacy)");
      return;
    }
    setDecryptingTokens((prev) => ({ ...prev, [ticket.token]: true }));
    try {
      const payload = await decryptPayloadWithHybrid(ticket.ciphertext, ticket.encrypted_key);
      setDecryptedNarratives((prev) => ({
        ...prev,
        [ticket.token]: { narrative: payload.narrative, identity: payload.identity },
      }));
      showToast(`Tiket [${ticket.token}] berhasil didekripsi dengan Kunci Privat Konselor.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Gagal mendekripsi: ${msg}`);
    } finally {
      setDecryptingTokens((prev) => ({ ...prev, [ticket.token]: false }));
    }
  };

  // Initialize PIN from sessionStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedPin = sessionStorage.getItem("sovereign_officer_pin");
      if (savedPin) {
        setOfficerPin(savedPin);
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Verify PIN against backend
  const handleVerifyPin = async (pinToTest?: string) => {
    const cleanPin = (typeof pinToTest === "string" ? pinToTest : pinInput).trim();
    if (!cleanPin) {
      setPinError("Silakan masukkan PIN otorisasi petugas");
      return;
    }

    setIsVerifyingPin(true);
    setPinError(null);
    try {
      const res = await fetch("/api/crisis", {
        headers: { "x-petugas-pin": cleanPin },
      });
      if (res.ok) {
        if (typeof window !== "undefined") {
          sessionStorage.setItem("sovereign_officer_pin", cleanPin);
        }
        setOfficerPin(cleanPin);
        setIsAuthenticated(true);
        setPinInput("");
        showToast("Otorisasi Petugas Berhasil. Selamat bertugas di Posko.");
      } else {
        setPinError("PIN Petugas tidak valid! Akses ditolak.");
      }
    } catch {
      setPinError("Koneksi gagal saat memverifikasi PIN.");
    } finally {
      setIsVerifyingPin(false);
    }
  };

  const handleLockDashboard = () => {
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("sovereign_officer_pin");
    }
    setIsAuthenticated(false);
    setOfficerPin("");
    setCrisisTickets([]);
    showToast("Workstation petugas berhasil dikunci.");
  };

  // Fetch all initial data using authorized officer PIN
  const loadData = useCallback(async () => {
    if (!officerPin) return;
    setLoading(true);
    try {
      const [resCrisis, resSarpras, resStudents] = await Promise.all([
        fetch("/api/crisis", { headers: { "x-petugas-pin": officerPin } }),
        fetch("/api/sarpras"),
        fetch("/api/students"),
      ]);

      if (resCrisis.status === 401) {
        setIsAuthenticated(false);
        if (typeof window !== "undefined") {
          sessionStorage.removeItem("sovereign_officer_pin");
        }
        showToast("Sesi otorisasi PIN berakhir atau tidak valid.");
        return;
      }

      if (resCrisis.ok) {
        const d = await resCrisis.json();
        setCrisisTickets(d.tickets || []);
      }
      if (resSarpras.ok) {
        const d = await resSarpras.json();
        setSarprasTickets(d.tickets || []);
      }
      if (resStudents.ok) {
        const d = await resStudents.json();
        setStudents(d.students || []);
      }
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      showToast("Gagal memuat data dari server lokal.");
    } finally {
      setLoading(false);
    }
  }, [officerPin, showToast]);

  useEffect(() => {
    if (isAuthenticated && officerPin) {
      loadData();
    }
  }, [isAuthenticated, officerPin, loadData]);

  // Update Crisis Status with Officer PIN
  const handleUpdateCrisisStatus = async (token: string, newStatus: string) => {
    try {
      const res = await fetch("/api/crisis", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-petugas-pin": officerPin,
        },
        body: JSON.stringify({ token, status: newStatus }),
      });
      if (res.ok) {
        setCrisisTickets((prev) =>
          prev.map((t) => (t.token === token ? { ...t, status: newStatus } : t))
        );
        if (selectedCrisis?.token === token) {
          setSelectedCrisis((prev) => (prev ? { ...prev, status: newStatus } : null));
        }
        showToast(`Status tiket [${token}] diperbarui: ${newStatus}`);
      } else {
        showToast("Gagal memperbarui: Otorisasi PIN tidak sah");
      }
    } catch {
      showToast("Gagal memperbarui status tiket");
    }
  };

  // Update Sarpras Status
  const handleUpdateSarprasStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch("/api/sarpras", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      if (res.ok) {
        setSarprasTickets((prev) =>
          prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
        );
        showToast(`Status perbaikan [${id}] diperbarui: ${newStatus}`);
      }
    } catch {
      showToast("Gagal memperbarui status perbaikan");
    }
  };

  // Submit New Student Form
  const handleRegisterStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudent.name.trim() || !newStudent.nis.trim()) {
      showToast("Nama dan NIS santri wajib diisi!");
      return;
    }

    setIsSubmittingStudent(true);
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nis: newStudent.nis.trim(),
          barcode: newStudent.nis.trim(),
          name: newStudent.name.trim(),
          class_name: newStudent.class_name,
          dorm_room: newStudent.dorm_room,
        }),
      });

      if (res.ok) {
        showToast(`Santri [${newStudent.name}] berhasil didaftarkan ke database.`);
        setNewStudent({
          name: "",
          nis: "",
          class_name: "Kelas 10 Wustho Salafiyah",
          dorm_room: "Asrama Al-Fath Kamar 01",
        });
        loadData();
      } else {
        const err = await res.json();
        showToast(err.error || "Gagal mendaftarkan santri.");
      }
    } catch {
      showToast("Koneksi gagal saat menyimpan data santri.");
    } finally {
      setIsSubmittingStudent(false);
    }
  };

  // Delete Student
  const handleDeleteStudent = async (nis: string, name: string) => {
    if (!confirm(`Hapus data santri ${name} (${nis}) dari sistem?`)) return;

    try {
      const res = await fetch(`/api/students?nis=${encodeURIComponent(nis)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setStudents((prev) => prev.filter((s) => s.nis !== nis));
        showToast(`Data santri [${name}] telah dihapus.`);
      }
    } catch {
      showToast("Gagal menghapus santri");
    }
  };

  // Filtered Students
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.nis.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.dorm_room.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // Filtered Crisis
  const filteredCrisis = crisisTickets.filter((c) => {
    if (crisisFilter === "ALL") return true;
    if (crisisFilter === "MASUK") return c.status === "MASUK";
    if (crisisFilter === "DIPROSES") return c.status === "DIPROSES" || c.status === "INTERVENSI";
    if (crisisFilter === "SELESAI") return c.status === "SELESAI";
    return true;
  });

  // RENDER PIN AUTHENTICATION GATE IF NOT AUTHORIZED
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#03170e] text-slate-100 flex flex-col justify-between p-4 sm:p-8 md:p-12 relative overflow-y-auto selection:bg-emerald-500 selection:text-white">
        {/* Background Subtle Ambient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[360px] bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

        <div className="w-full max-w-md mx-auto my-auto relative z-10 flex flex-col items-center py-4">
          {/* Logo & Header */}
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white p-1.5 shadow-2xl border-2 border-emerald-500/50 flex items-center justify-center mb-3 sm:mb-4">
            <img
              src="/logo-shirothul-fuqoha.png"
              alt="Logo PP Salafiyah Shirothul Fuqoha Malang"
              className="w-full h-full object-contain"
            />
          </div>

          <div className="text-center mb-4 sm:mb-6">
            <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-800">
              Gerbang Otorisasi Petugas Posko
            </span>
            <h1 className="text-xl sm:text-2xl font-bold text-white mt-2">
              Workstation Konselor &amp; Satgas
            </h1>
            <p className="text-xs text-slate-400 mt-1 max-w-sm px-2">
              PP Salafiyah Shirothul Fuqoha&apos; Malang. Masukkan PIN keamanan untuk mengakses data penanganan santri.
            </p>
          </div>

          {/* PIN Input Box */}
          <div className="w-full bg-slate-900/95 border border-slate-700/80 rounded-3xl p-5 sm:p-8 shadow-2xl backdrop-blur-xl">
            <form onSubmit={(e) => { e.preventDefault(); handleVerifyPin(); }} className="space-y-4 sm:space-y-5">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-300 font-semibold mb-2 text-center">
                  PIN Keamanan Petugas
                </label>
                <div className="relative">
                  <input
                    type={showPin ? "text" : "password"}
                    value={pinInput}
                    onChange={(e) => { setPinInput(e.target.value); setPinError(null); }}
                    placeholder="••••"
                    maxLength={10}
                    autoFocus
                    className="w-full bg-slate-950 border-2 border-slate-700 focus:border-emerald-500 rounded-2xl py-3 px-4 text-center font-mono text-2xl tracking-[0.3em] text-white placeholder-slate-600 outline-none transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPin(!showPin)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-mono"
                  >
                    {showPin ? "Tutup" : "Lihat"}
                  </button>
                </div>
              </div>

              {pinError && (
                <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-800/80 text-rose-300 text-xs text-center flex items-center justify-center space-x-2 animate-in fade-in duration-200">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              {/* Quick Number Keypad for Touch Kiosk / Keyboard */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => { setPinInput((prev) => (prev.length < 8 ? prev + num : prev)); setPinError(null); }}
                    className="h-11 sm:h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-bold text-base sm:text-lg border border-slate-700/60 transition-all"
                  >
                    {num}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinInput("")}
                  className="h-11 sm:h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 text-xs font-bold border border-slate-700/40 transition-all"
                >
                  Hapus
                </button>
                <button
                  type="button"
                  onClick={() => { setPinInput((prev) => (prev.length < 8 ? prev + "0" : prev)); setPinError(null); }}
                  className="h-11 sm:h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white font-mono font-bold text-base sm:text-lg border border-slate-700/60 transition-all"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={() => setPinInput((prev) => prev.slice(0, -1))}
                  className="h-11 sm:h-12 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 text-xs font-bold border border-slate-700/40 transition-all"
                >
                  ←
                </button>
              </div>

              <Button
                type="submit"
                disabled={isVerifyingPin}
                className="w-full h-11 sm:h-12 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-950 transition-all active:scale-98"
              >
                {isVerifyingPin ? (
                  <div className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <Unlock className="w-4 h-4" />
                    <span>Masuk ke Workstation</span>
                  </div>
                )}
              </Button>

              <div className="pt-1 text-center">
                <span className="text-[11px] text-slate-500 font-mono">
                  PIN Standar Default Sistem: <strong className="text-emerald-400">1926</strong>
                </span>
              </div>
            </form>
          </div>

          <div className="mt-5 sm:mt-6 text-center">
            <Link
              href="/"
              className="text-xs font-semibold text-slate-400 hover:text-emerald-400 transition-colors inline-flex items-center space-x-1"
            >
              <span>← Kembali ke Layanan Mandiri Kiosk</span>
            </Link>
          </div>
        </div>

        <footer className="text-center text-[10px] text-slate-500 font-mono relative z-10 py-2">
          GardaSantri Kiosk : Tempat Pelaporan Santri Yang Aman • Workstation Petugas Posko
        </footer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* 1. Official Header */}
      <header className="h-auto min-h-[4rem] py-2.5 bg-slate-950 border-b border-slate-800 px-3 sm:px-8 flex items-center justify-between sticky top-0 z-50 shadow-md gap-2">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white p-1 shadow-md border border-emerald-500/50 flex items-center justify-center shrink-0">
            <img
              src="/logo-shirothul-fuqoha.png"
              alt="Logo PP Salafiyah Shirothul Fuqoha"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[9px] sm:text-[10px] font-mono font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950/80 px-1.5 sm:px-2 py-0.5 rounded border border-emerald-800">
                Workstation Petugas
              </span>
              <span className="hidden md:inline text-xs text-slate-400 font-mono">
                PP Salafiyah Shirothul Fuqoha&apos; Malang
              </span>
            </div>
            <h1 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-tight leading-tight">
              Portal Penanganan Laporan &amp; Data Santri
            </h1>
          </div>
        </div>

        {/* Action Links */}
        <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0">
          <Button
            onClick={loadData}
            variant="ghost"
            size="sm"
            className="text-slate-400 hover:text-white hover:bg-slate-800 px-2 sm:px-3"
            title="Refresh Data"
          >
            <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline ml-1 text-xs">Sinkron</span>
          </Button>

          <Link
            href="/kts"
            target="_blank"
            className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-sky-400" />
            <span>Cetak KTS</span>
          </Link>

          <Link
            href="/"
            className="inline-flex items-center space-x-1 text-xs font-semibold px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all border border-slate-700 active:scale-95"
          >
            <span>Kiosk</span>
            <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
          </Link>

          <Button
            onClick={handleLockDashboard}
            variant="ghost"
            size="sm"
            className="text-rose-400 hover:text-rose-300 hover:bg-rose-950/60 border border-rose-900/50 px-2 sm:px-3"
            title="Kunci Dashboard Petugas"
          >
            <Lock className="w-3.5 h-3.5 sm:mr-1" />
            <span className="hidden sm:inline text-xs">Kunci</span>
          </Button>
        </div>
      </header>

      {/* 2. Top Summary KPI Cards */}
      <section className="bg-slate-950/60 border-b border-slate-800 px-3 sm:px-8 py-3.5 sm:py-5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <Card className="bg-slate-900 border-slate-800 p-3 sm:p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-400">Total Tiket Krisis</span>
              <div className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-rose-400 mt-0.5 sm:mt-1">
                {crisisTickets.length}
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">
                {crisisTickets.filter((c) => c.status === "MASUK").length} Menunggu Tindakan
              </span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-rose-950/70 border border-rose-800/80 flex items-center justify-center text-rose-400 shrink-0 ml-2">
              <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-3 sm:p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-400">Laporan Sarpras</span>
              <div className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-amber-400 mt-0.5 sm:mt-1">
                {sarprasTickets.length}
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">
                {sarprasTickets.filter((s) => s.status !== "Selesai Dikerjakan").length} Belum Tuntas
              </span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-amber-950/70 border border-amber-800/80 flex items-center justify-center text-amber-400 shrink-0 ml-2">
              <Wrench className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-3 sm:p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-400">Santri Terdata</span>
              <div className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-sky-400 mt-0.5 sm:mt-1">
                {students.length}
              </div>
              <span className="text-[9px] sm:text-[10px] text-slate-500 block truncate">Barcode KTS Aktif</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-sky-950/70 border border-sky-800/80 flex items-center justify-center text-sky-400 shrink-0 ml-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </Card>

          <Card className="bg-slate-900 border-slate-800 p-3 sm:p-4 rounded-2xl flex items-center justify-between">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase text-slate-400">Status Server</span>
              <div className="text-xl sm:text-2xl md:text-3xl font-mono font-bold text-emerald-400 mt-0.5 sm:mt-1">
                ONLINE
              </div>
              <span className="text-[9px] sm:text-[10px] text-emerald-400/80 block truncate">SQLite LAN LAN</span>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-emerald-950/70 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shrink-0 ml-2">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
          </Card>
        </div>
      </section>


      {/* 3. Main Navigation Tabs */}
      <div className="bg-slate-950/40 border-b border-slate-800 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex space-x-2 py-3 overflow-x-auto">
          <button
            onClick={() => setActiveTab("crisis")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all ${
              activeTab === "crisis"
                ? "bg-rose-500/20 text-rose-300 border border-rose-500/50 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            <span>Penanganan Bilik Krisis ({crisisTickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("sarpras")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all ${
              activeTab === "sarpras"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Wrench className="w-4 h-4 text-amber-400" />
            <span>Layanan Perbaikan Sarpras ({sarprasTickets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("students")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold flex items-center space-x-2 transition-all ${
              activeTab === "students"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-sm"
                : "text-slate-400 hover:text-white hover:bg-slate-800"
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Input &amp; Manajemen Santri ({students.length})</span>
          </button>
        </div>
      </div>

      {/* 4. Tab Contents */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-8">
        {/* TAB 1: CRISIS TICKETS */}
        {activeTab === "crisis" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>Daftar Laporan Bilik Perlindungan Santri</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Laporan masuk terenkripsi secara end-to-end melalui Native Web Crypto API di Kiosk.
                </p>
              </div>

              {/* Status Filter */}
              <div className="flex items-center space-x-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                {["ALL", "MASUK", "DIPROSES", "SELESAI"].map((st) => (
                  <button
                    key={st}
                    onClick={() => setCrisisFilter(st)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      crisisFilter === st
                        ? "bg-slate-800 text-white"
                        : "text-slate-400 hover:text-white"
                    }`}
                  >
                    {st === "ALL" ? "Semua Status" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Crisis Table */}
            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Token &amp; Waktu</th>
                      <th className="py-3.5 px-4">Moda &amp; Pelapor</th>
                      <th className="py-3.5 px-4">Kategori Kasus</th>
                      <th className="py-3.5 px-4">Tingkat Urgensi</th>
                      <th className="py-3.5 px-4">Status &amp; Alibi</th>
                      <th className="py-3.5 px-4 text-right">Tindakan</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {filteredCrisis.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                          Tidak ada laporan krisis dengan filter yang dipilih.
                        </td>
                      </tr>
                    ) : (
                      filteredCrisis.map((c) => {
                        const isDarurat =
                          c.urgency.toLowerCase().includes("darurat") ||
                          c.urgency.toLowerCase().includes("mendesak");
                        return (
                          <tr key={c.token} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-4 px-4">
                              <span className="font-mono font-bold text-white text-sm block">
                                {c.token}
                              </span>
                              <span className="text-[10px] font-mono text-slate-500 block mt-0.5">
                                {c.created_at || "Baru saja"}
                              </span>
                            </td>

                            <td className="py-4 px-4">
                              {c.mode === "VERIFIED_KTS" ? (
                                <div>
                                  <Badge className="bg-emerald-950 text-emerald-300 border-emerald-700 text-[10px] mb-1">
                                    Terverifikasi KTS
                                  </Badge>
                                  <div className="font-bold text-slate-200 text-xs">
                                    {c.santri_name || "Santri Terverifikasi"}
                                  </div>
                                  <span className="text-[10px] font-mono text-slate-400">
                                    NIS: {c.santri_nis || "-"}
                                  </span>
                                </div>
                              ) : (
                                <div>
                                  <Badge className="bg-slate-800 text-slate-300 border-slate-700 text-[10px] mb-1">
                                    100% Anonim
                                  </Badge>
                                  <div className="text-slate-400 text-xs italic">
                                    Identitas Dirahasiakan
                                  </div>
                                </div>
                              )}
                            </td>

                            <td className="py-4 px-4">
                              <span className="font-semibold text-slate-200 block">
                                {c.category}
                              </span>
                            </td>

                            <td className="py-4 px-4">
                              <Badge
                                variant={isDarurat ? "destructive" : "secondary"}
                                className={`text-[10px] ${
                                  isDarurat
                                    ? "bg-rose-950/80 text-rose-300 border-rose-800 animate-pulse"
                                    : "bg-slate-800 text-slate-300 border-slate-700"
                                }`}
                              >
                                {c.urgency}
                              </Badge>
                            </td>

                            <td className="py-4 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                  c.status === "MASUK"
                                    ? "bg-amber-950 text-amber-300 border border-amber-800"
                                    : c.status === "DIPROSES"
                                    ? "bg-sky-950 text-sky-300 border border-sky-800"
                                    : "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                }`}
                              >
                                {c.status}
                              </span>
                              <span className="block text-[10px] text-slate-400 mt-1">
                                Alibi: {c.alibi || "medical"}
                              </span>
                            </td>

                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                {c.status === "MASUK" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateCrisisStatus(c.token, "DIPROSES")}
                                    className="h-7 text-xs bg-sky-600 hover:bg-sky-500 text-white"
                                  >
                                    Mulai Tangani
                                  </Button>
                                )}

                                {c.status === "DIPROSES" && (
                                  <Button
                                    size="sm"
                                    onClick={() => handleUpdateCrisisStatus(c.token, "SELESAI")}
                                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white"
                                  >
                                    Tandai Selesai
                                  </Button>
                                )}

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setSelectedCrisis(c)}
                                  className="h-7 text-xs border-slate-700 text-slate-300 hover:bg-slate-800"
                                >
                                  Detail Audit
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SARPRAS TICKETS */}
        {activeTab === "sarpras" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center space-x-2">
                  <span>Penanganan Kerusakan Fasilitas &amp; Sarana Asrama</span>
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tiket perbaikan diajukan oleh santri melalui barcode KTS di anjungan Kiosk.
                </p>
              </div>
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead className="bg-slate-900/90 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">No. Tiket</th>
                      <th className="py-3.5 px-4">Pelapor &amp; Kamar</th>
                      <th className="py-3.5 px-4">Keluhan Kerusakan</th>
                      <th className="py-3.5 px-4">Prioritas</th>
                      <th className="py-3.5 px-4">Status Pengerjaan</th>
                      <th className="py-3.5 px-4 text-right">Ubah Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {sarprasTickets.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                          Belum ada tiket fasilitas sarpras yang terdaftar.
                        </td>
                      </tr>
                    ) : (
                      sarprasTickets.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-900/40 transition-colors">
                          <td className="py-4 px-4 font-mono font-bold text-emerald-400">
                            {s.id}
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-bold text-slate-200 block">
                              {s.santri_name}
                            </span>
                            <span className="text-[11px] text-slate-400 block font-mono">
                              NIS: {s.nis} • {s.dorm_room}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-semibold text-white block">
                              {s.issue_title}
                            </span>
                            <span className="text-slate-400 text-xs block mt-0.5">
                              {s.issue_desc}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <Badge
                              className={`text-[10px] ${
                                s.priority === "Tinggi"
                                  ? "bg-rose-950 text-rose-300 border-rose-800"
                                  : "bg-slate-800 text-slate-300 border-slate-700"
                              }`}
                            >
                              {s.priority}
                            </Badge>
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                                s.status === "Selesai Dikerjakan"
                                  ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                  : s.status === "Sedang Dikerjakan"
                                  ? "bg-sky-950 text-sky-300 border border-sky-800"
                                  : "bg-amber-950 text-amber-300 border border-amber-800"
                              }`}
                            >
                              {s.status}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <select
                              value={s.status}
                              onChange={(e) => handleUpdateSarprasStatus(s.id, e.target.value)}
                              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 focus:ring-1 focus:ring-emerald-500"
                            >
                              <option value="Tiket Baru">Tiket Baru</option>
                              <option value="Sedang Dikerjakan">Sedang Dikerjakan</option>
                              <option value="Menunggu Sparepart">Menunggu Sparepart</option>
                              <option value="Selesai Dikerjakan">Selesai Dikerjakan</option>
                            </select>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: INPUT & DATA SANTRI */}
        {activeTab === "students" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Form Input Santri (Left Column 5 cols) */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center space-x-2.5 pb-4 mb-4 border-b border-slate-800">
                <div className="w-9 h-9 rounded-xl bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Input Santri &amp; Barcode KTS</h3>
                  <p className="text-xs text-slate-400">Daftarkan santri baru ke database SQLite lokal.</p>
                </div>
              </div>

              <form onSubmit={handleRegisterStudent} className="space-y-4 text-xs sm:text-sm">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nama Lengkap Santri *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: Muhammad Ali Ridho"
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Nomor Induk Santri (NIS) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2024-KTS-09105"
                    value={newStudent.nis}
                    onChange={(e) => setNewStudent({ ...newStudent, nis: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white font-mono placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    NIS ini akan dijadikan nilai Barcode Code 128 yang dipindai kamera Kiosk.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Marhalah / Kelas
                    </label>
                    <select
                      value={newStudent.class_name}
                      onChange={(e) => setNewStudent({ ...newStudent, class_name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Kelas 10 Wustho Salafiyah">Kelas 10 Wustho</option>
                      <option value="Kelas 11 Ula Salafiyah">Kelas 11 Ula</option>
                      <option value="Kelas 12 Ulya Salafiyah">Kelas 12 Ulya</option>
                      <option value="Mahasantri Ma'had Aly">Mahasantri Ma&apos;had Aly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Asrama &amp; Kamar
                    </label>
                    <input
                      type="text"
                      placeholder="Contoh: Asrama Al-Fath 04"
                      value={newStudent.dorm_room}
                      onChange={(e) => setNewStudent({ ...newStudent, dorm_room: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3.5 py-2.5 text-white text-xs focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Live Realtime Barcode Preview */}
                <div>
                  <span className="block text-xs font-semibold text-slate-400 mb-1">
                    Pratinjau Barcode KTS (Code 128)
                  </span>
                  <LiveBarcodePreview value={newStudent.nis} />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmittingStudent}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl mt-2 flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950"
                >
                  <Plus className="w-4 h-4" />
                  <span>
                    {isSubmittingStudent ? "Menyimpan ke SQLite..." : "Simpan Santri & Barcode KTS"}
                  </span>
                </Button>
              </form>
            </div>

            {/* List & Search Santri (Right Column 7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-3">
                  <div>
                    <h3 className="text-base font-bold text-white">Database Santri Aktif</h3>
                    <p className="text-xs text-slate-400">
                      Total {students.length} santri terdaftar dan siap dipindai di Kiosk.
                    </p>
                  </div>

                  {/* Search Bar */}
                  <div className="relative w-full sm:w-64">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Cari nama, NIS, asrama..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Students Table */}
                <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-900/90 text-slate-400 font-mono text-[10px] uppercase sticky top-0 border-b border-slate-800">
                      <tr>
                        <th className="py-2.5 px-3">Santri</th>
                        <th className="py-2.5 px-3">NIS &amp; Barcode</th>
                        <th className="py-2.5 px-3">Marhalah &amp; Asrama</th>
                        <th className="py-2.5 px-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-sans">
                      {filteredStudents.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="py-8 text-center text-slate-500 text-xs">
                            Tidak ditemukan data santri dengan pencarian tersebut.
                          </td>
                        </tr>
                      ) : (
                        filteredStudents.map((s) => (
                          <tr key={s.nis} className="hover:bg-slate-900/40 transition-colors">
                            <td className="py-3 px-3">
                              <span className="font-bold text-white text-xs block">
                                {s.name}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <span className="font-mono font-bold text-emerald-400 block">
                                {s.nis}
                              </span>
                            </td>

                            <td className="py-3 px-3">
                              <span className="text-slate-300 block">{s.class_name}</span>
                              <span className="text-[11px] text-slate-500 block">
                                {s.dorm_room}
                              </span>
                            </td>

                            <td className="py-3 px-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteStudent(s.nis, s.name)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                                title="Hapus Data Santri"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Detail Modal for Crisis Audit */}
      {selectedCrisis && (
        <div
          role="dialog"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                <h3 className="font-bold text-white text-base">
                  Audit Kriptografi Tiket #{selectedCrisis.token}
                </h3>
              </div>
              <button
                onClick={() => setSelectedCrisis(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-5 text-xs text-slate-300">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 font-mono text-[11px] space-y-1.5">
                <div>
                  <span className="text-slate-500">Token Hash SHA-256:</span>
                  <div className="text-emerald-400 truncate">{selectedCrisis.token_hash}</div>
                </div>
                <div>
                  <span className="text-slate-500">Ciphertext (Base64 AES-GCM):</span>
                  <div className="text-slate-400 break-all">{selectedCrisis.ciphertext}</div>
                </div>
                <div>
                  <span className="text-slate-500">IV Hex (12-Byte):</span>
                  <div className="text-amber-400">{selectedCrisis.iv_hex}</div>
                </div>
                {selectedCrisis.encrypted_key && (
                  <div>
                    <span className="text-slate-500">RSA-OAEP 2048 Envelope:</span>
                    <div className="text-amber-300 break-all truncate">{selectedCrisis.encrypted_key}</div>
                  </div>
                )}
              </div>

              {/* Decrypted Narrative Box */}
              {decryptedNarratives[selectedCrisis.token] ? (
                <div className="bg-emerald-950/40 border border-emerald-600/70 p-4 rounded-2xl space-y-2 animate-in fade-in duration-300">
                  <div className="flex items-center justify-between border-b border-emerald-800/60 pb-2">
                    <span className="text-xs font-bold font-mono uppercase text-emerald-400 flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5" />
                      <span>Hasil Dekripsi (Kunci Privat Konselor)</span>
                    </span>
                    <Badge className="bg-emerald-600 text-white text-[10px]">TERVERIFIKASI ASLI</Badge>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-mono">
                      Isi Laporan / Kronologi Santri:
                    </span>
                    <p className="text-sm text-slate-100 font-medium mt-1 whitespace-pre-wrap leading-relaxed bg-slate-950/60 p-3 rounded-xl border border-emerald-900/50">
                      {decryptedNarratives[selectedCrisis.token].narrative}
                    </p>
                  </div>
                  {decryptedNarratives[selectedCrisis.token].identity && (
                    <div className="pt-2 text-[11px] text-emerald-300/80 flex items-center justify-between">
                      <span>Batas Konsensus: {decryptedNarratives[selectedCrisis.token].identity.consent}</span>
                      <span>Izin Orang Tua: {decryptedNarratives[selectedCrisis.token].identity.parentsAllowed ? "Diizinkan" : "Tidak"}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3.5 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-slate-200 block text-xs">
                      Payload Narasi Terenkripsi Asimetris
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      {selectedCrisis.encrypted_key
                        ? "Kunci privat RSA-OAEP konselor siap mendekripsi narasi ini."
                        : "Tiket demo/legacy tanpa kunci asimetris."}
                    </span>
                  </div>
                  {selectedCrisis.encrypted_key && (
                    <Button
                      size="sm"
                      onClick={() => handleDecryptTicket(selectedCrisis)}
                      disabled={decryptingTokens[selectedCrisis.token]}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shrink-0"
                    >
                      {decryptingTokens[selectedCrisis.token] ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1.5" />
                      ) : (
                        <Key className="w-3.5 h-3.5 mr-1.5" />
                      )}
                      <span>Dekripsi Laporan</span>
                    </Button>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Moda Pelaporan</span>
                  <span className="font-bold text-white">{selectedCrisis.mode}</span>
                </div>
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Kamuflase Alibi</span>
                  <span className="font-bold text-white">{selectedCrisis.alibi}</span>
                </div>
              </div>

              {selectedCrisis.santri_name && (
                <div className="bg-emerald-950/40 border border-emerald-800/60 p-3 rounded-xl">
                  <span className="text-[10px] text-emerald-400 uppercase block font-semibold">
                    Identitas Pelapor Terverifikasi KTS
                  </span>
                  <div className="font-bold text-white text-sm mt-0.5">
                    {selectedCrisis.santri_name} (NIS: {selectedCrisis.santri_nis})
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedCrisis(null)}
                className="border-slate-700 text-slate-300"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Pill */}
      {toastMsg && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
          <div className="bg-slate-950/95 border border-emerald-500/60 shadow-2xl backdrop-blur-md text-emerald-300 text-xs sm:text-sm font-medium py-3 px-4 rounded-2xl flex items-center justify-between pointer-events-auto">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{toastMsg}</span>
            </div>
            <button
              onClick={() => setToastMsg(null)}
              className="text-slate-400 hover:text-white text-xs ml-3 font-mono"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
