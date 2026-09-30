"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShoppingBag,
  PlusCircle,
  Search,
  Filter,
  FileSpreadsheet,
  Trash2,
  CheckCircle2,
  Clock,
  Truck,
  ExternalLink,
  Loader2,
  Calendar,
} from "lucide-react";
import { formatRupiah } from "@/lib/normalize";

export default function OrdersListPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [productionStatus, setProductionStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  // Modal new order
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState("");
  const [quantity, setQuantity] = useState(100);
  const [packageName, setPackageName] = useState("Paket Standar 100 pcs");
  const [totalPrice, setTotalPrice] = useState(250000);
  const [modalPayStatus, setModalPayStatus] = useState("belum_bayar");
  const [modalProdStatus, setModalProdStatus] = useState("menunggu");
  const [orderNote, setOrderNote] = useState("");
  const [submittingOrder, setSubmittingOrder] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        paymentStatus,
        productionStatus,
        page: page.toString(),
        limit: "15",
      });

      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const data = await res.json();
      setOrders(data.orders || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomersList = async () => {
    try {
      const res = await fetch("/api/admin/customers?limit=100");
      const data = await res.json();
      setCustomers(data.customers || []);
      if (data.customers?.length > 0) {
        setSelectedCustomerId(data.customers[0].id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [search, paymentStatus, productionStatus, page]);

  useEffect(() => {
    fetchCustomersList();
  }, []);

  const handleUpdateStatus = async (
    orderId: string,
    field: "paymentStatus" | "productionStatus",
    value: string
  ) => {
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: value }),
      });

      if (res.ok) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, [field]: value } : o))
        );
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm("Apakah Anda yakin ingin menghapus pesanan ini?")) return;
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, { method: "DELETE" });
      if (res.ok) {
        fetchOrders();
      }
    } catch {
      alert("Gagal menghapus.");
    }
  };

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert("Pilih pelanggan terlebih dahulu");
      return;
    }

    setSubmittingOrder(true);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: selectedCustomerId,
          quantity: Number(quantity),
          packageName,
          totalPrice: Number(totalPrice),
          paymentStatus: modalPayStatus,
          productionStatus: modalProdStatus,
          note: orderNote,
        }),
      });

      if (res.ok) {
        setModalOpen(false);
        fetchOrders();
      } else {
        alert("Gagal menambahkan pesanan.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    } finally {
      setSubmittingOrder(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Manajemen Pembelian & Pesanan
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Pantau status pembayaran kartu, proses cetak fisik, dan pengiriman ke pelanggan
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/admin/export/orders.csv"
            className="px-3.5 py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV</span>
          </a>

          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Tambah Pesanan</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama bisnis, pemilik..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={paymentStatus}
            onChange={(e) => {
              setPaymentStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">Semua Status Bayar</option>
            <option value="belum_bayar">Belum Bayar</option>
            <option value="dp">DP</option>
            <option value="lunas">Lunas</option>
          </select>

          <select
            value={productionStatus}
            onChange={(e) => {
              setProductionStatus(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">Semua Status Produksi</option>
            <option value="menunggu">Menunggu</option>
            <option value="dicetak">Dicetak</option>
            <option value="dikirim">Dikirim</option>
            <option value="selesai">Selesai</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/60 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4">Pelanggan</th>
                <th className="p-4">Paket & Jumlah</th>
                <th className="p-4">Total Harga</th>
                <th className="p-4">Status Pembayaran</th>
                <th className="p-4">Status Produksi</th>
                <th className="p-4">Tanggal & Catatan</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                    <span>Memuat daftar pesanan...</span>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada data pesanan yang sesuai filter.
                  </td>
                </tr>
              ) : (
                orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div>
                        <Link
                          href={`/admin/customers/${o.customer.id}`}
                          className="font-bold text-white hover:text-blue-400 block"
                        >
                          {o.customer.businessName}
                        </Link>
                        <span className="text-[11px] text-slate-400">
                          {o.customer.ownerName} ({o.customer.whatsapp})
                        </span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-semibold text-slate-200 block">
                        {o.packageName || "Standar"}
                      </span>
                      <span className="text-[11px] text-slate-400">{o.quantity} pcs</span>
                    </td>
                    <td className="p-4 font-bold text-white">
                      {formatRupiah(o.totalPrice)}
                    </td>
                    <td className="p-4">
                      <select
                        value={o.paymentStatus}
                        onChange={(e) =>
                          handleUpdateStatus(o.id, "paymentStatus", e.target.value)
                        }
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border focus:outline-none capitalize cursor-pointer ${
                          o.paymentStatus === "lunas"
                            ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            : o.paymentStatus === "dp"
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                            : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                        }`}
                      >
                        <option value="belum_bayar" className="bg-slate-900 text-rose-400">
                          Belum Bayar
                        </option>
                        <option value="dp" className="bg-slate-900 text-amber-400">
                          DP
                        </option>
                        <option value="lunas" className="bg-slate-900 text-emerald-400">
                          Lunas
                        </option>
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={o.productionStatus}
                        onChange={(e) =>
                          handleUpdateStatus(o.id, "productionStatus", e.target.value)
                        }
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-950 text-slate-200 focus:outline-none capitalize cursor-pointer"
                      >
                        <option value="menunggu" className="bg-slate-900">
                          Menunggu
                        </option>
                        <option value="dicetak" className="bg-slate-900">
                          Dicetak
                        </option>
                        <option value="dikirim" className="bg-slate-900">
                          Dikirim
                        </option>
                        <option value="selesai" className="bg-slate-900">
                          Selesai
                        </option>
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="text-[11px] text-slate-400">
                        <span>{new Date(o.orderDate).toLocaleDateString("id-ID")}</span>
                        {o.note && (
                          <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1 italic">
                            {o.note}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteOrder(o.id)}
                        title="Hapus Pesanan"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-50 hover:bg-slate-800 text-slate-300"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 disabled:opacity-50 hover:bg-slate-800 text-slate-300"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Tambah Pesanan Baru */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Tambah Pesanan Baru</h3>

            <form onSubmit={handleCreateOrder} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 font-medium mb-1">Pilih Pelanggan</label>
                <select
                  required
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.businessName} ({c.ownerName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Nama Paket</label>
                <input
                  type="text"
                  required
                  value={packageName}
                  onChange={(e) => setPackageName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Jumlah (Pcs)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Total Harga (Rp)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={totalPrice}
                    onChange={(e) => setTotalPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status Bayar</label>
                  <select
                    value={modalPayStatus}
                    onChange={(e) => setModalPayStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="belum_bayar">Belum Bayar</option>
                    <option value="dp">DP</option>
                    <option value="lunas">Lunas</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Status Produksi</label>
                  <select
                    value={modalProdStatus}
                    onChange={(e) => setModalProdStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option value="menunggu">Menunggu</option>
                    <option value="dicetak">Dicetak</option>
                    <option value="dikirim">Dikirim</option>
                    <option value="selesai">Selesai</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-medium mb-1">Catatan</label>
                <input
                  type="text"
                  placeholder="Catatan pengerjaan / resi..."
                  value={orderNote}
                  onChange={(e) => setOrderNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingOrder}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  {submittingOrder ? "Menyimpan..." : "Simpan Pesanan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
