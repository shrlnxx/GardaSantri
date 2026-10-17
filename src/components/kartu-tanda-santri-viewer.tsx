"use client";

import React, { useEffect, useRef, useState } from "react";
import JsBarcode from "jsbarcode";
import { Printer, Check, Copy, ScanBarcode, ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

interface SantriKTSData {
  nama: string;
  nis: string;
  barcode: string;
  kelas: string;
  kamar: string;
  ttl: string;
  gender: string;
  avatarBg: string;
}

const SANTRI_LIST: SantriKTSData[] = [
  {
    nama: "Syahrul Hidayat",
    nis: "2024-KTS-09101",
    barcode: "2024-KTS-09101",
    kelas: "Kelas 11 Ula Salafiyah",
    kamar: "Asrama Al-Fath Kamar 03",
    ttl: "Malang, 12 Mei 2008",
    gender: "Laki-laki",
    avatarBg: "from-emerald-700 to-emerald-900",
  },
  {
    nama: "Moch. Mawahibus Shomad",
    nis: "2024-KTS-09102",
    barcode: "2024-KTS-09102",
    kelas: "Kelas 12 Ulya Salafiyah",
    kamar: "Asrama Al-Ikhlas Kamar 07",
    ttl: "Pasuruan, 24 Agustus 2007",
    gender: "Laki-laki",
    avatarBg: "from-teal-700 to-sky-950",
  },
  {
    nama: "M. Irfan Maulana Hanafi",
    nis: "2024-KTS-09103",
    barcode: "2024-KTS-09103",
    kelas: "Kelas 10 Wustho Salafiyah",
    kamar: "Asrama An-Nur Kamar 05",
    ttl: "Probolinggo, 03 Januari 2009",
    gender: "Laki-laki",
    avatarBg: "from-amber-700 to-emerald-950",
  },
];

function BarcodeSvg({ value }: { value: string }) {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (svgRef.current) {
      try {
        JsBarcode(svgRef.current, value, {
          format: "CODE128",
          lineColor: "#000000",
          width: 2.1,
          height: 52,
          displayValue: true,
          font: "monospace",
          fontSize: 13,
          fontOptions: "bold",
          textMargin: 3,
          background: "#ffffff",
        });
      } catch (err) {
        console.error("JsBarcode error:", err);
      }
    }
  }, [value]);

  return <svg ref={svgRef} className="w-full max-w-[260px] h-auto mx-auto block" />;
}

export function KartuTandaSantriViewer({
  onSelectSantriForKiosk,
  onShowToast,
}: {
  onSelectSantriForKiosk?: (barcode: string) => void;
  onShowToast?: (msg: string) => void;
}) {
  const [copiedBarcode, setCopiedBarcode] = useState<string | null>(null);

  const handleCopy = (barcode: string, nama: string) => {
    navigator.clipboard.writeText(barcode);
    setCopiedBarcode(barcode);
    onShowToast?.(`Kode barcode [${barcode}] milik ${nama} berhasil disalin!`);
    setTimeout(() => setCopiedBarcode(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="max-w-6xl mx-auto px-3.5 sm:px-6 py-4 sm:py-8">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 sm:pb-6 mb-6 sm:mb-8 border-b border-slate-200 gap-3 sm:gap-4 print:hidden">
        <div>
          <div className="inline-flex items-center space-x-2 bg-emerald-50 text-emerald-800 text-[11px] sm:text-xs font-semibold px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full border border-emerald-200 mb-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Standar Kartu Identitas Fisik Santri (KTS)</span>
          </div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            Contoh Kartu Tanda Santri dengan Barcode Fisik
          </h2>
          <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
            Barcode Code 128 di bawah ini merupakan <strong>barcode aktif dan nyata</strong>. Anda dapat mengarahkan kamera kiosk atau barcode scanner langsung ke layar ini untuk menguji verifikasi otomatis.
          </p>
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0">
          <Button
            onClick={handlePrint}
            variant="outline"
            className="w-full sm:w-auto flex items-center justify-center space-x-2 border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak 3 Kartu (PDF)</span>
          </Button>
        </div>
      </div>

      {/* Grid of 3 Authentic Santri Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch print:grid-cols-1 print:gap-6">
        {SANTRI_LIST.map((santri, index) => (
          <div
            key={santri.nis}
            className="bg-white rounded-3xl border-2 border-slate-200 shadow-xl overflow-hidden flex flex-col justify-between hover:shadow-2xl transition-all duration-300 group hover:-translate-y-1 print:border-slate-800 print:shadow-none"
          >
            {/* 1. KTS Card Header (Pesantren Brand Identity) */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white p-4 relative overflow-hidden">
              <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-amber-400/20 to-transparent pointer-events-none" />
              <div className="flex items-center space-x-3 relative z-10">
                <div className="w-12 h-12 bg-white rounded-xl p-1 shadow-md shrink-0 flex items-center justify-center">
                  <img
                    src="/logo-shirothul-fuqoha.png"
                    alt="Logo Shirothul Fuqoha"
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="min-w-0">
                  <div className="text-[10px] uppercase font-bold tracking-widest text-amber-300 leading-none">
                    KARTU TANDA SANTRI (KTS)
                  </div>
                  <h3 className="text-sm font-bold tracking-tight text-white truncate mt-0.5">
                    PP. SALAFIYAH SHIROTHUL FUQOHA&apos;
                  </h3>
                  <p className="text-[10px] text-emerald-200 truncate font-light">
                    Gondanglegi, Malang, Jawa Timur
                  </p>
                </div>
              </div>
            </div>

            {/* 2. Card Body: Portrait & Bio Details */}
            <div className="p-5 flex-1 flex flex-col justify-between bg-gradient-to-b from-slate-50 to-white">
              <div className="flex space-x-4 items-start">
                {/* Santri Portrait Photo with Peci */}
                <div className="flex flex-col items-center shrink-0">
                  <div
                    className={`w-20 h-24 rounded-xl bg-gradient-to-b ${santri.avatarBg} border-2 border-emerald-600/60 p-1 flex flex-col items-center justify-end shadow-md overflow-hidden relative`}
                  >
                    {/* Visual silhouette of Santri with Peci Hitam */}
                    <div className="w-10 h-3 bg-black rounded-t-sm mb-1 shadow-sm" />
                    <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-slate-800 text-xs font-bold shadow-inner">
                      {santri.nama.charAt(0)}
                    </div>
                    <div className="w-14 h-9 bg-white rounded-t-xl mt-1 border-t border-slate-300" />
                  </div>
                  <span className="text-[9px] font-mono text-emerald-800 bg-emerald-100 px-1.5 py-0.5 rounded-full mt-2 font-bold uppercase">
                    Aktif
                  </span>
                </div>

                {/* Identity Metadata Table */}
                <div className="flex-1 min-w-0 text-xs space-y-1.5">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      Nama Lengkap
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm leading-snug">
                      {santri.nama}
                    </h4>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                      NIS (No. Induk Santri)
                    </span>
                    <span className="font-mono font-bold text-emerald-700 text-xs">
                      {santri.nis}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-1 text-[11px]">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block">
                        Kelas
                      </span>
                      <span className="text-slate-800 font-medium">{santri.kelas}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 block">
                        Kamar
                      </span>
                      <span className="text-slate-800 font-medium truncate block">
                        {santri.kamar.replace("Asrama ", "")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Scannable High-Contrast Code 128 Barcode Section */}
              <div className="mt-5 pt-3 border-t-2 border-dashed border-slate-200">
                <div className="bg-white p-2 rounded-xl border border-slate-300 shadow-sm flex flex-col items-center">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-1">
                    STANDAR BARCODE KTS CODE 128
                  </div>
                  {/* Real SVG Barcode */}
                  <div className="w-full bg-white flex justify-center py-1">
                    <BarcodeSvg value={santri.barcode} />
                  </div>
                </div>
              </div>
            </div>

            {/* 4. Action Buttons (Test Scan in Kiosk or Copy) */}
            <div className="p-3 bg-slate-100/80 border-t border-slate-200 flex items-center justify-between gap-2 print:hidden">
              <button
                type="button"
                onClick={() => handleCopy(santri.barcode, santri.nama)}
                className="flex-1 py-1.5 px-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-medium flex items-center justify-center space-x-1.5 transition-colors"
              >
                {copiedBarcode === santri.barcode ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-semibold">Tersalin</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Salin Kode</span>
                  </>
                )}
              </button>

              {onSelectSantriForKiosk && (
                <button
                  type="button"
                  onClick={() => onSelectSantriForKiosk(santri.barcode)}
                  className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center space-x-1 transition-all active:scale-95 shadow-sm"
                >
                  <ScanBarcode className="w-3.5 h-3.5" />
                  <span>Uji di Kiosk</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Instructions for Evaluator */}
      <div className="mt-10 p-5 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-900 text-xs sm:text-sm print:hidden">
        <h4 className="font-bold text-emerald-950 mb-1 flex items-center space-x-2">
          <span>Petunjuk Pengujian Barcode KTS:</span>
        </h4>
        <ul className="list-disc list-inside space-y-1 text-emerald-900/90 leading-relaxed">
          <li>
            <strong>Pindai dengan Kamera Fisik:</strong> Buka menu Kiosk, klik <em>Scan Barcode KTS</em>, lalu arahkan kamera web/laptop ke barcode di atas (atau tampilkan halaman ini di HP Anda dan sorot dengan kamera laptop).
          </li>
          <li>
            <strong>Simulasi Cepat:</strong> Klik tombol <em>&ldquo;Uji di Kiosk&rdquo;</em> pada kartu santri di atas untuk memverifikasi data santri secara instan tanpa perlu menyalakan kamera.
          </li>
          <li>
            <strong>Cetak Fisik:</strong> Klik tombol <em>&ldquo;Cetak 3 Kartu (PDF)&rdquo;</em> untuk mencetak kartu tanda santri ke kertas atau kartu PVC.
          </li>
        </ul>
      </div>
    </div>
  );
}
