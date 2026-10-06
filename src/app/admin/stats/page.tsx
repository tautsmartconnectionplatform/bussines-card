"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  MousePointer,
  Smartphone,
  Laptop,
  Tablet,
  HelpCircle,
  Users,
  Loader2,
  Calendar,
  MessageCircle,
  MapPin,
  Download,
  Share2,
} from "lucide-react";

export default function AdminStatsPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({
    totalViews: 0,
    totalClicks: 0,
    clicksByType: [],
    deviceStats: [],
    dailyStats: [],
  });

  const fetchCustomers = async () => {
    try {
      const res = await fetch("/api/admin/customers?limit=100");
      const data = await res.json();
      setCustomers(data.customers || []);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const url = selectedCustomerId
        ? `/api/admin/stats?customerId=${selectedCustomerId}`
        : `/api/admin/stats`;

      const res = await fetch(url);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  useEffect(() => {
    fetchStats();
  }, [selectedCustomerId]);

  const maxDailyViews = Math.max(
    ...(stats.dailyStats?.map((d: any) => d.views) || [1]),
    1
  );

  const getButtonIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "whatsapp":
        return <MessageCircle className="w-4 h-4 text-emerald-400" />;
      case "maps":
        return <MapPin className="w-4 h-4 text-blue-400" />;
      case "vcard":
        return <Download className="w-4 h-4 text-amber-400" />;
      case "share":
        return <Share2 className="w-4 h-4 text-purple-400" />;
      case "instagram":
        return <span className="text-[10px] font-bold text-pink-400">IG</span>;
      case "tiktok":
        return <span className="text-[10px] font-bold text-cyan-400">TT</span>;
      case "facebook":
        return <span className="text-[10px] font-bold text-blue-500">FB</span>;
      default:
        return <MousePointer className="w-4 h-4 text-slate-400" />;
    }
  };

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case "mobile":
        return <Smartphone className="w-4 h-4 text-amber-400" />;
      case "desktop":
        return <Laptop className="w-4 h-4 text-blue-400" />;
      case "tablet":
        return <Tablet className="w-4 h-4 text-emerald-400" />;
      default:
        return <HelpCircle className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Statistik & Analitik Kunjungan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Data performa scan QR, interaksi tombol yang paling diminati, dan tipe perangkat
          </p>
        </div>

        {/* Filter Customer Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-400">Filter Profil:</label>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="">Semua Profil Bisnis (Global)</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.businessName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-[#D4AF37]" />
          <p className="text-xs">Memuat data analitik...</p>
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                <span>Total Scan QR (30 Hari Terakhir)</span>
              </span>
              <span className="text-3xl font-black text-white mt-2 block">
                {stats.totalViews} kali
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                Kunjungan halaman profil dari pemindaian kartu fisik
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl">
              <span className="text-xs font-semibold text-slate-400 flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-emerald-400" />
                <span>Total Klik Tombol Aksi</span>
              </span>
              <span className="text-3xl font-black text-white mt-2 block">
                {stats.totalClicks} interaksi
              </span>
              <p className="text-[11px] text-slate-400 mt-1">
                WhatsApp, Google Maps, Instagram, vCard, dll.
              </p>
            </div>
          </div>

          {/* 30-Day Activity Chart */}
          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-2xl">
            <h2 className="text-base font-bold text-white mb-1 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#D4AF37]" />
              <span>Tren Kunjungan Harian (30 Hari Terakhir)</span>
            </h2>
            <p className="text-xs text-slate-400 mb-6">
              Aktivitas scan harian untuk mengevaluasi efektivitas kartu fisik di lapangan
            </p>

            {/* Responsive Chart */}
            <div className="h-48 flex items-end justify-between gap-1 sm:gap-2 pt-6 border-b border-slate-800 pb-2">
              {stats.dailyStats?.map((item: any, idx: number) => {
                const heightPercent = Math.max((item.views / maxDailyViews) * 100, 6);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                    <div className="relative w-full flex items-end justify-center h-full">
                      <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-amber-500/30 text-white text-[10px] px-2 py-0.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-10 font-bold">
                        {item.views} scan ({item.clicks} klik)
                      </div>
                      <div
                        className="w-full max-w-[20px] rounded-t-lg bg-gradient-to-t from-[#8A6718] to-[#D4AF37] group-hover:brightness-125 transition-all duration-300"
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                    {idx % 3 === 0 && (
                      <span className="text-[9px] text-slate-400 mt-2 truncate font-medium">
                        {item.label}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Breakdown Grid: Clicks by Type & Devices */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Clicks Breakdown */}
            <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <MousePointer className="w-4 h-4 text-emerald-400" />
                <span>Distribusi Interaksi Tombol</span>
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Tombol mana yang paling sering digunakan oleh pengunjung
              </p>

              <div className="space-y-3">
                {stats.clicksByType?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Belum ada data interaksi klik.</p>
                ) : (
                  stats.clicksByType?.map((c: any) => {
                    const pct =
                      stats.totalClicks > 0
                        ? Math.round((c.count / stats.totalClicks) * 100)
                        : 0;
                    return (
                      <div key={c.type} className="p-3 bg-[#070A10] rounded-2xl border border-slate-800/80">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-[#0B0F19] border border-slate-800 flex items-center justify-center">
                              {getButtonIcon(c.type)}
                            </div>
                            <span className="font-semibold text-white capitalize">
                              {c.type}
                            </span>
                          </div>
                          <span className="text-amber-300 font-bold">
                            {c.count} klik ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0B0F19] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#D4AF37] to-emerald-400 rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Devices Breakdown */}
            <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl">
              <h2 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-[#D4AF37]" />
                <span>Tipe Perangkat Pengunjung</span>
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Mayoritas pengunjung membuka lewat smartphone (mobile-first)
              </p>

              <div className="space-y-3">
                {stats.deviceStats?.length === 0 ? (
                  <p className="text-xs text-slate-500 py-6 text-center">Belum ada data perangkat.</p>
                ) : (
                  stats.deviceStats?.map((d: any) => {
                    const pct =
                      stats.totalViews > 0
                        ? Math.round((d.count / stats.totalViews) * 100)
                        : 0;
                    return (
                      <div key={d.device} className="p-3 bg-[#070A10] rounded-2xl border border-slate-800/80">
                        <div className="flex items-center justify-between text-xs mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-6 h-6 rounded-lg bg-[#0B0F19] border border-slate-800 flex items-center justify-center">
                              {getDeviceIcon(d.device)}
                            </div>
                            <span className="font-semibold text-white capitalize">
                              {d.device}
                            </span>
                          </div>
                          <span className="text-slate-300 font-bold">
                            {d.count} scan ({pct}%)
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-[#0B0F19] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#D4AF37] rounded-full"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
