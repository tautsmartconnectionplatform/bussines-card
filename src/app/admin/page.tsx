import Link from "next/link";
import {
  Users,
  CheckCircle2,
  XCircle,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  ArrowRight,
  ExternalLink,
  PlusCircle,
  QrCode,
  Calendar,
  Layers,
  Sparkles,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatRupiah } from "@/lib/normalize";

export const revalidate = 0; // Dynamic server page

export default async function AdminDashboardPage() {
  // 1. Total Pelanggan & Aktif/Nonaktif
  const [totalCustomers, activeCustomers, inactiveCustomers] = await Promise.all([
    prisma.customer.count({ where: { deletedAt: null } }),
    prisma.customer.count({ where: { isActive: true, deletedAt: null } }),
    prisma.customer.count({ where: { isActive: false, deletedAt: null } }),
  ]);

  // 2. Total Pesanan & Pendapatan
  const orders = await prisma.order.findMany({
    select: {
      totalPrice: true,
      paymentStatus: true,
    },
  });
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "lunas" || o.paymentStatus === "dp")
    .reduce((sum, o) => sum + o.totalPrice, 0);

  // 3. Scan Kunjungan 7 Hari & 30 Hari Terakhir
  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [views7Days, views30Days] = await Promise.all([
    prisma.pageView.count({
      where: { viewedAt: { gte: sevenDaysAgo } },
    }),
    prisma.pageView.count({
      where: { viewedAt: { gte: thirtyDaysAgo } },
    }),
  ]);

  // 4. Daftar 5 Pesanan Terbaru
  const latestOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
      customer: {
        select: { businessName: true, slug: true },
      },
    },
  });

  // 5. Daftar 5 Profil Paling Banyak Dikunjungi
  const topVisited = await prisma.customer.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      businessName: true,
      slug: true,
      accentColor: true,
      _count: {
        select: { pageViews: true, linkClicks: true },
      },
    },
    orderBy: {
      pageViews: {
        _count: "desc",
      },
    },
    take: 5,
  });

  // 6. Data Tren 14 Hari Terakhir untuk Mini Chart
  const dailyViews: { day: string; count: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const start = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

    const count = await prisma.pageView.count({
      where: {
        viewedAt: {
          gte: start,
          lt: end,
        },
      },
    });

    const dayName = start.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
    });
    dailyViews.push({ day: dayName, count });
  }

  const maxDailyView = Math.max(...dailyViews.map((d) => d.count), 1);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Dashboard Manajemen
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ringkasan data pelanggan, pesanan cetak kartu, dan statistik scan QR
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/customers/new"
            className="px-4 py-2.5 btn-gold text-black text-xs sm:text-sm font-extrabold rounded-xl transition-all flex items-center gap-2 active:scale-95 shadow-md shadow-amber-500/15"
          >
            <PlusCircle className="w-4 h-4 text-black" />
            <span>Tambah Pelanggan Baru</span>
          </Link>
        </div>
      </div>

      {/* Summary Metrik Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pelanggan */}
        <div className="p-5 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 hover:border-amber-500/30 transition-all backdrop-blur-md shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Pelanggan</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#D4AF37] flex items-center justify-center border border-amber-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">{totalCustomers}</span>
            <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-semibold">{activeCustomers} aktif</span>
              <span>•</span>
              <span className="text-slate-500">{inactiveCustomers} nonaktif</span>
            </div>
          </div>
        </div>

        {/* Total Pesanan & Omzet */}
        <div className="p-5 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 hover:border-amber-500/30 transition-all backdrop-blur-md shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Omzet Pesanan</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-xl sm:text-2xl font-black text-white">{formatRupiah(totalRevenue)}</span>
            <p className="text-[11px] text-slate-400 mt-1.5">
              Dari {totalOrders} total pesanan kartu
            </p>
          </div>
        </div>

        {/* Scan 7 Hari Terakhir */}
        <div className="p-5 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 hover:border-amber-500/30 transition-all backdrop-blur-md shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Scan QR (7 Hari)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#D4AF37] flex items-center justify-center border border-amber-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">{views7Days}</span>
            <p className="text-[11px] text-slate-400 mt-1.5">Kunjungan dalam seminggu</p>
          </div>
        </div>

        {/* Scan 30 Hari Terakhir */}
        <div className="p-5 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 hover:border-amber-500/30 transition-all backdrop-blur-md shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Scan QR (30 Hari)</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#D4AF37] flex items-center justify-center border border-amber-500/20">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-black text-white">{views30Days}</span>
            <p className="text-[11px] text-slate-400 mt-1.5">Total interaksi sebulan</p>
          </div>
        </div>
      </div>

      {/* 14-Day Scan Activity Chart */}
      <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-2xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
              <span>Aktivitas Pemindaian QR (14 Hari Terakhir)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Grafik kunjungan profil bisnis dari hasil scan kartu fisik</p>
          </div>
          <Link
            href="/admin/stats"
            className="text-xs text-[#D4AF37] hover:text-amber-300 font-semibold flex items-center gap-1 w-fit"
          >
            <span>Lihat Analitik Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Bar Visualizer */}
        <div className="h-44 flex items-end justify-between gap-1 sm:gap-3 pt-6 border-b border-slate-800 pb-2">
          {dailyViews.map((item, idx) => {
            const heightPercent = Math.max((item.count / maxDailyView) * 100, 8);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="relative w-full flex items-end justify-center h-full">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 border border-amber-500/30 text-white text-[10px] px-2 py-0.5 rounded-lg shadow-xl pointer-events-none whitespace-nowrap z-10 font-bold">
                    {item.count} scan
                  </div>
                  <div
                    className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-[#8A6718] to-[#D4AF37] group-hover:brightness-125 transition-all duration-300 shadow-sm"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[9px] sm:text-[10px] text-slate-400 mt-2 rotate-45 sm:rotate-0 truncate font-medium">
                  {item.day.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grid for Latest Orders & Top Visited Profiles */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 5 Pesanan Terbaru */}
        <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>5 Pesanan Terbaru</span>
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-[#D4AF37] hover:text-amber-300 font-semibold"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60">
            {latestOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Belum ada data pesanan.</p>
            ) : (
              latestOrders.map((order) => (
                <div key={order.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <Link
                      href={`/c/${order.customer.slug}`}
                      target="_blank"
                      className="text-xs sm:text-sm font-bold text-white hover:text-[#D4AF37] transition-colors flex items-center gap-1.5"
                    >
                      <span>{order.customer.businessName}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{order.quantity} pcs</span>
                      <span>•</span>
                      <span className="text-slate-300 font-medium">{formatRupiah(order.totalPrice)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        order.paymentStatus === "lunas"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : order.paymentStatus === "dp"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {order.paymentStatus.replace("_", " ")}
                    </span>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {order.productionStatus}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 5 Profil Paling Banyak Dikunjungi */}
        <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-2xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800/80">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-[#D4AF37]" />
              <span>Profil Bisnis Terpopuler</span>
            </h2>
            <Link
              href="/admin/customers"
              className="text-xs text-[#D4AF37] hover:text-amber-300 font-semibold"
            >
              Kelola Kartu
            </Link>
          </div>

          <div className="divide-y divide-slate-800/60">
            {topVisited.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Belum ada data kunjungan profil.</p>
            ) : (
              topVisited.map((c, index) => (
                <div key={c.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center text-xs font-black text-slate-500">
                      #{index + 1}
                    </div>
                    <div>
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="text-xs sm:text-sm font-bold text-white hover:text-[#D4AF37] transition-colors block"
                      >
                        {c.businessName}
                      </Link>
                      <span className="text-[11px] text-slate-400">/{c.slug}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs sm:text-sm font-bold text-emerald-400 block">
                      {c._count.pageViews} scan
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {c._count.linkClicks} klik tombol
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
