"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  ExternalLink,
  QrCode,
  Download,
  ShoppingBag,
  PlusCircle,
  Eye,
  MousePointer,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Layers,
  Sparkles,
  X,
} from "lucide-react";
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  LinkedInIcon,
} from "@/components/ui/BrandIcons";
import QRCode from "qrcode";
import { formatRupiah } from "@/lib/normalize";

interface CustomerDetailProps {
  customer: any;
  baseUrl: string;
}

export default function CustomerDetailView({ customer, baseUrl }: CustomerDetailProps) {
  const router = useRouter();

  // QR Customizer States
  const [colorDark, setColorDark] = useState("#070A10");
  const [colorLight, setColorLight] = useState("#FFFFFF");
  const [margin, setMargin] = useState(2);
  const [qrDataUrl, setQrDataUrl] = useState<string>("");
  const [loadingQR, setLoadingQR] = useState(true);

  // New Order Modal States
  const [orderModalOpen, setOrderModalOpen] = useState(false);
  const [orderQuantity, setOrderQuantity] = useState(100);
  const [packageName, setPackageName] = useState("Paket Standar 100 pcs");
  const [totalPrice, setTotalPrice] = useState(250000);
  const [paymentStatus, setPaymentStatus] = useState("lunas");
  const [productionStatus, setProductionStatus] = useState("dicetak");
  const [orderNote, setOrderNote] = useState("");
  const [creatingOrder, setCreatingOrder] = useState(false);

  const profileUrl = `${baseUrl}/c/${customer.slug}`;

  // Generate QR preview DataURL instan di browser
  useEffect(() => {
    let isMounted = true;
    setLoadingQR(true);
    QRCode.toDataURL(profileUrl, {
      width: 600,
      margin: Number(margin),
      errorCorrectionLevel: "H",
      color: {
        dark: colorDark || "#070A10",
        light: colorLight || "#FFFFFF",
      },
    })
      .then((url) => {
        if (isMounted) {
          setQrDataUrl(url);
          setLoadingQR(false);
        }
      })
      .catch((err) => {
        console.error("QR preview error:", err);
        if (isMounted) setLoadingQR(false);
      });

    return () => {
      isMounted = false;
    };
  }, [profileUrl, colorDark, colorLight, margin]);

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingOrder(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: customer.id,
          quantity: Number(orderQuantity),
          packageName,
          totalPrice: Number(totalPrice),
          paymentStatus,
          productionStatus,
          note: orderNote,
        }),
      });

      if (res.ok) {
        setOrderModalOpen(false);
        router.refresh();
      } else {
        alert("Gagal menambahkan pesanan.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setCreatingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <Link
            href="/admin/customers"
            className="p-2.5 rounded-2xl bg-[#0B0F19] border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-xl sm:text-2xl font-black text-white">
                {customer.businessName}
              </h1>
              <span
                className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  customer.isActive
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                }`}
              >
                {customer.isActive ? "Aktif" : "Nonaktif"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pemilik: <span className="text-slate-200 font-semibold">{customer.ownerName}</span> • Dibuat:{" "}
              {new Date(customer.createdAt).toLocaleDateString("id-ID")}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href={`/c/${customer.slug}`}
            target="_blank"
            className="px-4 py-2.5 rounded-xl bg-[#0B0F19] hover:bg-[#162033] border border-slate-800 text-xs font-semibold text-slate-200 hover:text-[#D4AF37] flex items-center gap-2 transition-colors"
          >
            <span>Buka Profil Publik</span>
            <ExternalLink className="w-3.5 h-3.5 text-[#D4AF37]" />
          </Link>
          <Link
            href={`/admin/customers/${customer.id}/edit`}
            className="px-4 py-2.5 rounded-xl btn-gold text-xs font-extrabold text-black shadow-md shadow-amber-500/15 flex items-center gap-2 transition-all active:scale-95"
          >
            <Edit className="w-3.5 h-3.5" />
            <span>Edit Data</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: QR Generator on Left, Info & Orders on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* QR Code Generator & Print Tool: 5 cols */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#D4AF37]" />
                <span>QR Code Siap Cetak</span>
              </h2>
              <span className="text-[10px] font-mono text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                /c/{customer.slug}
              </span>
            </div>

            {/* QR Preview Box */}
            <div className="p-6 bg-white rounded-2xl flex items-center justify-center shadow-inner relative min-h-[260px] border-4 border-[#162033]">
              {loadingQR ? (
                <Loader2 className="w-8 h-8 animate-spin text-slate-800" />
              ) : qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code ${customer.businessName}`}
                  className="w-56 h-56 max-w-full object-contain rounded-lg shadow-sm"
                />
              ) : null}
            </div>

            {/* Target URL notice */}
            <div className="p-3.5 bg-[#070A10] rounded-2xl border border-slate-800/80 text-[11px] text-slate-400 break-all">
              <span className="text-slate-500 block mb-0.5 font-semibold">Tautan Target Scan:</span>
              <code className="text-amber-300 font-mono">{profileUrl}</code>
            </div>

            {/* Customizer Options */}
            <div className="space-y-3 pt-2 border-t border-slate-800 text-xs">
              <span className="font-semibold text-slate-300 block">Kustomisasi Ekspor QR:</span>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Warna Kode (Dark)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorDark}
                      onChange={(e) => setColorDark(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colorDark}
                      onChange={(e) => setColorDark(e.target.value)}
                      className="w-full px-2 py-1 bg-[#070A10] border border-slate-800 rounded-lg text-xs font-mono text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] text-slate-400 block mb-1">Warna Latar (Light)</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={colorLight}
                      onChange={(e) => setColorLight(e.target.value)}
                      className="w-8 h-8 rounded-lg border border-slate-700 bg-transparent cursor-pointer"
                    />
                    <input
                      type="text"
                      value={colorLight}
                      onChange={(e) => setColorLight(e.target.value)}
                      className="w-full px-2 py-1 bg-[#070A10] border border-slate-800 rounded-lg text-xs font-mono text-white"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                  <span>Margin Border:</span>
                  <span>{margin} modul</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={6}
                  value={margin}
                  onChange={(e) => setMargin(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>

            {/* Download Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <a
                href={`/api/admin/customers/${customer.id}/qr?format=png&colorDark=${encodeURIComponent(
                  colorDark
                )}&colorLight=${encodeURIComponent(colorLight)}&margin=${margin}`}
                className="py-3 px-4 btn-gold text-black font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all active:scale-95 text-center"
              >
                <Download className="w-4 h-4 text-black" />
                <span>Unduh PNG (HD)</span>
              </a>

              <a
                href={`/api/admin/customers/${customer.id}/qr?format=svg&colorDark=${encodeURIComponent(
                  colorDark
                )}&colorLight=${encodeURIComponent(colorLight)}&margin=${margin}`}
                className="py-3 px-4 bg-[#101726] hover:bg-[#162033] border border-slate-700 text-slate-200 hover:text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all active:scale-95 text-center"
              >
                <Download className="w-4 h-4 text-[#D4AF37]" />
                <span>Unduh Vector (SVG)</span>
              </a>
            </div>

            <p className="text-[10px] text-slate-500 text-center">
              PNG beresolusi 1200x1200px siap cetak atau gunakan SVG untuk vektor presisi tanpa batas pecah.
            </p>
          </div>
        </div>

        {/* Right Details & Orders: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Total Scan Profil</span>
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                {customer._count?.pageViews || 0} kali
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1.5">
                <MousePointer className="w-3.5 h-3.5 text-emerald-400" />
                <span>Total Klik Tombol</span>
              </span>
              <span className="text-2xl font-black text-white mt-1 block">
                {customer._count?.linkClicks || 0} klik
              </span>
            </div>
          </div>

          {/* Business Info Details */}
          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800/80">
              Informasi Lengkap Profil Bisnis
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block mb-0.5">Nama Pemilik</span>
                <span className="font-bold text-white">{customer.ownerName}</span>
              </div>

              {customer.jobTitle && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Jabatan / Profesi</span>
                  <span className="font-semibold text-amber-300">{customer.jobTitle}</span>
                </div>
              )}

              <div>
                <span className="text-slate-500 block mb-0.5">Nomor WhatsApp</span>
                <span className="font-semibold text-white">+{customer.whatsapp}</span>
              </div>

              {customer.phone && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Nomor Telepon Seluler</span>
                  <span className="font-semibold text-white">+{customer.phone}</span>
                </div>
              )}

              {customer.email && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Alamat Email</span>
                  <span className="font-semibold text-white">{customer.email}</span>
                </div>
              )}

              {customer.city && (
                <div>
                  <span className="text-slate-500 block mb-0.5">Kota / Wilayah</span>
                  <span className="font-semibold text-purple-400">{customer.city}</span>
                </div>
              )}

              {customer.website && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block mb-0.5">Situs Web Resmi</span>
                  <a
                    href={customer.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-[#D4AF37] hover:underline"
                  >
                    {customer.website}
                  </a>
                </div>
              )}

              <div>
                <span className="text-slate-500 block mb-0.5">Warna Aksen Profil</span>
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-white/20"
                    style={{ backgroundColor: customer.accentColor }}
                  />
                  <span className="font-mono text-white">{customer.accentColor}</span>
                </div>
              </div>

              <div className="sm:col-span-2">
                <span className="text-slate-500 block mb-0.5">Alamat Lengkap</span>
                <span className="text-slate-200">{customer.address}</span>
              </div>

              {customer.tagline && (
                <div className="sm:col-span-2">
                  <span className="text-slate-500 block mb-0.5">Tagline</span>
                  <span className="text-slate-300 italic">{customer.tagline}</span>
                </div>
              )}

              {/* Media Sosial */}
              {(customer.whatsapp || customer.instagramUsername || customer.facebookUrl || customer.tiktokUsername || customer.linkedinUrl) && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-800">
                  <span className="text-slate-500 block mb-2">Media Sosial & Saluran Komunikasi</span>
                  <div className="flex flex-wrap gap-2">
                    {customer.whatsapp && (
                      <a
                        href={`https://wa.me/${customer.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold hover:bg-emerald-500/20 transition-colors"
                      >
                        <WhatsAppIcon size={14} />
                        <span>+{customer.whatsapp}</span>
                      </a>
                    )}
                    {customer.instagramUsername && (
                      <a
                        href={`https://instagram.com/${customer.instagramUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20 text-[11px] font-semibold hover:bg-pink-500/20 transition-colors"
                      >
                        <InstagramIcon size={14} />
                        <span>@{customer.instagramUsername}</span>
                      </a>
                    )}
                    {customer.facebookUrl && (
                      <a
                        href={customer.facebookUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[11px] font-semibold hover:bg-blue-500/20 transition-colors"
                      >
                        <FacebookIcon size={14} />
                        <span>Facebook</span>
                      </a>
                    )}
                    {customer.tiktokUsername && (
                      <a
                        href={`https://tiktok.com/@${customer.tiktokUsername}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 text-slate-200 border border-slate-700 text-[11px] font-semibold hover:bg-slate-700 transition-colors"
                      >
                        <TikTokIcon size={14} />
                        <span>@{customer.tiktokUsername}</span>
                      </a>
                    )}
                    {customer.linkedinUrl && (
                      <a
                        href={customer.linkedinUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 text-[11px] font-semibold hover:bg-sky-500/20 transition-colors"
                      >
                        <LinkedInIcon size={14} />
                        <span>LinkedIn</span>
                      </a>
                    )}
                  </div>
                </div>
              )}

              {customer.internalNote && (
                <div className="sm:col-span-2 p-3.5 bg-[#070A10] rounded-2xl border border-slate-800 text-slate-300 text-[11px]">
                  <span className="font-bold text-amber-400 block mb-1">Catatan Internal Admin:</span>
                  {customer.internalNote}
                </div>
              )}
            </div>
          </div>

          {/* Orders History for this Customer */}
          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <ShoppingBag className="w-4 h-4 text-emerald-400" />
                <span>Riwayat Pesanan Kartu Fisik</span>
              </h2>
              <button
                onClick={() => setOrderModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Tambah Pesanan</span>
              </button>
            </div>

            <div className="divide-y divide-slate-800/60">
              {customer.orders?.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">
                  Belum ada riwayat pesanan cetak kartu untuk pelanggan ini.
                </p>
              ) : (
                customer.orders?.map((order: any) => (
                  <div key={order.id} className="py-3.5 flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-bold text-white block">
                        {order.packageName || "Paket Standar"}
                      </span>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span>{order.quantity} pcs</span>
                        <span>•</span>
                        <span className="text-amber-300 font-semibold">{formatRupiah(order.totalPrice)}</span>
                        <span>•</span>
                        <span>{new Date(order.orderDate).toLocaleDateString("id-ID")}</span>
                      </div>
                      {order.note && (
                        <p className="text-[10px] text-slate-500 mt-1 italic">{order.note}</p>
                      )}
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
                      <span className="text-[10px] text-slate-400 capitalize">
                        {order.productionStatus}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Tambah Pesanan Baru */}
      {orderModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0B0F19] border border-amber-500/30 rounded-3xl p-6 shadow-2xl space-y-4 relative">
            <button
              onClick={() => setOrderModalOpen(false)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-slate-900 border border-slate-800"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="text-base font-bold text-white">Tambah Pesanan Cetak Kartu</h3>
            <p className="text-xs text-slate-400">
              Pelanggan: <span className="text-white font-bold">{customer.businessName}</span>
            </p>

            <form onSubmit={handleCreateOrder} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nama Paket</label>
                <input
                  type="text"
                  required
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Jumlah (Pcs)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={orderQuantity}
                    onChange={(e) => setOrderQuantity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Total Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status Pembayaran</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="belum_bayar">Belum Bayar</option>
                    <option value="dp">DP (Uang Muka)</option>
                    <option value="lunas">Lunas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Status Produksi</label>
                  <select
                    value={productionStatus}
                    onChange={(e) => setProductionStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="menunggu">Menunggu</option>
                    <option value="dicetak">Dicetak</option>
                    <option value="dikirim">Dikirim</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Catatan Pesanan</label>
                <input
                  type="text"
                  placeholder="Contoh: Finishing doff, laminasi ganda..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setOrderModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 text-slate-300 rounded-xl hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={creatingOrder}
                  className="px-5 py-2.5 btn-gold text-black font-extrabold rounded-xl flex items-center gap-1.5"
                >
                  {creatingOrder ? "Menyimpan..." : "Simpan Pesanan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
