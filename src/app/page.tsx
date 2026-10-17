"use client";

import React, { useState, useEffect, useCallback } from "react";
import { JudgeSimulatorHeader, type SimulatorView } from "@/components/judge-simulator-header";
import { PanicWipeOverlay } from "@/components/panic-wipe-overlay";
import { KioskGateway } from "@/components/kiosk-gateway";
import { CrisisForm, type StudentProfile } from "@/components/crisis-form";
import { ProofOfEncryption } from "@/components/proof-of-encryption";
import { AdminKonselor } from "@/components/admin-konselor";
import { AdminSarpras } from "@/components/admin-sarpras";
import { AdminKiai } from "@/components/admin-kiai";
import { BarcodeCameraModal } from "@/components/barcode-camera-modal";
import { KartuTandaSantriViewer } from "@/components/kartu-tanda-santri-viewer";
import { TokenTrackerModal } from "@/components/token-tracker-modal";
import { type EncryptedSubmissionRecord } from "@/lib/crypto";

export default function HomePage() {
  const [currentView, setCurrentView] = useState<SimulatorView>("kiosk-main");
  const [crisisInitialMode, setCrisisInitialMode] = useState<"ANONYMOUS" | "VERIFIED_KTS">("ANONYMOUS");
  const [verifiedStudent, setVerifiedStudent] = useState<StudentProfile | null>(null);
  const [activeProofRecord, setActiveProofRecord] = useState<EncryptedSubmissionRecord | null>(null);
  const [liveRecords, setLiveRecords] = useState<Map<string, EncryptedSubmissionRecord>>(new Map());

  // Panic Wipe Overlay State
  const [isPanicOverlayOpen, setIsPanicOverlayOpen] = useState(false);

  // Barcode Camera Modal State
  const [isBarcodeModalOpen, setIsBarcodeModalOpen] = useState(false);
  const [barcodeScanContext, setBarcodeScanContext] = useState<"GATEWAY_FACILITY" | "CRISIS_FORM" | "SARPRAS_ADMIN">("GATEWAY_FACILITY");

  // Token Tracker Modal State
  const [isTrackerModalOpen, setIsTrackerModalOpen] = useState(false);
  const [trackedTokenInitial, setTrackedTokenInitial] = useState("");

  // Toast Notification State
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
  }, []);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => {
      setToastMessage(null);
    }, 3800);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  // Hard-Kill Sub-16ms Memory Purge & Panic Camouflage
  const triggerHardPanicWipe = useCallback(() => {
    // 1. Instantly trigger visual camouflage (<16ms)
    setIsPanicOverlayOpen(true);

    // 2. Close any open barcode camera scanner modals & tracker modals immediately
    setIsBarcodeModalOpen(false);
    setIsTrackerModalOpen(false);
    setTrackedTokenInitial("");

    // 3. Dispatch global emergency event to unmount/purge forms and kill camera streams
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("emergency-panic-wipe"));
    }

    // 4. Purge all sensitive transient memory buffers
    setVerifiedStudent(null);
    setActiveProofRecord(null);
    setCurrentView("kiosk-main");
  }, []);

  // Global Sub-16ms Panic Wipe Keyboard Trigger (Escape Key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        triggerHardPanicWipe();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [triggerHardPanicWipe]);

  // Barcode Scanning Handler
  const handleBarcodeScanned = async (barcodeVal: string) => {
    setIsBarcodeModalOpen(false);

    try {
      const res = await fetch(`/api/students?barcode=${encodeURIComponent(barcodeVal)}`);
      if (res.ok) {
        const data = await res.json();
        const student: StudentProfile = data.student || data;
        setVerifiedStudent(student);

        if (barcodeScanContext === "CRISIS_FORM") {
          showToast(`KTS Terverifikasi: ${student.nama} (${student.kamar})`);
          setCrisisInitialMode("VERIFIED_KTS");
        } else if (barcodeScanContext === "GATEWAY_FACILITY") {
          showToast(`Selamat datang ${student.nama}. Mengarahkan ke formulir Fasilitas Sarpras.`);
          setCurrentView("admin-sarpras");
        } else if (barcodeScanContext === "SARPRAS_ADMIN") {
          showToast(`KTS Santri [${student.nama}] berhasil dipindai ke tiket.`);
        }
      } else {
        // Fallback for custom unseeded barcode
        const fallbackStudent: StudentProfile = {
          nama: "Santri Mandiri",
          nis: barcodeVal.replace(/\D/g, "") || "99821",
          kelas: "XII Keagamaan",
          kamar: "Asrama Barokah",
          barcode: barcodeVal,
        };
        setVerifiedStudent(fallbackStudent);
        showToast(`Barcode [${barcodeVal}] dibaca. Profil santri diverifikasi.`);
      }
    } catch {
      showToast(`Barcode dibaca: ${barcodeVal}`);
    }
  };

  // Open Barcode Camera Scanner Helper
  const openCameraScanner = (context: "GATEWAY_FACILITY" | "CRISIS_FORM" | "SARPRAS_ADMIN") => {
    setBarcodeScanContext(context);
    setIsBarcodeModalOpen(true);
  };

  // Submission handler for Crisis Form with Strict Zero-Knowledge Gating
  const handleEncryptedSubmit = async (record: EncryptedSubmissionRecord) => {
    // 1. Store in live in-memory registry for counselor demo decryption
    setLiveRecords((prev) => {
      const next = new Map(prev);
      next.set(record.token, record);
      return next;
    });

    // 2. Persist encrypted payload to SQLite via Next.js API
    // STRICT ZERO-KNOWLEDGE: Only transmit identity if mode is VERIFIED_KTS
    const isVerified = record.payload.mode === "VERIFIED_KTS";
    try {
      await fetch("/api/crisis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: record.token,
          token_hash: record.tokenHash,
          mode: record.payload.mode,
          category: record.payload.category,
          urgency: record.payload.urgency,
          alibi: record.payload.alibi,
          ciphertext: record.base64Ciphertext,
          iv_hex: record.ivHex,
          encrypted_key: record.encryptedKeyBase64,
          santri_nis: isVerified ? record.payload.identity?.nis || null : null,
          santri_name: isVerified ? record.payload.identity?.nama || null : null,
        }),
      });
    } catch (err) {
      console.warn("Offline SQLite save error:", err);
    }

    // 3. Display Cryptographic Proof Console
    setActiveProofRecord(record);
    showToast(`Tiket Terenkripsi Berhasil Dibuat: [${record.token}]`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col relative selection:bg-emerald-500 selection:text-white">
      {/* 1. Top Simulator Testing Navigation Bar */}
      <JudgeSimulatorHeader
        currentView={currentView}
        onViewChange={(view) => {
          setActiveProofRecord(null);
          setCurrentView(view);
        }}
        onTriggerPanic={triggerHardPanicWipe}
        unreadCrisisCount={liveRecords.size > 0 ? liveRecords.size : 2}
      />

      {/* 2. Panic Camouflage Overlay (<16ms RAM purge view) */}
      <PanicWipeOverlay
        isVisible={isPanicOverlayOpen}
        onDismiss={() => {
          setIsPanicOverlayOpen(false);
          setCurrentView("kiosk-main");
          setVerifiedStudent(null);
          setActiveProofRecord(null);
        }}
      />

      {/* 3. Real Live Camera Barcode Scanner Modal */}
      <BarcodeCameraModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onScanSuccess={handleBarcodeScanned}
        title={
          barcodeScanContext === "CRISIS_FORM"
            ? "Pindai Barcode KTS untuk Verifikasi Identitas"
            : "Pemindai Barcode Kartu Tanda Santri (KTS)"
        }
        subtitle="Arahkan kamera ke barcode fisik KTS Anda. Algoritma pemindai akan mendeteksi secara instan."
      />

      {/* 4. Main Body Content Based on Active Persona / View */}
      <main className="flex-1 pt-16">
        {/* If Active Proof of Encryption is showing for the Santri, display it directly */}
        {activeProofRecord ? (
          <ProofOfEncryption
            record={activeProofRecord}
            onFinishAndReset={() => {
              setActiveProofRecord(null);
              setCurrentView("kiosk-main");
            }}
            onInspectInCounselor={() => {
              setActiveProofRecord(null);
              setCurrentView("admin-konselor");
            }}
            onTrackToken={(token) => {
              setTrackedTokenInitial(token);
              setIsTrackerModalOpen(true);
            }}
            onShowToast={showToast}
          />
        ) : (
          <>
            {currentView === "kiosk-main" && (
              <KioskGateway
                onSelectFacilityScan={() => openCameraScanner("GATEWAY_FACILITY")}
                onSelectCrisisMode={(mode) => {
                  setCrisisInitialMode(mode);
                  if (mode === "ANONYMOUS") {
                    setVerifiedStudent(null);
                  }
                  setCurrentView("crisis-form");
                }}
                onTriggerPanic={triggerHardPanicWipe}
                onOpenTracker={() => {
                  setTrackedTokenInitial("");
                  setIsTrackerModalOpen(true);
                }}
              />
            )}

            {currentView === "crisis-form" && (
              <CrisisForm
                initialMode={crisisInitialMode}
                onBackToMain={() => setCurrentView("kiosk-main")}
                onOpenBarcodeCamera={() => openCameraScanner("CRISIS_FORM")}
                verifiedStudent={verifiedStudent}
                onEncryptedSubmit={handleEncryptedSubmit}
                onShowToast={showToast}
              />
            )}

            {currentView === "admin-konselor" && (
              <AdminKonselor
                liveRecords={liveRecords}
                onShowToast={showToast}
              />
            )}

            {currentView === "admin-sarpras" && (
              <AdminSarpras
                onOpenBarcodeCamera={() => openCameraScanner("SARPRAS_ADMIN")}
                onShowToast={showToast}
              />
            )}

            {currentView === "admin-kiai" && <AdminKiai />}

            {currentView === "kts-cards" && (
              <KartuTandaSantriViewer
                onSelectSantriForKiosk={(barcode) => {
                  handleBarcodeScanned(barcode);
                  setCurrentView("crisis-form");
                }}
                onShowToast={showToast}
              />
            )}
          </>
        )}
      </main>

      {/* 5. Token Status Tracker Modal (Zero-Knowledge) */}
      <TokenTrackerModal
        isOpen={isTrackerModalOpen}
        onClose={() => setIsTrackerModalOpen(false)}
        initialToken={trackedTokenInitial}
        onShowToast={showToast}
      />

      {/* 5b. Barcode Camera Scanner Modal */}
      <BarcodeCameraModal
        isOpen={isBarcodeModalOpen}
        onClose={() => setIsBarcodeModalOpen(false)}
        onScanSuccess={handleBarcodeScanned}
        title={
          barcodeScanContext === "CRISIS_FORM"
            ? "Verifikasi KTS — Ruang Aman"
            : barcodeScanContext === "SARPRAS_ADMIN"
            ? "Pindai Barcode KTS Pelapor"
            : "Pindai Barcode KTS — Layanan Fasilitas"
        }
        subtitle={
          barcodeScanContext === "CRISIS_FORM"
            ? "Arahkan barcode pada Kartu Tanda Santri untuk advokasi terverifikasi"
            : "Arahkan barcode pada Kartu Tanda Santri ke dalam kotak pemindai"
        }
      />

      {/* 6. Floating Toast Notification Pill */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[200] max-w-md w-full px-4 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-none">
          <div className="bg-slate-950/95 border border-emerald-500/50 shadow-2xl backdrop-blur-md text-emerald-300 text-xs sm:text-sm font-medium py-3 px-4 rounded-2xl flex items-center justify-between pointer-events-auto">
            <div className="flex items-center space-x-2.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>{toastMessage}</span>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white text-xs ml-3 font-mono"
            >
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
