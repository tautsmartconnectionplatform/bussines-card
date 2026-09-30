"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Save,
  ArrowLeft,
  Upload,
  Image as ImageIcon,
  Smartphone,
  ExternalLink,
  MapPin,
  Download,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Lock,
  Phone,
  MessageSquare,
  Mail,
  Globe,
  Briefcase,
  Building2,
  User,
  Share2,
} from "lucide-react";
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  LinkedInIcon,
} from "@/components/ui/BrandIcons";
import { generateSlug, normalizeWhatsApp } from "@/lib/normalize";

interface CustomerFormProps {
  initialData?: {
    id?: string;
    businessName: string;
    ownerName: string;
    jobTitle?: string | null;
    email?: string | null;
    phone?: string | null;
    city?: string | null;
    website?: string | null;
    slug: string;
    tagline?: string | null;
    logoPath?: string | null;
    coverPath?: string | null;
    address: string;
    mapsUrl?: string | null;
    whatsapp: string;
    whatsappMessage?: string | null;
    facebookUrl?: string | null;
    instagramUsername?: string | null;
    tiktokUsername?: string | null;
    linkedinUrl?: string | null;
    accentColor: string;
    isActive: boolean;
    internalNote?: string | null;
  };
  isEdit?: boolean;
}

export default function CustomerForm({ initialData, isEdit }: CustomerFormProps) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    businessName: initialData?.businessName || "",
    ownerName: initialData?.ownerName || "",
    jobTitle: initialData?.jobTitle || "",
    email: initialData?.email || "",
    phone: initialData?.phone || "",
    city: initialData?.city || "",
    website: initialData?.website || "",
    slug: initialData?.slug || "",
    tagline: initialData?.tagline || "",
    logoPath: initialData?.logoPath || "",
    coverPath: initialData?.coverPath || "",
    address: initialData?.address || "",
    mapsUrl: initialData?.mapsUrl || "",
    whatsapp: initialData?.whatsapp || "",
    whatsappMessage: initialData?.whatsappMessage || "",
    facebookUrl: initialData?.facebookUrl || "",
    instagramUsername: initialData?.instagramUsername || "",
    tiktokUsername: initialData?.tiktokUsername || "",
    linkedinUrl: initialData?.linkedinUrl || "",
    accentColor: initialData?.accentColor || "#2563EB",
    isActive: initialData?.isActive ?? true,
    internalNote: initialData?.internalNote || "",
  });

  const [autoSlug, setAutoSlug] = useState(!isEdit);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (autoSlug && !isEdit && formData.businessName) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(prev.businessName),
      }));
    }
  }, [formData.businessName, autoSlug, isEdit]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2 MB");
      return;
    }

    setUploadingLogo(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengunggah logo");

      setFormData((prev) => ({ ...prev, logoPath: json.url }));
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah file");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran file maksimal 2 MB");
      return;
    }

    setUploadingCover(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("file", file);

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: data,
      });

      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal mengunggah sampul");

      setFormData((prev) => ({ ...prev, coverPath: json.url }));
    } catch (err: any) {
      setError(err.message || "Gagal mengunggah file");
    } finally {
      setUploadingCover(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const url = isEdit
        ? `/api/admin/customers/${initialData?.id}`
        : `/api/admin/customers`;

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await res.json();

      if (!res.ok) {
        throw new Error(result.error || "Gagal menyimpan data pelanggan");
      }

      setSuccessMsg("Data berhasil disimpan!");
      setTimeout(() => {
        router.push(isEdit ? `/admin/customers/${initialData?.id}` : "/admin/customers");
        router.refresh();
      }, 800);
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan");
    } finally {
      setSubmitting(false);
    }
  };

  const displayName = formData.ownerName || formData.businessName || "Nama Anda";
  const primaryPhone = formData.phone || formData.whatsapp;

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white">
              {isEdit ? "Edit Profil Pelanggan" : "Tambah Pelanggan Baru"}
            </h1>
            <p className="text-xs text-slate-400">
              Isi data profil dan periksa pratinjau kartu 5 bagian secara langsung
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form Grid with Live Mobile Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* 1. INFORMASI PROFIL & PEKERJAAN */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>1. Informasi Profil & Pekerjaan</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Lengkap / Pemilik <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Budi Santoso"
                  value={formData.ownerName}
                  onChange={(e) =>
                    setFormData({ ...formData, ownerName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jabatan / Pekerjaan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Founder & CEO / Marketing Manager"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nama Perusahaan / Bisnis <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kopi Nusantara Artisan Roastery"
                  value={formData.businessName}
                  onChange={(e) =>
                    setFormData({ ...formData, businessName: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Slug URL */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Slug URL Kartu <span className="text-rose-400">*</span>
                </label>
                {!isEdit && (
                  <label className="text-[11px] text-slate-400 flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoSlug}
                      onChange={(e) => setAutoSlug(e.target.checked)}
                      className="rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-0"
                    />
                    <span>Otomatis dari nama bisnis</span>
                  </label>
                )}
              </div>
              <div className="flex rounded-xl overflow-hidden border border-slate-800 bg-slate-950">
                <span className="px-3 py-2.5 bg-slate-900 text-slate-500 text-xs flex items-center border-r border-slate-800">
                  /c/
                </span>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => {
                    setAutoSlug(false);
                    setFormData({ ...formData, slug: generateSlug(e.target.value) });
                  }}
                  placeholder="budi-santoso"
                  className="flex-1 px-3.5 py-2.5 bg-transparent text-sm text-white focus:outline-none"
                />
              </div>
              {isEdit && (
                <p className="text-[11px] text-amber-400/90 mt-1 flex items-center gap-1">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span>
                    Peringatan: Mengubah slug akan membuat QR fisik lama yang sudah tercetak tidak berfungsi!
                  </span>
                </p>
              )}
            </div>

            {/* Tagline */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-300">
                  Tagline / Deskripsi Singkat
                </label>
                <span className="text-[10px] text-slate-500">
                  {formData.tagline.length}/160 karakter
                </span>
              </div>
              <input
                type="text"
                maxLength={160}
                placeholder="Contoh: Kopi artisan pilihan nusantara ☕"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {/* Foto Sampul (Cover Banner) Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Foto Sampul / Banner Profil (Gaya Facebook, Maks. 2 MB)
              </label>
              <div className="flex items-center gap-4">
                {formData.coverPath ? (
                  <div className="relative w-28 h-16 rounded-xl border border-slate-700 overflow-hidden shrink-0 bg-slate-950">
                    <img
                      src={formData.coverPath}
                      alt="Sampul"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, coverPath: "" })}
                      className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] px-1.5 py-0.5 rounded-bl"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="w-28 h-16 rounded-xl border border-dashed border-slate-800 bg-slate-950 flex items-center justify-center text-slate-600 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 cursor-pointer transition-colors">
                    {uploadingCover ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengunggah Sampul...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Foto Sampul</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleCoverUpload}
                      disabled={uploadingCover}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Logo / Foto Profil Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Foto Profil / Logo Avatar (Maks. 2 MB)
              </label>
              <div className="flex items-center gap-4">
                {formData.logoPath ? (
                  <div className="relative w-16 h-16 rounded-xl border border-slate-700 overflow-hidden shrink-0 bg-slate-950">
                    <img
                      src={formData.logoPath}
                      alt="Logo"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, logoPath: "" })}
                      className="absolute top-0 right-0 bg-rose-600 text-white text-[10px] px-1 py-0.5 rounded-bl"
                    >
                      Hapus
                    </button>
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl border border-dashed border-slate-800 bg-slate-950 flex items-center justify-center text-slate-600 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 cursor-pointer transition-colors">
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Mengunggah...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5" />
                        <span>Unggah Foto / Logo</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoUpload}
                      disabled={uploadingLogo}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 2. DETAIL KONTAK (TELPON, EMAIL, WHATSAPP) */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>2. Kontak & Saluran Komunikasi</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor WhatsApp <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="08123456789 / 628123456789"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor Telpon Seluler (Jika berbeda)
                </label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alamat Email (Opsional)
                </label>
                <input
                  type="email"
                  placeholder="kontak@bisnisanda.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Pesan Awal WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Halo, saya melihat kartu digital Anda"
                  value={formData.whatsappMessage}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsappMessage: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 3 & 4. LOKASI & WEBSITE */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>3 & 4. Lokasi & Website Resmi</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Kota / Wilayah (Singkat)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Sukabumi / Jakarta Selatan"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Website Resmi (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://bisnisanda.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Alamat Lengkap <span className="text-rose-400">*</span>
                </label>
                <textarea
                  rows={2}
                  required
                  placeholder="Jl. Raya Sukabumi No. 12, Jawa Barat"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Link Google Maps (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://maps.google.com/?q=..."
                  value={formData.mapsUrl}
                  onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* 5. MEDIA SOSIAL */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-pink-400" />
              <span>5. Media Sosial</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <span className="text-[#E1306C]"><InstagramIcon size={14} /></span>
                  <span>Instagram (Username)</span>
                </label>
                <input
                  type="text"
                  placeholder="kopinusantara.id"
                  value={formData.instagramUsername}
                  onChange={(e) =>
                    setFormData({ ...formData, instagramUsername: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <span className="text-white"><TikTokIcon size={14} /></span>
                  <span>TikTok (Username)</span>
                </label>
                <input
                  type="text"
                  placeholder="kopinusantara"
                  value={formData.tiktokUsername}
                  onChange={(e) =>
                    setFormData({ ...formData, tiktokUsername: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <span className="text-[#1877F2]"><FacebookIcon size={14} /></span>
                  <span>Facebook (URL / Halaman)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://facebook.com/kopinusantara"
                  value={formData.facebookUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, facebookUrl: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <span className="text-[#0A66C2]"><LinkedInIcon size={14} /></span>
                  <span>LinkedIn (URL / Profil)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/in/budisantoso"
                  value={formData.linkedinUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedinUrl: e.target.value })
                  }
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* TAMPILAN & PENGATURAN */}
          <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Tampilan & Status
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Warna Aksen Profil
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.accentColor}
                    onChange={(e) =>
                      setFormData({ ...formData, accentColor: e.target.value })
                    }
                    className="w-10 h-10 rounded-xl border border-slate-700 bg-transparent cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.accentColor}
                    onChange={(e) =>
                      setFormData({ ...formData, accentColor: e.target.value })
                    }
                    className="w-28 px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono text-white uppercase focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Status Profil Kartu
                </label>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() =>
                      setFormData({ ...formData, isActive: !formData.isActive })
                    }
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      formData.isActive ? "bg-emerald-500" : "bg-slate-700"
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                        formData.isActive ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                  <span className="text-xs font-medium text-slate-300">
                    {formData.isActive ? "Aktif (Dapat diakses)" : "Nonaktif (Terkunci)"}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Catatan Internal (Hanya terlihat Admin)
              </label>
              <textarea
                rows={2}
                placeholder="Catatan pesanan, permintaan khusus, dll."
                value={formData.internalNote}
                onChange={(e) =>
                  setFormData({ ...formData, internalNote: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-2 transition-all active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{isEdit ? "Simpan Perubahan" : "Simpan Pelanggan"}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Live Mobile Preview (Structured into 5 Sections) */}
        <div className="lg:col-span-5 sticky top-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-blue-400" />
              <span>Pratinjau Kartu Digital</span>
            </span>
            <span className="text-[10px] text-slate-500">Update otomatis</span>
          </div>

          {/* Mock Phone Frame */}
          <div className="w-full max-w-[340px] mx-auto bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-800">
            {/* Phone Screen */}
            <div className="w-full bg-slate-950 rounded-[30px] p-3 text-white overflow-y-auto relative border border-slate-800/80 max-h-[580px] space-y-3">
              {/* 1. SECTION PROFIL WITH FACEBOOK-STYLE COVER BANNER */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 text-center relative overflow-hidden">
                {/* Cover Banner */}
                <div className="w-full h-20 relative bg-slate-800 overflow-hidden">
                  {formData.coverPath ? (
                    <img
                      src={formData.coverPath}
                      alt="Sampul"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div
                      className="w-full h-full relative"
                      style={{
                        background: `linear-gradient(135deg, ${formData.accentColor}ee 0%, #0f172a 100%)`,
                      }}
                    />
                  )}
                </div>

                <div className="p-3.5 -mt-8 relative z-10 flex flex-col items-center">
                  {formData.logoPath ? (
                    <img
                      src={formData.logoPath}
                      alt="Logo"
                      className="w-14 h-14 rounded-2xl object-cover shadow-xl border-2 border-slate-900 bg-slate-950 mx-auto mb-2"
                    />
                  ) : (
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-extrabold shadow-xl border-2 border-slate-900 mx-auto mb-2"
                      style={{ backgroundColor: formData.accentColor }}
                    >
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                  )}

                  <h3 className="font-extrabold text-sm text-white tracking-tight line-clamp-1">
                    {displayName}
                  </h3>
                  {formData.jobTitle && (
                    <p className="text-[10px] text-blue-400 font-semibold mt-0.5">{formData.jobTitle}</p>
                  )}
                  {formData.businessName && (
                    <p className="text-[10px] text-slate-400 mt-0.5">{formData.businessName}</p>
                  )}

                  {/* Quick actions */}
                  <div className="grid grid-cols-4 gap-1.5 w-full mt-3 pt-3 border-t border-slate-800 text-[9px] text-slate-300">
                    <div className="p-1.5 rounded-lg bg-slate-800 flex flex-col items-center">
                      <Phone className="w-3 h-3 text-blue-400 mb-0.5" />
                      <span>Telpon</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-800 flex flex-col items-center">
                      <MessageSquare className="w-3 h-3 text-emerald-400 mb-0.5" />
                      <span>SMS</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-800 flex flex-col items-center">
                      <Mail className="w-3 h-3 text-amber-400 mb-0.5" />
                      <span>Email</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-800 flex flex-col items-center">
                      <MapPin className="w-3 h-3 text-purple-400 mb-0.5" />
                      <span>Lokasi</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. SECTION KONTAK */}
              <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-2 text-left">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                  Kontak
                </span>
                <div className="space-y-1.5 text-[10px]">
                  <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg">
                    <span className="text-slate-400">Nama:</span>
                    <span className="text-white font-medium truncate">{displayName}</span>
                  </div>
                  {primaryPhone && (
                    <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg">
                      <span className="text-slate-400">Telpon:</span>
                      <span className="text-white font-medium">+{primaryPhone}</span>
                    </div>
                  )}
                  {formData.email && (
                    <div className="flex items-center justify-between p-2 bg-slate-950 rounded-lg">
                      <span className="text-slate-400">Email:</span>
                      <span className="text-white font-medium truncate">{formData.email}</span>
                    </div>
                  )}
                </div>

                <div
                  className="w-full py-2 px-3 rounded-xl font-bold text-white text-[11px] flex items-center justify-center gap-1.5 shadow-md mt-1"
                  style={{ backgroundColor: formData.accentColor }}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Simpan Kontak (.vcf)</span>
                </div>
              </div>

              {/* 3. SECTION LOKASI */}
              {(formData.address || formData.city) && (
                <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-2 text-left">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
                      Lokasi
                    </span>
                    {formData.city && (
                      <span className="text-[9px] font-bold text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded-full">
                        {formData.city}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-300 line-clamp-2">{formData.address}</p>
                  <div className="w-full py-1.5 px-2.5 rounded-lg bg-slate-800 text-[10px] font-semibold text-slate-200 flex items-center justify-between">
                    <span>Show on map</span>
                    <ExternalLink className="w-3 h-3 text-purple-400" />
                  </div>
                </div>
              )}

              {/* 4. SECTION WEBSITE */}
              {formData.website && (
                <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-1.5 text-left">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                    Website
                  </span>
                  <div className="p-2 rounded-lg bg-slate-950 flex items-center justify-between text-[10px]">
                    <span className="text-blue-400 font-medium truncate">{formData.website}</span>
                    <ExternalLink className="w-3 h-3 text-slate-400" />
                  </div>
                </div>
              )}

              {/* 5. SECTION MEDIA SOSIAL */}
              <div className="bg-slate-900/90 rounded-2xl p-3 border border-slate-800 space-y-1.5 text-left">
                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider block">
                  Media Sosial & Chat
                </span>
                <div className="space-y-1 text-[10px]">
                  {formData.whatsapp && (
                    <div className="p-2 rounded-lg bg-slate-950 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#25D366]">
                        <WhatsAppIcon size={13} />
                        <span className="font-semibold">WhatsApp</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </div>
                  )}
                  {formData.instagramUsername && (
                    <div className="p-2 rounded-lg bg-slate-950 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#E1306C]">
                        <InstagramIcon size={13} />
                        <span className="font-semibold">@{formData.instagramUsername}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </div>
                  )}
                  {formData.facebookUrl && (
                    <div className="p-2 rounded-lg bg-slate-950 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#1877F2]">
                        <FacebookIcon size={13} />
                        <span className="font-semibold">Facebook</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </div>
                  )}
                  {formData.tiktokUsername && (
                    <div className="p-2 rounded-lg bg-slate-950 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-white">
                        <TikTokIcon size={13} />
                        <span className="font-semibold">@{formData.tiktokUsername}</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </div>
                  )}
                  {formData.linkedinUrl && (
                    <div className="p-2 rounded-lg bg-slate-950 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-[#0A66C2]">
                        <LinkedInIcon size={13} />
                        <span className="font-semibold">LinkedIn</span>
                      </div>
                      <ExternalLink className="w-3 h-3 text-slate-500" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
