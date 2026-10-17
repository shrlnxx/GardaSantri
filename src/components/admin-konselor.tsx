"use client";

import React, { useState } from "react";
import {
  BadgeCheck,
  Lock,
  AlertOctagon,
  Unlock,
  Check,
  Send,
  CalendarCheck,
  Shield,
  Loader2,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { decryptPayloadFromBase64, decryptPayloadWithHybrid, type CrisisPayload, type EncryptedSubmissionRecord } from "@/lib/crypto";

interface AdminKonselorProps {
  liveRecords: Map<string, EncryptedSubmissionRecord>;
  onShowToast: (message: string) => void;
}

export function AdminKonselor({ liveRecords, onShowToast }: AdminKonselorProps) {
  const [filter, setFilter] = useState<"ALL" | "ANON" | "KTS">("ALL");
  const [decryptedState, setDecryptedState] = useState<Record<string, CrisisPayload>>({});
  const [decryptingTokens, setDecryptingTokens] = useState<Record<string, boolean>>({});
  const [alibiSentTokens, setAlibiSentTokens] = useState<Record<string, boolean>>({});

  const handleDecryptLive = async (token: string) => {
    const record = liveRecords.get(token);
    if (!record) {
      alert("Kunci sesi privat tidak tersedia di memori.");
      return;
    }

    setDecryptingTokens((prev) => ({ ...prev, [token]: true }));

    try {
      let decrypted: CrisisPayload;
      if (record.encryptedKeyBase64) {
        decrypted = await decryptPayloadWithHybrid(record.base64Ciphertext, record.encryptedKeyBase64);
      } else {
        decrypted = await decryptPayloadFromBase64(record.base64Ciphertext, record.aesKey);
      }

      setTimeout(() => {
        setDecryptedState((prev) => ({ ...prev, [token]: decrypted }));
        setDecryptingTokens((prev) => ({ ...prev, [token]: false }));
        onShowToast(`Tiket [${token}] berhasil didekripsi menggunakan Kunci Privat RSA-OAEP Konselor.`);
      }, 400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert("Gagal mendekripsi: " + msg);
      setDecryptingTokens((prev) => ({ ...prev, [token]: false }));
    }
  };

  const handleSendAlibi = (token: string) => {
    setAlibiSentTokens((prev) => ({ ...prev, [token]: true }));
    onShowToast(`Surat alibi pemanggilan rahasia untuk tiket [${token}] telah dikirimkan ke asrama.`);
  };

  const handleScheduleSession = (name: string, dorm: string) => {
    alert(`Jadwal Konseling Terlindung dibuat:\n\nSantri: ${name} (${dorm})\nRuang: Bilik Konseling Khusus Poskestren\nAlibi: Pemeriksaan Kesehatan Berkala\nWaktu: Hari ini pukul 16:00 WIB`);
    onShowToast(`Jadwal konseling rahasia untuk ${name} telah ditetapkan.`);
  };

  const handleDispatchSatgas = (name: string) => {
    alert(`Protokol Satgas Diaktifkan:\n\nSantri: ${name}\nTindakan: Petugas Satgas Advokasi Pesantren mendampingi santri secara diskret serta memantau lorong asrama.`);
    onShowToast(`Satgas Perlindungan Santri ditugaskan untuk mengawal ${name}.`);
  };

  const liveList = Array.from(liveRecords.values());
  const activeKtsCount = liveList.filter((r) => r.payload.mode === "VERIFIED_KTS").length + 1;
  const activeAnonCount = liveList.filter((r) => r.payload.mode === "ANONYMOUS").length + 1;

  return (
    <section className="max-w-7xl mx-auto min-h-[calc(100vh-4rem)] pt-6 pb-16 px-4 sm:px-6">
      {/* Board Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200">
              Pusat Komando Konseling &amp; Satgas Anti-Kekerasan
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            Ruang Perlindungan Santri — Konselor Board
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Menangani laporan darurat: Tiket <strong>Anonim (Zero-Knowledge)</strong> tanpa data pengenal, serta Tiket <strong>Terverifikasi KTS</strong> untuk intervensi personal langsung.
          </p>
        </div>

        {/* Quick Status Metrics */}
        <div className="flex items-center space-x-3">
          <div className="bg-white border border-slate-200 p-3 px-5 rounded-2xl shadow-sm text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Tiket KTS Aktif</span>
            <span className="text-xl font-bold text-emerald-600 font-mono">{activeKtsCount} Kasus</span>
          </div>
          <div className="bg-white border border-slate-200 p-3 px-5 rounded-2xl shadow-sm text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Tiket Anonim</span>
            <span className="text-xl font-bold text-rose-600 font-mono">{activeAnonCount} Kasus</span>
          </div>
          <div className="bg-white border border-slate-200 p-3 px-5 rounded-2xl shadow-sm text-center">
            <span className="text-[10px] font-mono text-slate-400 uppercase block">Rata-rata SLA</span>
            <span className="text-xl font-bold text-slate-800 font-mono">3.4 Jam</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 bg-slate-100/90 p-2 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-mono uppercase text-slate-500 font-semibold px-2">Filter Laporan:</span>
          <button
            onClick={() => setFilter("ALL")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "ALL" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Semua Laporan ({liveList.length + 3})
          </button>
          <button
            onClick={() => setFilter("ANON")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "ANON" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            100% Anonim (Zero-Knowledge)
          </button>
          <button
            onClick={() => setFilter("KTS")}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filter === "KTS" ? "bg-emerald-700 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Terverifikasi KTS
          </button>
        </div>

        <div className="text-xs font-mono text-slate-500 flex items-center space-x-1 px-2">
          <Badge variant="emerald">Audit Trail Terenkripsi SHA-256</Badge>
        </div>
      </div>

      {/* Kanban / Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Masuk (New Unhandled Tickets) */}
        <div className="bg-slate-100/70 p-5 rounded-3xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Masuk (Butuh Intervensi Cepat)</span>
            </h3>
            <span className="text-xs font-mono bg-white px-2 py-0.5 rounded-full font-bold text-slate-600 border border-slate-200">
              {liveList.length + 2}
            </span>
          </div>

          <div className="space-y-4">
            {/* Render live submitted tickets */}
            {liveList.map((rec) => {
              const isAnon = rec.payload.mode === "ANONYMOUS";
              if (filter === "ANON" && !isAnon) return null;
              if (filter === "KTS" && isAnon) return null;

              const decrypted = decryptedState[rec.token];
              const isDecrypting = decryptingTokens[rec.token];
              const isAlibiSent = alibiSentTokens[rec.token];

              return (
                <div
                  key={rec.token}
                  className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${
                    isAnon ? "border-slate-800" : "border-emerald-300"
                  } hover:shadow-lg transition-all relative overflow-hidden`}
                >
                  <div
                    className={`absolute top-0 right-0 left-0 h-1.5 ${
                      isAnon ? "bg-slate-800" : "bg-gradient-to-r from-emerald-500 to-teal-500"
                    }`}
                  ></div>

                  <div className="flex items-start justify-between mt-1">
                    <Badge variant={isAnon ? "default" : "emerald"}>
                      {isAnon ? "100% ANONIM (LIVE)" : "TERVERIFIKASI KTS (LIVE)"}
                    </Badge>
                    <Badge variant="destructive">{rec.payload.urgency}</Badge>
                  </div>

                  {!isAnon && rec.payload.identity && (
                    <div className="mt-3.5 flex items-center space-x-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                      <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                        {rec.payload.identity.nama.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                          {rec.payload.identity.nama}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 truncate">
                          NIS: {rec.payload.identity.nis} • {rec.payload.identity.kamar}
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-3">
                    <div className="text-[10px] font-mono text-slate-400">TOKEN HASH PELACAKAN:</div>
                    <div className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                      {rec.tokenHash.substring(0, 8)}... [{rec.token}]
                    </div>
                  </div>

                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                      Kategori: {rec.payload.category}
                    </span>
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold">
                      Alibi: {rec.payload.alibi}
                    </span>
                  </div>

                  {/* Decrypted Payload Container */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-600">
                    <span className="font-semibold text-slate-800 block mb-1">Status Payload Zero-Knowledge:</span>
                    {decrypted ? (
                      <div className="text-slate-800 space-y-1 font-sans">
                        <div>
                          <strong className="text-rose-600 font-bold">Dekripsi Berhasil:</strong>{" "}
                          {decrypted.category} &bull; Urgensi:{" "}
                          <span className="font-bold text-slate-900">{decrypted.urgency}</span>
                        </div>
                        <div className="bg-white p-2 rounded border border-slate-200 text-slate-700 italic">
                          "{decrypted.narrative}"
                        </div>
                        <div className="text-slate-500 text-[10px]">
                          Alibi: <span className="font-semibold text-emerald-700">{decrypted.alibi}</span> &bull; Terverifikasi Kriptografis via WebCrypto
                        </div>
                      </div>
                    ) : (
                      <span className="font-mono text-[11px] text-slate-500 italic block break-all">
                        [ENCRYPTED CIPHERTEXT: {rec.base64Ciphertext.substring(0, 32)}...]
                      </span>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                    <Button
                      variant={decrypted ? "emerald" : "default"}
                      size="sm"
                      disabled={isDecrypting}
                      onClick={() => handleDecryptLive(rec.token)}
                      className="w-full flex items-center justify-center space-x-1.5"
                    >
                      {isDecrypting ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Mendekripsi AES-GCM...</span>
                        </>
                      ) : decrypted ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>Terdekripsi (Verified)</span>
                        </>
                      ) : (
                        <>
                          <Unlock className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Decrypt (Gunakan Kunci Konselor)</span>
                        </>
                      )}
                    </Button>

                    <Button
                      variant={isAlibiSent ? "secondary" : "emerald"}
                      size="sm"
                      onClick={() => handleSendAlibi(rec.token)}
                      className="w-full flex items-center justify-center space-x-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isAlibiSent ? "Surat Alibi Terkirim" : "Kirim Surat Alibi Pemanggilan"}</span>
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* Default Mock Verified KTS Card */}
            {(filter === "ALL" || filter === "KTS") && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-emerald-300 hover:shadow-lg transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                <div className="flex items-start justify-between mt-1">
                  <Badge variant="emerald" className="flex items-center space-x-1">
                    <BadgeCheck className="w-3 h-3 text-emerald-700" />
                    <span>TERVERIFIKASI KTS</span>
                  </Badge>
                  <Badge variant="destructive">CRITICAL (&lt;24 Jam)</Badge>
                </div>
                <div className="mt-3.5 flex items-center space-x-3 bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                    MR
                  </div>
                  <div className="overflow-hidden">
                    <div className="font-bold text-slate-900 text-xs sm:text-sm truncate">
                      Muhammad Raihan Pratama
                    </div>
                    <div className="text-[11px] font-mono text-slate-500 truncate">
                      NIS: 2024-KTS-08912 • Asrama Al-Farabi 09
                    </div>
                  </div>
                </div>
                <div className="mt-3">
                  <div className="text-[10px] font-mono text-slate-400">NOMOR TIKET RESMI KTS:</div>
                  <div className="text-xs font-mono font-bold text-slate-800">#KTS-ADV-2026-0419</div>
                </div>
                <div className="mt-2.5 flex flex-wrap gap-1.5">
                  <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-[11px] font-semibold text-slate-700">
                    Kategori: Bullying Fisik
                  </span>
                  <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded-lg text-[11px] font-semibold">
                    Alibi: Medis Poskestren
                  </span>
                </div>
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
                  <span className="font-bold block text-[11px] text-slate-800 mb-0.5">Petunjuk Pelapor:</span>
                  "Pemalakan &amp; intimidasi berulang kali saat antre mandi malam di lorong barat oleh senior."
                </div>
                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                  <Button
                    variant="emerald"
                    size="sm"
                    onClick={() => handleScheduleSession("Muhammad Raihan Pratama", "Al-Farabi 09")}
                    className="w-full flex items-center justify-center space-x-1.5"
                  >
                    <CalendarCheck className="w-3.5 h-3.5" />
                    <span>Jadwalkan Konseling Tatap Muka Terlindung</span>
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => handleDispatchSatgas("Muhammad Raihan Pratama")}
                    className="w-full flex items-center justify-center space-x-1.5"
                  >
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    <span>Panggil Pendampingan Satgas (Anti-Retaliasi)</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Default Mock Anon Card */}
            {(filter === "ALL" || filter === "ANON") && (
              <div className="bg-white rounded-2xl p-5 shadow-sm border-2 border-slate-800 hover:shadow-lg transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 left-0 h-1.5 bg-slate-800"></div>
                <div className="flex items-start justify-between mt-1">
                  <Badge variant="default" className="flex items-center space-x-1">
                    <Lock className="w-3 h-3 text-rose-400" />
                    <span>100% ANONIM</span>
                  </Badge>
                  <Badge variant="destructive" className="flex items-center space-x-1">
                    <AlertOctagon className="w-3 h-3 text-rose-600 animate-pulse" />
                    <span>CRITICAL (&lt;24 Jam)</span>
                  </Badge>
                </div>
                <div className="mt-4">
                  <div className="text-[10px] font-mono text-slate-400">TOKEN HASH PELACAKAN:</div>
                  <div className="text-sm font-mono font-bold text-slate-900 tracking-wider">
                    e3b0c442... [K7M9P2X4]
                  </div>
                </div>
                <div className="mt-2.5 flex items-center space-x-2">
                  <span className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                    Kategori: TPKS
                  </span>
                  <span className="px-2 py-1 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-semibold">
                    Alibi: Medis
                  </span>
                </div>
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-xs text-slate-600">
                  <span className="font-semibold text-slate-800 block mb-1">Status Payload Zero-Knowledge:</span>
                  <span className="font-mono text-[11px] text-slate-500 italic">
                    [ENCRYPTED CIPHERTEXT - Kunci Privat Konselor Diperlukan]
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Sedang Diproses */}
        <div className="bg-slate-100/70 p-5 rounded-3xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <span>Intervensi Berjalan (Alibi Terkirim)</span>
            </h3>
            <span className="text-xs font-mono bg-white px-2 py-0.5 rounded-full font-bold text-slate-600 border border-slate-200">
              1
            </span>
          </div>
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <Badge variant="default">100% ANONIM</Badge>
              <Badge variant="amber">MEDIUM (1-3 Hari)</Badge>
            </div>
            <div className="mt-3">
              <div className="text-[10px] font-mono text-slate-400">TOKEN HASH:</div>
              <div className="text-sm font-mono font-bold text-slate-900">7f83b165... [B3N8L1P9]</div>
            </div>
            <div className="mt-2.5 flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-xs font-semibold text-slate-700">
                Bullying Fisik
              </span>
              <span className="px-2 py-0.5 bg-teal-50 text-teal-800 rounded-lg text-xs font-semibold">
                Alibi: Tahfidz
              </span>
            </div>
            <div className="mt-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100 text-xs text-emerald-800">
              <span className="font-bold">Surat Pemanggilan:</span> Santri dipanggil ke kantor tahfidz pukul 16:30 untuk evaluasi juz 30 tanpa kecurigaan.
            </div>
          </div>
        </div>

        {/* Column 3: Selesai / Arsip Terlindungi */}
        <div className="bg-slate-100/70 p-5 rounded-3xl border border-slate-200/80">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-800 text-sm flex items-center space-x-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <span>Kasus Selesai &amp; Ditutup</span>
            </h3>
            <span className="text-xs font-mono bg-white px-2 py-0.5 rounded-full font-bold text-slate-600 border border-slate-200">
              2
            </span>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 opacity-80 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-center">
                <Badge variant="secondary">RESOLVED</Badge>
                <span className="text-[10px] font-mono text-slate-400">Mode Anonim</span>
              </div>
              <div className="mt-2 text-xs font-mono font-bold text-slate-700">Hash: 11a4c8... [Krisis Mental]</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Konseling psikolog poskestren tuntas dengan pengawasan wali asrama terlatih.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-200 opacity-90 hover:opacity-100 transition-opacity">
              <div className="flex justify-between items-center">
                <Badge variant="emerald">TERLINDUNGI</Badge>
                <span className="text-[10px] font-mono text-emerald-700 font-bold">KTS Terverifikasi</span>
              </div>
              <div className="mt-2 text-xs font-bold text-slate-800">Santri: Ahmad Daniyal (NIS: 07412)</div>
              <p className="text-[11px] text-slate-500 mt-1">
                Kasus intimidasi terselesaikan lewat sidang musyawarah majelis kehormatan pondok.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
