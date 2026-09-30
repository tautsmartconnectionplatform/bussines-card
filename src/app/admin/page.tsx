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

  // 5. Daftar 5 Profil Paling Banyak Dikunjungi (Total pageViews)
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Dashboard Penjual
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Ringkasan data pelanggan, cetak kartu, dan analitik scan QR
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/customers/new"
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Pelanggan</span>
          </Link>
        </div>
      </div>

      {/* Summary Metrik Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Pelanggan */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Pelanggan</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{totalCustomers}</span>
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span className="text-emerald-400 font-medium">{activeCustomers} aktif</span>
              <span>•</span>
              <span className="text-slate-500">{inactiveCustomers} nonaktif</span>
            </div>
          </div>
        </div>

        {/* Total Pesanan & Omzet */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Omzet Pesanan</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{formatRupiah(totalRevenue)}</span>
            <p className="text-[11px] text-slate-400 mt-1">
              Dari {totalOrders} total pesanan kartu
            </p>
          </div>
        </div>

        {/* Scan 7 Hari Terakhir */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Scan QR (7 Hari)</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{views7Days}</span>
            <p className="text-[11px] text-slate-400 mt-1">Kunjungan dalam seminggu</p>
          </div>
        </div>

        {/* Scan 30 Hari Terakhir */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Scan QR (30 Hari)</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-white">{views30Days}</span>
            <p className="text-[11px] text-slate-400 mt-1">Total interaksi sebulan</p>
          </div>
        </div>
      </div>

      {/* 14-Day Scan Activity Chart (Pure CSS/SVG High-Performance) */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" />
              <span>Aktivitas Scan QR (14 Hari Terakhir)</span>
            </h2>
            <p className="text-xs text-slate-400">Grafik kunjungan halaman profil dari scan fisik</p>
          </div>
          <Link
            href="/admin/stats"
            className="text-xs text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1"
          >
            <span>Lihat Analitik Lengkap</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Bar Visualizer */}
        <div className="h-40 flex items-end justify-between gap-1 sm:gap-3 pt-6 border-b border-slate-800 pb-2">
          {dailyViews.map((item, idx) => {
            const heightPercent = Math.max((item.count / maxDailyView) * 100, 8);
            return (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <div className="relative w-full flex items-end justify-center h-full">
                  {/* Tooltip on hover */}
                  <div className="absolute -top-7 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-10">
                    {item.count} scan
                  </div>
                  <div
                    className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-blue-600 to-indigo-500 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-300"
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span className="text-[9px] sm:text-[10px] text-slate-500 mt-2 rotate-45 sm:rotate-0 truncate">
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
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-emerald-400" />
              <span>5 Pesanan Terbaru</span>
            </h2>
            <Link
              href="/admin/orders"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Lihat Semua
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {latestOrders.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Belum ada pesanan.</p>
            ) : (
              latestOrders.map((order) => (
                <div key={order.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div>
                    <Link
                      href={`/c/${order.customer.slug}`}
                      target="_blank"
                      className="text-xs sm:text-sm font-semibold text-white hover:text-blue-400 flex items-center gap-1.5"
                    >
                      <span>{order.customer.businessName}</span>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </Link>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span>{order.quantity} pcs</span>
                      <span>•</span>
                      <span className="text-slate-300">{formatRupiah(order.totalPrice)}</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${
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
        <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <QrCode className="w-4 h-4 text-indigo-400" />
              <span>Profil Paling Populer</span>
            </h2>
            <Link
              href="/admin/customers"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium"
            >
              Kelola Kartu
            </Link>
          </div>

          <div className="divide-y divide-slate-800/80">
            {topVisited.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">Belum ada data kunjungan.</p>
            ) : (
              topVisited.map((c, index) => (
                <div key={c.id} className="py-3.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 text-center text-xs font-bold text-slate-500">
                      #{index + 1}
                    </div>
                    <div>
                      <Link
                        href={`/admin/customers/${c.id}`}
                        className="text-xs sm:text-sm font-semibold text-white hover:text-blue-400 block"
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
