"use client";

import React, { useState } from "react";
import {
  ArrowLeft,
  ShieldCheck,
  Lock,
  BadgeCheck,
  ScanBarcode,
  Home,
  ShieldAlert,
  AlertTriangle,
  UserX,
  HeartPulse,
  CheckCircle2,
  Key,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import {
  generateHighEntropyToken,
  computeSha256,
  generateAesGcmKey,
  generate12ByteIv,
  encryptPayloadWithAesGcm,
  encryptAesKeyWithRsaOaep,
  type CrisisPayload,
  type EncryptedSubmissionRecord,
} from "@/lib/crypto";

export interface StudentProfile {
  nama: string;
  nis: string;
  kelas: string;
  kamar: string;
  barcode: string;
}

interface CrisisFormProps {
  initialMode?: "ANONYMOUS" | "VERIFIED_KTS";
  onBackToMain: () => void;
  onOpenBarcodeCamera: () => void;
  verifiedStudent: StudentProfile | null;
  onEncryptedSubmit: (record: EncryptedSubmissionRecord) => void;
  onShowToast: (message: string) => void;
}

export function CrisisForm({
  initialMode = "ANONYMOUS",
  onBackToMain,
  onOpenBarcodeCamera,
  verifiedStudent,
  onEncryptedSubmit,
  onShowToast,
}: CrisisFormProps) {
  const [crisisMode, setCrisisMode] = useState<"ANONYMOUS" | "VERIFIED_KTS">(initialMode);
  const [category, setCategory] = useState<string | null>(null);
  const [urgency, setUrgency] = useState<string | null>(null);
  const [alibi, setAlibi] = useState("medical");
  const [narrative, setNarrative] = useState("");
  const [consentLevel, setConsentLevel] = useState("RESTRICTED_COUNSELOR");
  const [consentParents, setConsentParents] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Listen for emergency panic wipe to immediately purge memory
  React.useEffect(() => {
    const handlePanicWipe = () => {
      setNarrative("");
      setCategory(null);
      setUrgency(null);
      setAlibi("medical");
    };
    window.addEventListener("emergency-panic-wipe", handlePanicWipe);
    return () => window.removeEventListener("emergency-panic-wipe", handlePanicWipe);
  }, []);

  const handleSubmit = async () => {
    if (!category) {
      onShowToast("Peringatan: Silakan pilih salah satu Kategori Kejadian.");
      return;
    }
    if (!urgency) {
      onShowToast("Peringatan: Silakan pilih Tingkat Urgensi Intervensi.");
      return;
    }

    setIsSubmitting(true);
    const t0 = performance.now();

    try {
      // 1. Generate 8-character high-entropy alphanumeric token
      const token = generateHighEntropyToken(8);

      // 2. Hash this token using SHA-256 (crypto.subtle.digest)
      const tokenHash = await computeSha256(token);

      // 3. Generate ephemeral AES-GCM 256-bit key and 12-byte IV
      const aesKey = await generateAesGcmKey();
      const iv = generate12ByteIv();
      const ivHex = Array.from(iv).map((b) => b.toString(16).padStart(2, "0")).join("");

      // 4. Encrypt form payload into Base64 ciphertext
      // STRICT ZERO-KNOWLEDGE: Only include identity if mode is explicitly VERIFIED_KTS
      const isVerified = crisisMode === "VERIFIED_KTS";
      const payload: CrisisPayload = {
        token,
        tokenHash,
        category,
        urgency,
        narrative: narrative.trim() || "(Tidak ada kronologi tambahan - santri menggunakan opsi rapid-tap)",
        alibi,
        mode: crisisMode,
        identity:
          isVerified && verifiedStudent
            ? {
                nama: verifiedStudent.nama,
                nis: verifiedStudent.nis,
                kelas: verifiedStudent.kelas,
                kamar: verifiedStudent.kamar,
                consent: consentLevel,
                parentsAllowed: consentParents,
              }
            : null,
        clientTimestamp: new Date().toISOString(),
      };

      const base64Ciphertext = await encryptPayloadWithAesGcm(payload, aesKey, iv);

      // 5. Wrap Ephemeral AES key into RSA-OAEP Asymmetric Envelope for Counselor
      const rawAesKey = await window.crypto.subtle.exportKey("raw", aesKey);
      const encryptedKeyBase64 = await encryptAesKeyWithRsaOaep(rawAesKey);

      const t1 = performance.now();
      const durationMs = (t1 - t0).toFixed(2);

      const record: EncryptedSubmissionRecord = {
        token,
        tokenHash,
        base64Ciphertext,
        ivHex,
        encryptedKeyBase64,
        durationMs,
        payload,
        aesKey,
      };

      // Purge plaintext form state immediately from memory
      setNarrative("");
      setCategory(null);
      setUrgency(null);

      // Delegate persistence to single-source authority in page.tsx with verified payload
      onEncryptedSubmit(record);
      onShowToast("Payload berhasil dienkripsi! Tanda terima kriptografis siap.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert("Gagal menjalankan enkripsi SubtleCrypto: " + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="max-w-4xl mx-auto min-h-[calc(100vh-6rem)] pt-2 sm:pt-6 pb-12 sm:pb-16 px-3.5 sm:px-6">
      {/* Navigation & Security Banner */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-4 border-b border-slate-200 pb-4 mb-4 sm:mb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={onBackToMain}
          className="flex items-center justify-center space-x-2 text-slate-700 hover:text-slate-900 w-full sm:w-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Menu Utama</span>
        </Button>

        <div className="flex items-center justify-center space-x-2 text-[11px] sm:text-xs font-mono text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200 shadow-sm text-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 animate-pulse shrink-0" />
          <span className="truncate">RAM-Only Buffer • WebCrypto AES-GCM • Anti-Snoop</span>
        </div>
      </div>

      {/* Main Form Card Container */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-7 md:p-10 shadow-xl shadow-slate-200/60 border border-slate-100 relative">
        {/* Mode Switcher Tabs Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5 sm:pb-6">
          <div>
            <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-rose-600 font-bold bg-rose-50 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-rose-200 shadow-sm">
              Pintu Perlindungan &amp; Advokasi Santri
            </span>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
              Formulir Pelaporan Insiden &amp; Krisis
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Tentukan mode identitas Anda di bawah ini sebelum mengisi rincian insiden.
            </p>
          </div>

          {/* Dual Mode Toggle Pills */}
          <div className="bg-slate-100 p-1 sm:p-1.5 rounded-2xl flex items-center border border-slate-200 w-full sm:w-auto shadow-inner">
            <button
              type="button"
              onClick={() => setCrisisMode("ANONYMOUS")}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1.5 sm:space-x-2 ${
                crisisMode === "ANONYMOUS"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>100% Anonim</span>
            </button>
            <button
              type="button"
              onClick={() => setCrisisMode("VERIFIED_KTS")}
              className={`flex-1 sm:flex-initial px-3 sm:px-4 py-2 sm:py-2 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center space-x-1.5 sm:space-x-2 ${
                crisisMode === "VERIFIED_KTS"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
              <span>Terverifikasi (KTS)</span>
            </button>
          </div>
        </div>

        {/* 100% ANONYMOUS ZERO-KNOWLEDGE BANNER */}
        {crisisMode === "ANONYMOUS" && (
          <div className="mt-4 sm:mt-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-2xl p-4 sm:p-5 border border-slate-700/80 shadow-md">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
              <div className="flex items-start space-x-3.5">
                <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                  <Lock className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                      Bilik Zero-Knowledge Aktif
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      RAM-Only • Client-Side AES-256
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white mt-1">
                    Pelaporan 100% Bebas Identitas &amp; Terenkripsi Penuh
                  </h4>
                  <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                    Kamera pemindai &amp; pembaca KTS dinonaktifkan sepenuhnya. Anda akan menerima <strong>8-karakter kode token</strong> di akhir pelaporan untuk mengecek tindak lanjut konselor tanpa membuka identitas Anda.
                  </p>
                </div>
              </div>

              <div className="text-right sm:border-l sm:border-slate-800 sm:pl-4 shrink-0">
                <span className="text-[10px] font-mono text-emerald-400 font-semibold block uppercase">
                  Privasi Maksimal
                </span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Jaminan Anti-Retaliasi
                </span>
              </div>
            </div>
          </div>
        )}

        {/* VERIFIED KTS BARCODE SECTION */}
        {crisisMode === "VERIFIED_KTS" && (
          <div className="mt-6 bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-white rounded-2xl p-5 border-2 border-emerald-300">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-emerald-200/70 pb-4">
              <div>
                <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-0.5 rounded-full border border-emerald-300">
                  <ScanBarcode className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Jalur Terverifikasi Barcode Kartu Tanda Santri (KTS)</span>
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-1">
                  Pemindaian Barcode Kartu Identitas Santri
                </h4>
                <p className="text-xs text-slate-500">
                  Arahkan barcode pada fisik KTS ke kamera scanner kiosk untuk melampirkan identitas resmi secara aman.
                </p>
              </div>

              <Button
                type="button"
                variant="emerald"
                onClick={onOpenBarcodeCamera}
                className="flex items-center space-x-2 shadow-md"
              >
                <ScanBarcode className="w-4 h-4" />
                <span>Buka Kamera Scan Barcode KTS</span>
              </Button>
            </div>

            {/* Scanned Santri Profile Container */}
            {verifiedStudent ? (
              <div className="mt-4 p-4 rounded-xl bg-white border border-emerald-200 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center font-bold text-lg shadow-md border-2 border-white">
                      {verifiedStudent.nama.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-slate-900 text-base">
                          {verifiedStudent.nama}
                        </h4>
                        <Badge variant="emerald">KTS VALID</Badge>
                      </div>
                      <div className="text-xs font-mono text-slate-500 mt-0.5">
                        NIS: <span className="font-bold text-slate-800">{verifiedStudent.nis}</span> •{" "}
                        <span>{verifiedStudent.kelas}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-0.5 flex items-center space-x-1">
                        <Home className="w-3 h-3 text-emerald-600" />
                        <span>{verifiedStudent.kamar}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-100 sm:pl-4">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                      Prioritas Pendampingan
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-200 inline-block mt-1">
                      Pendampingan Terbimbing Konselor
                    </span>
                  </div>
                </div>

                {/* Barcode Graphic Badge */}
                <div className="mt-3 flex items-center space-x-2 bg-slate-50 p-2 rounded-lg border border-slate-200 w-fit">
                  <div className="font-mono text-[9px] tracking-widest text-slate-800 flex items-center space-x-1 bg-white px-2 py-1 border border-slate-300 rounded">
                    <span className="font-black text-xs">||| | ||||| | || |||| | ||||||</span>
                    <span className="text-[10px] text-slate-600 ml-1 font-bold">
                      {verifiedStudent.barcode}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center space-x-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>Barcode 1D Terverifikasi</span>
                  </span>
                </div>
              </div>
            ) : (
              <div className="mt-4 p-5 rounded-2xl bg-white border-2 border-dashed border-emerald-300 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <div className="flex items-center space-x-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                    <ScanBarcode className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-900">
                      Kartu Tanda Santri Belum Dipindai
                    </h5>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Klik tombol pemindai di atas untuk membaca barcode fisik KTS Anda. Jika ingin melapor tanpa nama, pilih tombol <strong>100% Anonim</strong> di kanan atas.
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="emerald"
                  size="sm"
                  onClick={onOpenBarcodeCamera}
                  className="shadow-sm shrink-0"
                >
                  <ScanBarcode className="w-4 h-4 mr-1.5" />
                  <span>Scan KTS Sekarang</span>
                </Button>
              </div>
            )}

              {/* Consent & Data Disclosure Options */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-700 font-bold mb-2">
                  Persetujuan Transparansi &amp; Batas Pembukaan Identitas Anda:
                </label>
                <div className="space-y-2">
                  <label className="flex items-start space-x-2.5 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/50 cursor-pointer text-xs text-slate-700 transition-colors">
                    <input
                      type="radio"
                      name="kts-consent"
                      value="RESTRICTED_COUNSELOR"
                      checked={consentLevel === "RESTRICTED_COUNSELOR"}
                      onChange={(e) => setConsentLevel(e.target.value)}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      <strong>Tingkat 1 (Restricted):</strong> Hanya ditampilkan kepada Konselor &amp; Pengasuh Utama. Identitas tidak dibuka kepada pengurus asrama/santri lain.
                    </span>
                  </label>

                  <label className="flex items-start space-x-2.5 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/50 cursor-pointer text-xs text-slate-700 transition-colors">
                    <input
                      type="radio"
                      name="kts-consent"
                      value="FULL_SATGAS"
                      checked={consentLevel === "FULL_SATGAS"}
                      onChange={(e) => setConsentLevel(e.target.value)}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      <strong>Tingkat 2 (Investigasi Penuh):</strong> Buka identitas penuh untuk investigasi resmi Tim Satgas &amp; Advokasi Hukum Pesantren.
                    </span>
                  </label>

                  <label className="flex items-start space-x-2.5 p-2 rounded-xl bg-slate-50 hover:bg-emerald-50/50 cursor-pointer text-xs text-slate-700 transition-colors">
                    <input
                      type="checkbox"
                      checked={consentParents}
                      onChange={(e) => setConsentParents(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                    />
                    <span>
                      Boleh dihubungi langsung ke wali santri / orang tua jika situasi darurat memerlukan penanganan medis atau perlindungan keluarga.
                    </span>
                  </label>
                </div>
              </div>

              {/* Anti-Retaliation Guarantee Notice */}
              <div className="mt-3 p-3 bg-amber-50/80 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start space-x-2">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <p>
                  <strong>Jaminan Anti-Retaliasi:</strong> Sesuai Maklumat Pengasuh Pesantren No. 04/2026, santri yang melapor dengan KTS terverifikasi berhak mendapat proteksi penuh dari segala bentuk intimidasi senior/oknum. Pelanggar jaminan ini akan ditindak tegas tanpa kompromi.
                </p>
              </div>
            </div>
        )}

        {/* Section 1: Categories Guided Rapid-Tap Chips */}
        <div className="mt-6">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-3">
            1. Pilih Kategori Kejadian (Sentuh Cepat) *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setCategory("Kekerasan/TPKS")}
              className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col justify-between shadow-sm ${
                category === "Kekerasan/TPKS"
                  ? "border-rose-500 bg-rose-50/70 ring-2 ring-rose-500/20"
                  : "border-slate-200 hover:border-rose-400 hover:bg-rose-50/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-rose-100 text-rose-700">
                  <AlertTriangle className="w-5 h-5" />
                </span>
                {category === "Kekerasan/TPKS" && (
                  <CheckCircle2 className="w-5 h-5 text-rose-600" />
                )}
              </div>
              <div className="mt-4">
                <span className="font-bold text-slate-900 block text-base leading-tight">
                  Kekerasan / TPKS
                </span>
                <span className="text-xs text-slate-500 mt-1 block">
                  Pelanggaran fisik atau asusila berat
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCategory("Bullying Fisik/Verbal")}
              className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col justify-between shadow-sm ${
                category === "Bullying Fisik/Verbal"
                  ? "border-amber-500 bg-amber-50/70 ring-2 ring-amber-500/20"
                  : "border-slate-200 hover:border-amber-400 hover:bg-amber-50/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-amber-100 text-amber-700">
                  <UserX className="w-5 h-5" />
                </span>
                {category === "Bullying Fisik/Verbal" && (
                  <CheckCircle2 className="w-5 h-5 text-amber-600" />
                )}
              </div>
              <div className="mt-4">
                <span className="font-bold text-slate-900 block text-base leading-tight">
                  Bullying Fisik/Verbal
                </span>
                <span className="text-xs text-slate-500 mt-1 block">
                  Perundungan senior, intimidasi, pemalakan
                </span>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setCategory("Krisis Mental")}
              className={`p-5 rounded-2xl border-2 text-left transition-all duration-300 flex flex-col justify-between shadow-sm ${
                category === "Krisis Mental"
                  ? "border-indigo-500 bg-indigo-50/70 ring-2 ring-indigo-500/20"
                  : "border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/40"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                  <HeartPulse className="w-5 h-5" />
                </span>
                {category === "Krisis Mental" && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                )}
              </div>
              <div className="mt-4">
                <span className="font-bold text-slate-900 block text-base leading-tight">
                  Krisis Mental
                </span>
                <span className="text-xs text-slate-500 mt-1 block">
                  Tekanan batin hebat, cemas, butuh konselor
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Section 2: Urgency Selector Chips */}
        <div className="mt-6">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-3">
            2. Tingkat Urgensi Intervensi *
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setUrgency("CRITICAL")}
              className={`py-3 px-3 sm:py-3.5 sm:px-4 rounded-xl sm:rounded-full border-2 text-center font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm ${
                urgency === "CRITICAL"
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "border-slate-200 hover:border-rose-500 hover:bg-rose-50 text-slate-700"
              }`}
            >
              CRITICAL (&lt;24 Jam)
            </button>
            <button
              type="button"
              onClick={() => setUrgency("MEDIUM")}
              className={`py-3 px-3 sm:py-3.5 sm:px-4 rounded-xl sm:rounded-full border-2 text-center font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm ${
                urgency === "MEDIUM"
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "border-slate-200 hover:border-amber-500 hover:bg-amber-50 text-slate-700"
              }`}
            >
              MEDIUM (1-3 Hari)
            </button>
            <button
              type="button"
              onClick={() => setUrgency("LOW")}
              className={`py-3 px-3 sm:py-3.5 sm:px-4 rounded-xl sm:rounded-full border-2 text-center font-bold text-[11px] sm:text-xs uppercase tracking-wider transition-all duration-200 active:scale-95 shadow-sm ${
                urgency === "LOW"
                  ? "bg-slate-900 text-white border-slate-900 shadow-md"
                  : "border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-700"
              }`}
            >
              LOW (Terjadwal)
            </button>
          </div>
        </div>

        {/* Section 3: Safe Alibi Pick */}
        <div className="mt-6">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
            3. Pilih Alibi Pemanggilan Resmi (Agar Tidak Menimbulkan Kecurigaan Teman Sebaya)
          </label>
          <select
            value={alibi}
            onChange={(e) => setAlibi(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
          >
            <option value="medical">Alibi Medis: Pemeriksaan Rutin Poskestren (Klinik Santri)</option>
            <option value="tahfidz">Alibi Akademik: Evaluasi Setoran Tahfidz &amp; Tajwid</option>
            <option value="sarpras">Alibi Logistik: Verifikasi Pengambilan Paket / Barang Asrama</option>
            <option value="bahasa">Alibi Bahasa: Bimbingan Pidato / Muhadharah</option>
          </select>
        </div>

        {/* Section 4: Optional Narrative / Clue */}
        <div className="mt-6">
          <label className="block text-xs font-mono uppercase tracking-wider text-slate-500 font-semibold mb-2">
            {crisisMode === "VERIFIED_KTS"
              ? "4. Rincian Kronologi & Pelaku / Saksi (Data Dijamin Rahasia)"
              : "4. Petunjuk Singkat Lokasi / Kejadian (Opsional, Tanpa Menyebut Nama Anda)"}
          </label>
          <textarea
            value={narrative}
            onChange={(e) => setNarrative(e.target.value)}
            placeholder="Contoh: Terjadi di lorong asrama barat lantai 2 sehabis jamaah isya..."
            rows={3}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm sm:text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-sans"
          />
        </div>

        {/* Encrypt & Submit Button */}
        <div className="mt-6 sm:mt-8 pt-5 sm:pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="text-[11px] sm:text-xs text-slate-400 font-mono text-center sm:text-left">
            {crisisMode === "VERIFIED_KTS"
              ? "Identitas KTS dilindungi komitmen perlindungan santri & hanya dibuka sesuai persetujuan di atas."
              : "Mode Zero-Knowledge: Tidak ada nama, KTS, log kamera, ataupun IP yang tersimpan di server."}
          </div>

          <Button
            type="button"
            variant="default"
            size="lg"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 sm:px-8 py-3.5 sm:py-4 bg-slate-950 hover:bg-slate-800 text-white rounded-xl sm:rounded-full font-bold text-xs sm:text-sm tracking-wide shadow-xl flex items-center justify-center space-x-2 shrink-0 active:scale-98"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                <span>Membangkitkan Entropi...</span>
              </>
            ) : (
              <>
                <Key className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="truncate">
                  {crisisMode === "VERIFIED_KTS"
                    ? "Kirim Laporan Terverifikasi KTS"
                    : "Generate Token & Encrypt"}
                </span>
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  );
}
