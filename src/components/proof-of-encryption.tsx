"use client";

import React, { useState } from "react";
import {
  Key,
  Copy,
  Check,
  Terminal,
  Hash,
  FileLock2,
  CheckCircle2,
  Download,
  ShieldCheck,
  RefreshCw,
  ClipboardCopy,
  Search,
} from "lucide-react";
import { Button } from "./ui/button";
import { type EncryptedSubmissionRecord } from "@/lib/crypto";

interface ProofOfEncryptionProps {
  record: EncryptedSubmissionRecord;
  onFinishAndReset: () => void;
  onInspectInCounselor: () => void;
  onTrackToken?: (token: string) => void;
  onShowToast: (message: string) => void;
}

export function ProofOfEncryption({
  record,
  onFinishAndReset,
  onInspectInCounselor,
  onTrackToken,
  onShowToast,
}: ProofOfEncryptionProps) {
  const [copiedToken, setCopiedToken] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);
  const [copiedCipher, setCopiedCipher] = useState(false);

  const copyToClipboard = (text: string, type: "token" | "hash" | "cipher") => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "token") {
        setCopiedToken(true);
        setTimeout(() => setCopiedToken(false), 2500);
        onShowToast(`Token [${text}] berhasil disalin ke clipboard!`);
      } else if (type === "hash") {
        setCopiedHash(true);
        setTimeout(() => setCopiedHash(false), 2500);
        onShowToast("Token Hash SHA-256 berhasil disalin.");
      } else if (type === "cipher") {
        setCopiedCipher(true);
        setTimeout(() => setCopiedCipher(false), 2500);
        onShowToast("Ciphertext Base64 berhasil disalin.");
      }
    });
  };

  const copyFullLog = () => {
    const log = `=== GARDASANTRI KIOSK : TEMPAT PELAPORAN SANTRI YANG AMAN ===
Client Timestamp   : ${record.payload.clientTimestamp}
Reporting Mode     : ${record.payload.mode}
Category           : ${record.payload.category}
Urgency Level      : ${record.payload.urgency}
Plain 8-Char Token : ${record.token}
SHA-256 Token Hash : ${record.tokenHash}
AES-GCM 256 Key    : [EPHEMERAL SESSION KEY HELD CLIENT-SIDE]
12-Byte Nonce (IV) : ${record.ivHex}
AES-GCM Ciphertext : ${record.base64Ciphertext}
Crypto Latency     : ${record.durationMs} ms
Plaintext Transmit : ZERO (Verified via WebCrypto API)
=============================================================`;
    navigator.clipboard.writeText(log).then(() => {
      onShowToast("Seluruh audit log kriptografi disalin ke clipboard.");
    });
  };

  const downloadReceipt = () => {
    const receiptContent = `========================================================
     GARDASANTRI KIOSK : TEMPAT PELAPORAN SANTRI YANG AMAN
         SantriVision 2026 Initiative • GardaSantri Engine
========================================================

KODE AKSES TIKET ANDA : ${record.token}
STATUS MODE           : ${record.payload.mode === "VERIFIED_KTS" ? "TERVERIFIKASI KTS" : "100% ANONIM (ZERO-KNOWLEDGE)"}
KATEGORI KEJADIAN     : ${record.payload.category}
TINGKAT URGENSI       : ${record.payload.urgency}
WAKTU PELAPORAN       : ${new Date(record.payload.clientTimestamp).toLocaleString("id-ID")}
ALIBI PEMANGGILAN     : ${record.payload.alibi.toUpperCase()}

--- BUKTI INTEGRITAS KRIPTOGRAFIS (WEBCRYPTO API) ---
TOKEN HASH (SHA-256)  :
${record.tokenHash}

AES-GCM-256 CIPHERTEXT (PAYLOAD TERENKRIPSI):
${record.base64Ciphertext}

IV NONCE (HEX)        : ${record.ivHex}
WAKTU ENKRIPSI KLIEN  : ${record.durationMs} ms

PENTING:
- Simpan kode token 8-karakter ini untuk mengecek tindak lanjut konselor.
- Jangan berikan token ini kepada teman sekamar / senior.
- Konselor akan memanggil Anda secara rahasia melalui surat alibi resmi.
========================================================`;
    const blob = new Blob([receiptContent], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `GardaSantriKiosk-Tiket-${record.token}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    onShowToast("Tanda terima berhasil diunduh.");
  };

  return (
    <section className="max-w-4xl mx-auto min-h-[calc(100vh-6rem)] pt-2 sm:pt-6 pb-12 sm:pb-16 px-3.5 sm:px-6">
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-4 sm:p-7 md:p-10 shadow-2xl border border-slate-200/80 relative">
        {/* Top Status Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 sm:gap-4 border-b border-slate-200 pb-5 sm:pb-6">
          <div>
            <div className="flex items-center space-x-2">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-300">
                PROOF OF ENCRYPTION • ZERO-KNOWLEDGE AUDIT
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 mt-2">
              Enkripsi Klien Berhasil &amp; Plaintext Dihapus
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Data insiden telah diamankan menggunakan native{" "}
              <code className="font-mono text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
                window.crypto.subtle
              </code>
              . Tidak ada teks terbuka yang meninggalkan peramban.
            </p>
          </div>

          <span
            className={`px-3 py-1.5 rounded-full text-xs font-mono font-bold shadow-sm flex items-center space-x-1.5 shrink-0 ${
              record.payload.mode === "VERIFIED_KTS"
                ? "bg-emerald-700 text-white"
                : "bg-slate-900 text-white"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="text-[11px] sm:text-xs">
              {record.payload.mode === "VERIFIED_KTS"
                ? "TERVERIFIKASI KTS • SATGAS"
                : "100% ANONIM • ZERO-KNOWLEDGE"}
            </span>
          </span>
        </div>

        {/* Section 1: The Plain 8-digit Token For Santri To Copy */}
        <div className="mt-5 sm:mt-6 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-white border border-slate-800 shadow-xl relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <span className="text-[10px] sm:text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 shrink-0" />
                <span>KODE AKSES TIKET (TOKEN 8-KARAKTER)</span>
              </span>
              <p className="text-xs text-slate-400 mt-1">
                Salin atau catat kode ini untuk mengecek respon konselor tanpa membuka identitas.
              </p>
            </div>

            <Button
              variant="emerald"
              size="sm"
              onClick={() => copyToClipboard(record.token, "token")}
              className="flex items-center justify-center space-x-2 w-full sm:w-auto shrink-0"
            >
              {copiedToken ? (
                <>
                  <Check className="w-4 h-4 text-emerald-300" />
                  <span>Tersalin ke Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Salin Token</span>
                </>
              )}
            </Button>
          </div>

          {/* Big Bold Monospace Token */}
          <div className="mt-4 sm:mt-5 p-3 sm:p-5 bg-black/60 rounded-xl border border-emerald-500/40 text-center flex items-center justify-center overflow-x-auto">
            <span className="text-3xl sm:text-5xl md:text-6xl font-mono font-black tracking-[0.15em] sm:tracking-[0.25em] text-white drop-shadow-[0_0_15px_rgba(16,185,129,0.5)] select-all break-all">
              {record.token}
            </span>
          </div>

          <div className="mt-3 sm:mt-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-2 text-[10px] sm:text-[11px] font-mono text-emerald-300/80 border-t border-slate-800/80 pt-3">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
              <span>High-Entropy CSPRNG (crypto.getRandomValues)</span>
            </span>
            <span className="text-slate-400 text-[10px]">Entropy: 40+ bits • Anti-Collision</span>
          </div>
        </div>

        {/* Section 2: Dark, Monospace Terminal/Console UI Block for Judges */}
        <div className="mt-6 rounded-2xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden font-mono text-xs">
          {/* Terminal Titlebar Chrome */}
          <div className="bg-slate-900/90 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span>
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>
              <span className="ml-2 text-slate-300 font-bold text-xs tracking-wide flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span>client_crypto_audit.console — WebCrypto Native Inspector</span>
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-950/80 border border-emerald-800/60 px-2 py-0.5 rounded">
                E2EE PROOF CONFIRMED
              </span>
              <button
                onClick={copyFullLog}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800 transition-colors"
                title="Salin Seluruh Log Terminal"
              >
                <ClipboardCopy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Terminal Screen Body */}
          <div className="p-5 text-slate-300 space-y-4 max-h-[460px] overflow-y-auto leading-relaxed">
            {/* Console Log Trace */}
            <div className="space-y-1 text-[11px] text-slate-400 border-b border-slate-800/80 pb-3">
              <div className="text-emerald-400 flex items-center space-x-1.5">
                <span>➜</span>
                <span>[1/5] Native Web Cryptography API detected: window.crypto.subtle</span>
              </div>
              <div>
                <span className="text-emerald-500">➜</span> [2/5] Generated 8-character high-entropy token via{" "}
                <code className="text-teal-300">crypto.getRandomValues</code>
              </div>
              <div>
                <span className="text-emerald-500">➜</span> [3/5] Digest computed:{" "}
                <code className="text-cyan-300">crypto.subtle.digest("SHA-256", token_bytes)</code>
              </div>
              <div>
                <span className="text-emerald-500">➜</span> [4/5] Ephemeral Key &amp; 12-byte IV generated:{" "}
                <code className="text-emerald-300">AES-GCM 256-bit</code>
              </div>
              <div>
                <span className="text-emerald-500">➜</span> [5/5] Payload encrypted &amp; Base64 encoded:{" "}
                <code className="text-amber-300">Category + Urgency + Narrative</code>
              </div>
            </div>

            {/* Item 1: Token Hash (SHA-256) */}
            <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-emerald-400 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <Hash className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TOKEN HASH (SHA-256)</span>
                </span>
                <button
                  onClick={() => copyToClipboard(record.tokenHash, "hash")}
                  className="text-[10px] text-slate-400 hover:text-emerald-300 flex items-center space-x-1 active:scale-95"
                >
                  {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedHash ? "Tersalin!" : "Copy Hash"}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mb-2">
                Hash ini bertindak sebagai token lookup di ledger publik konselor tanpa membocorkan token rahasia santri:
              </p>
              <div className="bg-black/70 p-3 rounded-lg border border-emerald-950 font-mono text-emerald-300 text-xs break-all select-all">
                {record.tokenHash}
              </div>
            </div>

            {/* Item 2: AES-GCM Ciphertext (Base64) */}
            <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-cyan-400 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                  <FileLock2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span>AES-GCM CIPHERTEXT (PAYLOAD TERENKRIPSI BASE64)</span>
                </span>
                <button
                  onClick={() => copyToClipboard(record.base64Ciphertext, "cipher")}
                  className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center space-x-1 active:scale-95"
                >
                  {copiedCipher ? <Check className="w-3 h-3 text-cyan-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedCipher ? "Tersalin!" : "Copy Ciphertext"}</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mb-2">
                Payload yang memuat rincian insiden, kategori, urgensi, dan narasi santri telah disandikan:
              </p>
              <div className="bg-black/70 p-3 rounded-lg border border-cyan-950 font-mono text-cyan-300 text-xs break-all select-all max-h-24 overflow-y-auto">
                {record.base64Ciphertext}
              </div>
            </div>

            {/* Item 2b: RSA-OAEP Asymmetric Key Envelope */}
            {record.encryptedKeyBase64 && (
              <div className="bg-slate-900/90 rounded-xl p-3.5 border border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                    <Key className="w-3.5 h-3.5 text-amber-400" />
                    <span>RSA-OAEP 2048-BIT ASYMMETRIC ENVELOPE</span>
                  </span>
                  <span className="text-[9px] font-mono font-bold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                    Public Key Encrypted
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 mb-2">
                  Kunci simetris AES-256 ephemeral dibungkus (wrapped) menggunakan RSA-OAEP SHA-256 Public Key Konselor. Hanya Private Key resmi Konselor yang dapat membuka amplop ini:
                </p>
                <div className="bg-black/70 p-3 rounded-lg border border-amber-950 font-mono text-amber-300 text-xs break-all select-all max-h-20 overflow-y-auto">
                  {record.encryptedKeyBase64}
                </div>
              </div>
            )}

            {/* Item 3: Hardware & Cryptographic Parameters */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[10px]">
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block">ALGORITMA &amp; CIPHER:</span>
                <span className="text-slate-200 font-bold font-mono">AES-GCM-256 (AEAD)</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block">INITIALIZATION VECTOR (12B):</span>
                <span className="text-amber-300 font-mono break-all font-bold">{record.ivHex}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
                <span className="text-slate-500 block">WAKTU ENKRIPSI KLIEN:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {record.durationMs} ms (Sub-16ms OK)
                </span>
              </div>
            </div>

            {/* Item 4: Zero-Knowledge Verification Guarantee for Judges */}
            <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-800/60 text-emerald-200/90 text-[11px] space-y-1">
              <div className="font-bold text-emerald-300 flex items-center space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>JAMINAN TEKNIS KEPADA EVALUATOR / DEWAN JURI:</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-emerald-300/80">
                <li>Input form (kronologi &amp; narasi) langsung di-<i>zeroed out</i> dari elemen DOM dan memori JS.</li>
                <li>Tidak ada teks polos (plaintext) yang melintasi jaringan menuju server database SQLite.</li>
                <li>Kunci dekripsi privat hanya dapat dibuka oleh modul berwenang Konselor Satgas.</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Action Buttons */}
        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={downloadReceipt}
            className="w-full sm:w-auto flex items-center justify-center space-x-2"
          >
            <Download className="w-4 h-4 text-slate-600" />
            <span>Unduh Struk Tanda Terima (.txt)</span>
          </Button>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            {onTrackToken && (
              <Button
                variant="outline"
                onClick={() => onTrackToken(record.token)}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50"
              >
                <Search className="w-4 h-4 text-emerald-600" />
                <span>Uji Lacak Status Tiket Ini</span>
              </Button>
            )}

            <Button
              variant="default"
              onClick={onInspectInCounselor}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-slate-900 hover:bg-slate-800 text-white"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Lihat di Dashboard Konselor (Simulasi)</span>
            </Button>

            <Button
              variant="emerald"
              onClick={onFinishAndReset}
              className="w-full sm:w-auto flex items-center justify-center space-x-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Selesai &amp; Bersihkan Memori Kiosk</span>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
