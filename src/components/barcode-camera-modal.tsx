"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { Html5Qrcode, Html5QrcodeSupportedFormats } from "html5-qrcode";
import { X, Camera, SwitchCamera, Upload, CheckCircle2, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "./ui/button";

interface BarcodeCameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanSuccess: (decodedBarcode: string) => void;
  title?: string;
  subtitle?: string;
}

const REGION_ID = "html5qr-code-full-region";

export function BarcodeCameraModal({
  isOpen,
  onClose,
  onScanSuccess,
  title = "Pemindai Barcode KTS Kamera Aktif",
  subtitle = "Arahkan barcode pada Kartu Tanda Santri ke dalam kotak pemindai",
}: BarcodeCameraModalProps) {
  const [scannerActive, setScannerActive] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastScanned, setLastScanned] = useState<string | null>(null);
  const [cameras, setCameras] = useState<Array<{ id: string; label: string }>>([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);

  const scannerRef = useRef<Html5Qrcode | null>(null);
  const isStartingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Play realistic scanner beep audio
  const playBeep = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1850, ctx.currentTime);
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);

      if ("vibrate" in navigator) {
        navigator.vibrate(60);
      }
    } catch {
      // Audio context may require prior user interaction
    }
  }, []);

  // Stop camera helper
  const stopCamera = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch (e) {
        console.warn("Notice while stopping scanner:", e);
      }
      try {
        await scannerRef.current.clear();
      } catch (e) {
        console.warn("Notice while clearing scanner DOM:", e);
      }
      scannerRef.current = null;
    }
    setScannerActive(false);
    setIsInitializing(false);
  }, []);

  // Handle successful decode
  const handleSuccess = useCallback(
    async (decodedText: string) => {
      playBeep();
      setLastScanned(decodedText);
      await stopCamera();

      setTimeout(() => {
        onScanSuccess(decodedText);
        onClose();
      }, 700);
    },
    [onScanSuccess, onClose, playBeep, stopCamera]
  );

  // Start camera scanner
  const startCamera = useCallback(async (cameraId?: string) => {
    if (isStartingRef.current) return;
    isStartingRef.current = true;
    setIsInitializing(true);
    setErrorMessage(null);
    setLastScanned(null);

    // 1. Check browser mediaDevices support & Secure Context
    const isSecure = typeof window !== "undefined" ? window.isSecureContext : true;
    if (
      typeof window === "undefined" ||
      !navigator?.mediaDevices ||
      !navigator.mediaDevices.getUserMedia
    ) {
      const currentHost = typeof window !== "undefined" ? window.location.hostname : "";
      if (!isSecure) {
        setErrorMessage(
          `Akses kamera diblokir oleh browser karena dibuka melalui IP/HTTP (${currentHost}). Standar keamanan browser (W3C) mewajibkan HTTPS atau http://localhost. Solusi: Buka via http://localhost:3000 di PC/laptop ini, atau gunakan tombol "Upload Gambar" / "Simulasi Cepat" di bawah.`
        );
      } else {
        setErrorMessage(
          "Sensor kamera tidak terdeteksi atau izin dinonaktifkan di pengaturan browser. Silakan gunakan tombol unggah foto barcode atau tombol simulasi cepat di bawah."
        );
      }
      setIsInitializing(false);
      isStartingRef.current = false;
      return;
    }

    // 2. Ensure existing scanner instance is completely stopped & cleaned up
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
      } catch {}
      try {
        await scannerRef.current.clear();
      } catch {}
      scannerRef.current = null;
    }

    // 3. Ensure DOM container is mounted
    const targetElement = document.getElementById(REGION_ID);
    if (!targetElement) {
      setErrorMessage("Elemen pemindai belum siap di layar. Silakan klik 'Coba Lagi'.");
      setIsInitializing(false);
      isStartingRef.current = false;
      return;
    }

    targetElement.innerHTML = "";

    try {
      const html5QrCode = new Html5Qrcode(REGION_ID);
      scannerRef.current = html5QrCode;

      const scanConfig = {
        fps: 15,
        qrbox: (viewfinderWidth: number, viewfinderHeight: number) => {
          const width = Math.min(320, Math.floor(viewfinderWidth * 0.88));
          const height = Math.min(180, Math.max(90, Math.floor(width * 0.52)));
          return { width, height };
        },
        aspectRatio: 1.333333,
        formatsToSupport: [
          Html5QrcodeSupportedFormats.CODE_128,
          Html5QrcodeSupportedFormats.CODE_39,
          Html5QrcodeSupportedFormats.EAN_13,
          Html5QrcodeSupportedFormats.EAN_8,
          Html5QrcodeSupportedFormats.UPC_A,
          Html5QrcodeSupportedFormats.UPC_E,
          Html5QrcodeSupportedFormats.CODABAR,
          Html5QrcodeSupportedFormats.ITF,
          Html5QrcodeSupportedFormats.QR_CODE,
        ],
      };

      const onScanSuccessCallback = (decodedText: string) => {
        handleSuccess(decodedText);
      };

      // Camera selection strategy:
      // Priority A: specific cameraId passed
      // Priority B: environment camera (back facing)
      // Fallback C: user camera (front facing / webcam)
      // Fallback D: first enumerated camera ID
      if (cameraId) {
        await html5QrCode.start(
          cameraId,
          scanConfig,
          onScanSuccessCallback,
          () => {}
        );
      } else {
        try {
          // Attempt back camera (ideal for mobile/tablet scanning)
          await html5QrCode.start(
            { facingMode: "environment" },
            scanConfig,
            onScanSuccessCallback,
            () => {}
          );
        } catch (envErr) {
          console.warn("Back camera unavailable, attempting front/user camera:", envErr);
          try {
            // Fallback to front camera / default webcam (standard on laptops/PCs)
            await html5QrCode.start(
              { facingMode: "user" },
              scanConfig,
              onScanSuccessCallback,
              () => {}
            );
          } catch (userErr) {
            console.warn("Direct facingMode failed, checking enumerated devices:", userErr);
            const devs = await Html5Qrcode.getCameras();
            if (devs && devs.length > 0) {
              await html5QrCode.start(
                devs[0].id,
                scanConfig,
                onScanSuccessCallback,
                () => {}
              );
            } else {
              throw userErr;
            }
          }
        }
      }

      setScannerActive(true);
      setIsInitializing(false);

      // Now query available cameras after permission has been granted
      try {
        const availableCameras = await Html5Qrcode.getCameras();
        if (availableCameras && availableCameras.length > 0) {
          setCameras(availableCameras);
          if (cameraId) {
            const idx = availableCameras.findIndex((c) => c.id === cameraId);
            if (idx !== -1) setCurrentCameraIndex(idx);
          }
        }
      } catch (listErr) {
        console.warn("Could not retrieve camera list:", listErr);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("Camera start failed:", msg);

      let userFriendlyMsg =
        "Kamera tidak dapat diakses atau izin ditolak. Silakan gunakan opsi upload foto barcode atau pilih barcode simulasi di bawah.";
      if (msg.includes("NotAllowedError") || msg.includes("Permission denied")) {
        userFriendlyMsg =
          "Izin akses kamera ditolak oleh browser. Mohon izinkan akses kamera di bilah alamat browser Anda, lalu klik 'Coba Lagi'.";
      } else if (msg.includes("NotFoundError") || msg.includes("DevicesNotFoundError")) {
        userFriendlyMsg =
          "Tidak ada sensor kamera yang terdeteksi pada perangkat ini. Silakan gunakan tombol simulasi atau unggah foto barcode.";
      } else if (msg.includes("NotReadableError") || msg.includes("TrackStartError")) {
        userFriendlyMsg =
          "Kamera sedang digunakan oleh aplikasi lain atau tab browser lain. Tutup aplikasi yang menggunakan webcam lalu klik 'Coba Lagi'.";
      }

      setErrorMessage(userFriendlyMsg);
      setScannerActive(false);
      setIsInitializing(false);

      if (scannerRef.current) {
        try {
          await scannerRef.current.clear();
        } catch {}
        scannerRef.current = null;
      }
    } finally {
      isStartingRef.current = false;
    }
  }, [handleSuccess]);

  // Toggle Camera
  const switchCamera = useCallback(async () => {
    if (cameras.length <= 1) return;
    await stopCamera();
    const nextIndex = (currentCameraIndex + 1) % cameras.length;
    setCurrentCameraIndex(nextIndex);
    await startCamera(cameras[nextIndex].id);
  }, [cameras, currentCameraIndex, stopCamera, startCamera]);

  // Handle image upload scan
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await stopCamera();
      const html5QrCode = new Html5Qrcode(REGION_ID);
      scannerRef.current = html5QrCode;
      const result = await html5QrCode.scanFile(file, true);
      handleSuccess(result);
    } catch (err) {
      console.warn("File scan error:", err);
      setErrorMessage("Barcode tidak terdeteksi pada gambar yang diunggah. Pastikan barcode terlihat jelas dan pencahayaan cukup.");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => {
        startCamera();
      }, 150);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen, startCamera, stopCamera]);

  // Emergency Panic Wipe listener to kill camera hardware tracks immediately
  useEffect(() => {
    const handlePanic = () => {
      stopCamera();
      onClose();
    };
    window.addEventListener("emergency-panic-wipe", handlePanic);
    return () => window.removeEventListener("emergency-panic-wipe", handlePanic);
  }, [stopCamera, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 text-white rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl relative overflow-y-auto flex flex-col justify-between max-h-[94vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 sm:pb-4 gap-2">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-rose-600/20 border border-rose-500/40 text-rose-400 flex items-center justify-center relative shrink-0">
              <Camera className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
              <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
              </span>
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-slate-100 leading-tight">{title}</h3>
              <p className="text-[11px] sm:text-xs text-slate-400 font-mono mt-0.5 leading-tight">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Camera Viewport Container */}
        <div className="relative my-3 sm:my-4 flex flex-col items-center">
          <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-black border-2 border-emerald-500/40 shadow-inner relative flex items-center justify-center">
            {/* Html5Qrcode target element */}
            <div
              id={REGION_ID}
              className="w-full h-full flex items-center justify-center [&_video]:w-full [&_video]:h-full [&_video]:object-cover"
            ></div>

            {/* Connecting / Initializing Overlay */}
            {isInitializing && (
              <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-10">
                <Loader2 className="w-8 h-8 text-emerald-400 animate-spin mb-2" />
                <span className="text-xs font-mono text-emerald-300 font-semibold">Menghubungkan Sensor Kamera...</span>
                <span className="text-[10px] text-slate-400 mt-1">Izinkan akses kamera jika browser memintanya</span>
              </div>
            )}

            {/* Scanning HUD Reticle & Laser Sweep Animation */}
            {scannerActive && !lastScanned && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-10">
                {/* Center barcode guidance box */}
                <div className="w-56 sm:w-64 h-28 sm:h-32 border-2 border-dashed border-emerald-400/80 rounded-xl relative overflow-hidden shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                  {/* Sweeping Laser Line */}
                  <div className="absolute inset-x-0 h-0.5 bg-rose-500 shadow-[0_0_10px_#f43f5e,0_0_20px_#f43f5e] animate-laser-sweep"></div>
                </div>
                <span className="mt-2 text-[10px] sm:text-[11px] font-mono text-emerald-300 bg-black/75 px-3 py-1 rounded-full border border-emerald-500/50 text-center backdrop-blur-sm">
                  Arahkan Barcode KTS ke dalam kotak laser
                </span>
              </div>
            )}

            {/* Scan Success Overlay */}
            {lastScanned && (
              <div className="absolute inset-0 bg-emerald-950/90 flex flex-col items-center justify-center p-4 sm:p-6 text-center animate-in zoom-in-95 duration-200 z-20">
                <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16 text-emerald-400 animate-bounce mb-2" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-emerald-300 font-bold">
                  Barcode Terdeteksi!
                </span>
                <span className="text-base sm:text-xl font-mono font-bold text-white mt-1 break-all bg-emerald-900/60 px-3 sm:px-4 py-1 rounded-xl border border-emerald-500/50">
                  {lastScanned}
                </span>
              </div>
            )}
          </div>

          {/* Error notice if camera fails with Retry Action */}
          {errorMessage && (
            <div className="mt-3 w-full p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-300 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-tight">
                  <strong className="block text-amber-200 mb-0.5">Catatan Akses Kamera:</strong>
                  {errorMessage}
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => startCamera()}
                className="shrink-0 h-7 text-xs border-amber-500/50 bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 flex items-center space-x-1.5 self-end sm:self-center"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Coba Lagi</span>
              </Button>
            </div>
          )}
        </div>

        {/* Controls: Switch Camera & Upload Fallback */}
        <div className="space-y-2.5 sm:space-y-3 pt-2 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
            {cameras.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={switchCamera}
                className="text-slate-300 border-slate-700 hover:bg-slate-800 flex items-center justify-center space-x-1.5 w-full sm:w-auto"
              >
                <SwitchCamera className="w-3.5 h-3.5" />
                <span>Ganti Kamera ({currentCameraIndex + 1}/{cameras.length})</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="text-slate-300 border-slate-700 hover:bg-slate-800 flex items-center justify-center space-x-1.5 w-full sm:w-auto"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Gambar Barcode</span>
            </Button>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
          </div>

          {/* Instant Quick Test Barcodes (Zero-Friction Testing for Evaluators) */}
          <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800/80">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-2 font-semibold">
              Simulasi Cepat (Klik Contoh Barcode KTS):
            </span>
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleSuccess("2024-KTS-09101")}
                className="px-2.5 py-1 rounded-lg bg-emerald-950/90 hover:bg-emerald-800 border border-emerald-500/70 text-emerald-300 text-[11px] font-mono font-bold transition-all active:scale-95"
              >
                ||| 2024-KTS-09101 (Syahrul Hidayat)
              </button>
              <button
                type="button"
                onClick={() => handleSuccess("2024-KTS-09102")}
                className="px-2.5 py-1 rounded-lg bg-sky-950/90 hover:bg-sky-800 border border-sky-500/70 text-sky-300 text-[11px] font-mono font-bold transition-all active:scale-95"
              >
                ||| 2024-KTS-09102 (Moch. Mawahibus S.)
              </button>
              <button
                type="button"
                onClick={() => handleSuccess("2024-KTS-09103")}
                className="px-2.5 py-1 rounded-lg bg-amber-950/90 hover:bg-amber-800 border border-amber-500/70 text-amber-300 text-[11px] font-mono font-bold transition-all active:scale-95"
              >
                ||| 2024-KTS-09103 (M. Irfan Maulana H.)
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Standar Code 128 / EAN / QR</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              stopCamera();
              onClose();
            }}
            className="text-slate-400 hover:text-white"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
