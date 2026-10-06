"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  PlusCircle,
  Search,
  Download,
  ExternalLink,
  QrCode,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Archive,
  Loader2,
  Eye,
} from "lucide-react";

export default function CustomersListPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });

  // Batch selection
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        search,
        status,
        sort,
        page: page.toString(),
        limit: "10",
      });

      const res = await fetch(`/api/admin/customers?${params.toString()}`);
      const data = await res.json();
      setCustomers(data.customers || []);
      setPagination(data.pagination || { page: 1, total: 0, totalPages: 1 });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search, status, sort, page]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus profil "${name}"? Riwayat pesanan akan tetap tersimpan.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/customers/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchCustomers();
      } else {
        alert("Gagal menghapus pelanggan.");
      }
    } catch {
      alert("Terjadi kesalahan.");
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === customers.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(customers.map((c) => c.id));
    }
  };

  const handleToggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            Pelanggan & Profil Kartu
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola data profil bisnis, cetak kode QR, dan pantau status profil aktif
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <a
            href="/admin/export/customers.csv"
            className="px-3.5 py-2.5 bg-[#0B0F19] hover:bg-[#162033] border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold rounded-xl transition-colors flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
            <span>Ekspor CSV</span>
          </a>

          {selectedIds.length > 0 && (
            <a
              href={`/api/admin/export/qr-zip?ids=${selectedIds.join(",")}`}
              className="px-3.5 py-2.5 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 text-xs font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
            >
              <Archive className="w-4 h-4 text-[#D4AF37]" />
              <span>Unduh {selectedIds.length} QR (ZIP)</span>
            </a>
          )}

          <Link
            href="/admin/customers/new"
            className="px-4 py-2.5 btn-gold text-black text-xs font-extrabold rounded-xl transition-all flex items-center gap-2 active:scale-95 shadow-md shadow-amber-500/15"
          >
            <PlusCircle className="w-4 h-4 text-black" />
            <span>Tambah Pelanggan</span>
          </Link>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari bisnis, nama pemilik, no WA..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-4 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="all">Semua Status</option>
            <option value="active">Status: Aktif</option>
            <option value="inactive">Status: Nonaktif</option>
          </select>

          <select
            value={sort}
            onChange={(e) => {
              setSort(e.target.value);
              setPage(1);
            }}
            className="px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-[#D4AF37]"
          >
            <option value="newest">Urutan: Terbaru</option>
            <option value="oldest">Urutan: Terlama</option>
            <option value="name">Nama Bisnis (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-3xl bg-[#0B0F19]/90 border border-slate-800/90 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 bg-[#070A10] text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={customers.length > 0 && selectedIds.length === customers.length}
                    onChange={handleToggleSelectAll}
                    className="rounded border-slate-700 bg-[#070A10] text-[#D4AF37] focus:ring-0 cursor-pointer accent-amber-500"
                  />
                </th>
                <th className="p-4">Bisnis & Pemilik</th>
                <th className="p-4">Tautan Slug</th>
                <th className="p-4">WhatsApp</th>
                <th className="p-4">Total Scan</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF37]" />
                    <span>Memuat data pelanggan...</span>
                  </td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-500">
                    Tidak ada pelanggan yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[#101726]/60 transition-colors">
                    <td className="p-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(c.id)}
                        onChange={() => handleToggleSelect(c.id)}
                        className="rounded border-slate-700 bg-[#070A10] text-[#D4AF37] focus:ring-0 cursor-pointer accent-amber-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center font-black text-white text-xs shrink-0 shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${c.accentColor || "#D4AF37"} 0%, #070A10 100%)`,
                          }}
                        >
                          {c.businessName.charAt(0)}
                        </div>
                        <div>
                          <Link
                            href={`/admin/customers/${c.id}`}
                            className="font-bold text-white hover:text-[#D4AF37] transition-colors block"
                          >
                            {c.businessName}
                          </Link>
                          <span className="text-[11px] text-slate-400">{c.ownerName || "Tanpa Nama Pemilik"}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <Link
                        href={`/c/${c.slug}`}
                        target="_blank"
                        className="text-[#D4AF37] hover:text-amber-300 font-mono text-[11px] flex items-center gap-1"
                      >
                        <span>/c/{c.slug}</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </td>
                    <td className="p-4 text-slate-300">+{c.whatsapp}</td>
                    <td className="p-4">
                      <span className="font-bold text-emerald-400">
                        {c._count?.pageViews || 0} scan
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          c.isActive
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        }`}
                      >
                        {c.isActive ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Aktif</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3 h-3" />
                            <span>Nonaktif</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/customers/${c.id}`}
                          title="Lihat Detail & QR"
                          className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/customers/${c.id}/edit`}
                          title="Edit Pelanggan"
                          className="p-2 text-slate-400 hover:text-[#D4AF37] hover:bg-amber-500/10 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleDelete(c.id, c.businessName)}
                          title="Hapus Pelanggan"
                          className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <span>
              Halaman {pagination.page} dari {pagination.totalPages} ({pagination.total} total profil)
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="px-3.5 py-1.5 rounded-xl bg-[#070A10] border border-slate-800 disabled:opacity-40 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                Sebelumnya
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage(page + 1)}
                className="px-3.5 py-1.5 rounded-xl bg-[#070A10] border border-slate-800 disabled:opacity-40 hover:bg-slate-800 text-slate-300 transition-colors"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
