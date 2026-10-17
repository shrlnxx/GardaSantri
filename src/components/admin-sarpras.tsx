"use client";

import React, { useEffect, useState } from "react";
import { ScanBarcode, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface SarprasTicket {
  id: string;
  nis: string;
  santri_name: string;
  dorm_room: string;
  issue_title: string;
  issue_desc: string;
  priority: string;
  status: string;
}

interface AdminSarprasProps {
  onOpenBarcodeCamera: () => void;
  onShowToast: (message: string) => void;
}

export function AdminSarpras({ onOpenBarcodeCamera, onShowToast }: AdminSarprasProps) {
  const [tickets, setTickets] = useState<SarprasTicket[]>([
    {
      id: "#TK-2026-081",
      nis: "12345",
      santri_name: "Ahmad Fauzi",
      dorm_room: "Al-Ghazali 04",
      issue_title: "Pipa Bocor",
      issue_desc: "Kran wudhu kamar mandi belakang patah",
      priority: "Tinggi",
      status: "Menunggu Sparepart",
    },
    {
      id: "#TK-2026-079",
      nis: "12489",
      santri_name: "Muhammad Rizky",
      dorm_room: "Ibnu Sina 12",
      issue_title: "Lampu Padam",
      issue_desc: "Fitting neon aula belajar konslet",
      priority: "Sedang",
      status: "Selesai Dikerjakan",
    },
  ]);

  useEffect(() => {
    fetch("/api/sarpras")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.tickets?.length > 0) {
          setTickets(data.tickets);
        }
      })
      .catch(() => {});
  }, []);

  const handleSimulateAdd = () => {
    const newId = `#TK-2026-${Math.floor(Math.random() * 900 + 100)}`;
    const newTicket: SarprasTicket = {
      id: newId,
      nis: "12501",
      santri_name: "Farih Maulana",
      dorm_room: "Bukhari 09",
      issue_title: "Kipas Angin Asrama",
      issue_desc: "Bunyi getar keras & mati mendadak",
      priority: "Sedang",
      status: "Tiket Baru",
    };

    setTickets((prev) => [newTicket, ...prev]);
    onShowToast(`Tiket sarana ${newId} (Farih Maulana) ditambahkan via scan barcode.`);

    fetch("/api/sarpras", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newTicket),
    }).catch(() => {});
  };

  return (
    <section className="max-w-7xl mx-auto min-h-[calc(100vh-4rem)] pt-6 pb-16 px-4 sm:px-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
        <div>
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Divisi Sarana, Prasarana &amp; Logistik Pesantren
            </span>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
            Daftar Tiket Kerusakan Fasilitas (Barcode KTS Scanned)
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Data terekam resmi melalui pemindaian barcode santri untuk verifikasi lapangan teknisi maintenance pondok.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Button
            variant="emerald"
            onClick={onOpenBarcodeCamera}
            className="flex items-center space-x-2 shadow-sm"
          >
            <ScanBarcode className="w-4 h-4" />
            <span>Buka Kamera Scan Barcode</span>
          </Button>

          <Button
            variant="outline"
            onClick={handleSimulateAdd}
            className="flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Simulasi Cepat</span>
          </Button>
        </div>
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-700">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-mono uppercase text-slate-500">
              <tr>
                <th className="px-6 py-4" scope="col">ID Tiket</th>
                <th className="px-6 py-4" scope="col">NIS</th>
                <th className="px-6 py-4" scope="col">Nama Santri</th>
                <th className="px-6 py-4" scope="col">Kamar / Asrama</th>
                <th className="px-6 py-4" scope="col">Rincian Kerusakan</th>
                <th className="px-6 py-4" scope="col">Prioritas</th>
                <th className="px-6 py-4" scope="col">Status Teknisi</th>
                <th className="px-6 py-4 text-right" scope="col">Tindakan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-mono font-bold text-slate-900">{t.id}</td>
                  <td className="px-6 py-4 font-mono text-emerald-700 font-semibold">{t.nis}</td>
                  <td className="px-6 py-4 font-medium text-slate-900">{t.santri_name}</td>
                  <td className="px-6 py-4">{t.dorm_room}</td>
                  <td className="px-6 py-4 text-slate-600">
                    <span className="font-semibold text-slate-800">{t.issue_title}</span> • {t.issue_desc}
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={t.priority === "Tinggi" ? "destructive" : "amber"}>
                      {t.priority}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={t.status.includes("Selesai") ? "emerald" : "amber"}>
                      {t.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => onShowToast(`Status teknisi untuk tiket ${t.id} diperbarui.`)}
                      className="text-xs font-semibold text-emerald-600 hover:text-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-50 active:scale-95 transition-all"
                    >
                      Update
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
