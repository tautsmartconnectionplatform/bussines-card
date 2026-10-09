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
  ShieldCheck,
} from "lucide-react";
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  LinkedInIcon,
} from "@/components/ui/BrandIcons";
import { generateSlug, normalizeWhatsApp } from "@/lib/normalize";

function isDarkColor(hexColor?: string | null): boolean {
  if (!hexColor) return false;
  let c = hexColor.trim().replace(/^#/, "");
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  if (c.length !== 6) return false;
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  if (isNaN(r) || isNaN(g) || isNaN(b)) return false;
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq < 140;
}

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
    accentColor: initialData?.accentColor || "#D4AF37",
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
  const previewCardBg = formData.accentColor || "#FFFFFF";
  const isPreviewDark = isDarkColor(previewCardBg);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3.5">
          <button
            type="button"
            onClick={() => router.back()}
            className="p-2.5 rounded-2xl bg-[#0B0F19] border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              {isEdit ? "Edit Profil Pelanggan" : "Tambah Pelanggan Baru"}
            </h1>
            <p className="text-xs text-slate-400 mt-0.5">
              Isi formulir profil bisnis dan amati pratinjau live smartphone di sebelah kanan
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Form Grid with Live Mobile Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form: 7 cols */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* 1. INFORMASI PROFIL & PEKERJAAN */}
          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <User className="w-4 h-4 text-[#D4AF37]" />
              <span>1. Informasi Profil & Identitas Bisnis</span>
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
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Jabatan / Profesi (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Founder & CEO"
                  value={formData.jobTitle}
                  onChange={(e) =>
                    setFormData({ ...formData, jobTitle: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
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
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
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
                      className="rounded border-slate-800 bg-[#070A10] text-[#D4AF37] focus:ring-0 accent-amber-500"
                    />
                    <span>Otomatis dari nama bisnis</span>
                  </label>
                )}
              </div>
              <div className="flex rounded-xl overflow-hidden border border-slate-800 bg-[#070A10]">
                <span className="px-3.5 py-2.5 bg-[#0B0F19] text-amber-400 font-mono text-xs flex items-center border-r border-slate-800">
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
                <p className="text-[11px] text-amber-400/90 mt-1.5 flex items-center gap-1">
                  <Lock className="w-3 h-3 shrink-0" />
                  <span>
                    Perhatian: Mengubah slug akan membuat kode QR fisik lama yang sudah dicetak tidak lagi valid.
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
                className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
            </div>

            {/* Foto Sampul (Cover Banner) Upload */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Foto Sampul / Banner Header Profil (Maks. 2 MB)
              </label>
              <div className="flex items-center gap-4">
                {formData.coverPath ? (
                  <div className="relative w-28 h-16 rounded-xl border border-slate-700 overflow-hidden shrink-0 bg-[#070A10]">
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
                  <div className="w-28 h-16 rounded-xl border border-dashed border-slate-800 bg-[#070A10] flex items-center justify-center text-slate-600 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#070A10] hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 cursor-pointer transition-colors">
                    {uploadingCover ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                        <span>Mengunggah Sampul...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
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
                  <div className="relative w-16 h-16 rounded-xl border border-slate-700 overflow-hidden shrink-0 bg-[#070A10]">
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
                  <div className="w-16 h-16 rounded-xl border border-dashed border-slate-800 bg-[#070A10] flex items-center justify-center text-slate-600 shrink-0">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                )}

                <div className="flex-1">
                  <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#070A10] hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200 cursor-pointer transition-colors">
                    {uploadingLogo ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#D4AF37]" />
                        <span>Mengunggah Foto...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-3.5 h-3.5 text-[#D4AF37]" />
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

          {/* 2. KONTAK & WHATSAPP */}
          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <Phone className="w-4 h-4 text-emerald-400" />
              <span>2. Kontak & WhatsApp</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor WhatsApp <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="081234567890"
                  value={formData.whatsapp}
                  onChange={(e) =>
                    setFormData({ ...formData, whatsapp: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Nomor Telepon Seluler (Jika berbeda)
                </label>
                <input
                  type="text"
                  placeholder="081234567890"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
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
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
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
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>
            </div>
          </div>

          {/* 3 & 4. LOKASI & WEBSITE */}
          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>3 & 4. Lokasi & Situs Web Resmi</span>
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
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Situs Web Resmi (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://bisnisanda.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37]"
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
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37] transition-colors"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Tautan Google Maps (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="https://maps.app.goo.gl/... atau https://maps.google.com/?q=..."
                  value={formData.mapsUrl}
                  onChange={(e) => setFormData({ ...formData, mapsUrl: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Jika dikosongkan, tombol Maps akan otomatis membuka pencarian alamat di Google Maps.
                </p>
              </div>
            </div>
          </div>

          {/* 5. MEDIA SOSIAL */}
          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
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
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
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
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <span className="text-[#1877F2]"><FacebookIcon size={14} /></span>
                  <span>Facebook (URL Halaman)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://facebook.com/kopinusantara"
                  value={formData.facebookUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, facebookUrl: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <span className="text-[#0A66C2]"><LinkedInIcon size={14} /></span>
                  <span>LinkedIn (URL Profil)</span>
                </label>
                <input
                  type="text"
                  placeholder="https://linkedin.com/in/budisantoso"
                  value={formData.linkedinUrl}
                  onChange={(e) =>
                    setFormData({ ...formData, linkedinUrl: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>
          </div>

          {/* TAMPILAN & PENGATURAN */}
          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider pb-2 border-b border-slate-800/80">
              Tampilan & Status Profil
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
                    className="w-28 px-3 py-2 bg-[#070A10] border border-slate-800 rounded-xl text-xs font-mono text-white uppercase focus:outline-none"
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
                Catatan Internal Admin
              </label>
              <textarea
                rows={2}
                placeholder="Catatan pesanan khusus, instruksi cetak, dll."
                value={formData.internalNote}
                onChange={(e) =>
                  setFormData({ ...formData, internalNote: e.target.value })
                }
                className="w-full px-3.5 py-2 bg-[#070A10] border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-[#D4AF37]"
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
              className="px-6 py-3 rounded-xl btn-gold text-black text-xs font-extrabold shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-black" />
                  <span>{isEdit ? "Simpan Perubahan" : "Simpan Pelanggan"}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Right Column: Live Mobile Preview */}
        <div className="lg:col-span-5 sticky top-8">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
              <Smartphone className="w-4 h-4 text-[#D4AF37]" />
              <span>Pratinjau Langsung Layar HP</span>
            </span>
            <span className="text-[10px] text-amber-400 font-semibold bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              Live Preview
            </span>
          </div>

          {/* Mock Phone Frame */}
          <div className="w-full max-w-[340px] mx-auto bg-slate-900 rounded-[40px] p-3 shadow-2xl border-4 border-slate-700 relative">
                {/* Top Phone Speaker Notch */}
                <div className="w-20 h-3.5 bg-slate-800 rounded-full mx-auto mb-2" />

                {/* Phone Screen - Latar belakang penuh mengikuti warna aksen */}
                <div
                  className="w-full rounded-[30px] p-2.5 overflow-y-auto relative border border-slate-700/60 max-h-[580px] space-y-2.5 transition-colors"
                  style={{ backgroundColor: previewCardBg, color: isPreviewDark ? "#FFFFFF" : "#1E293B" }}
                >
                  {/* Top Share Button */}
                  <div className="flex justify-end pr-0.5">
                    <div className={`flex items-center gap-1 px-2.5 py-0.5 text-[9px] font-medium rounded-full shadow-xs ${
                      isPreviewDark
                        ? "bg-white/15 border border-white/25 text-white"
                        : "bg-black/[0.04] border border-black/[0.08] text-slate-800"
                    }`}>
                      <Share2 className="w-2.5 h-2.5" />
                      <span>Bagikan</span>
                    </div>
                  </div>

                  {/* 1. SECTION PROFIL */}
                  <div
                    className={`rounded-2xl border shadow-xs text-center relative overflow-hidden ${
                      isPreviewDark ? "border-white/20 shadow-md" : "border-black/[0.08]"
                    }`}
                    style={{ backgroundColor: previewCardBg }}
                  >
                    {/* Cover Banner */}
                    <div className="w-full h-16 relative bg-[#0B1528] overflow-hidden flex items-center justify-center">
                      {formData.coverPath ? (
                        <img
                          src={formData.coverPath}
                          alt="Sampul"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 pb-2">
                          <span className="text-white font-extrabold text-sm tracking-widest">TAUT</span>
                        </div>
                      )}
                    </div>

                    {/* Squircle Avatar / Logo - Ukuran proporsional w-14 h-14 */}
                    <div className="relative -mt-8 mb-2 z-10 shrink-0">
                      <div className={`w-14 h-14 rounded-2xl bg-[#0B1528] border-2 ${
                        isPreviewDark ? "border-white/90" : "border-white"
                      } shadow-md flex items-center justify-center overflow-hidden p-0.5 shrink-0 mx-auto`}>
                        {formData.logoPath ? (
                          <img
                            src={formData.logoPath}
                            alt="Logo"
                            className="w-full h-full object-cover rounded-[14px]"
                          />
                        ) : (
                          <div className="text-white text-sm font-extrabold">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="px-3 pb-3 flex flex-col items-center">

                      <h3 className={`font-bold text-xs tracking-tight line-clamp-1 ${
                        isPreviewDark ? "text-white" : "text-slate-900"
                      }`}>
                        {displayName}
                      </h3>
                      {/* Job Title - Hapus simbol */}
                      {formData.jobTitle && (
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[9px] font-semibold mt-1 ${
                          isPreviewDark
                            ? "bg-white/20 border border-white/30 text-white"
                            : "bg-black/[0.05] border border-black/10 text-slate-800"
                        }`}>
                          <span>{formData.jobTitle}</span>
                        </div>
                      )}
                      {formData.businessName && (
                        <p className={`text-[9px] font-semibold uppercase tracking-widest mt-1 ${
                          isPreviewDark ? "text-white/80" : "text-slate-500"
                        }`}>{formData.businessName}</p>
                      )}
                      {formData.tagline && (
                        <p className={`text-[9px] mt-0.5 line-clamp-1 ${
                          isPreviewDark ? "text-white/70" : "text-slate-400"
                        }`}>{formData.tagline}</p>
                      )}

                      {/* Quick actions - 4 tombol icon-only (Telpon, SMS, Email, Maps) */}
                      <div className={`grid grid-cols-4 gap-1.5 w-full mt-2.5 pt-2 border-t text-[9px] ${
                        isPreviewDark ? "border-white/15" : "border-black/[0.06]"
                      }`}>
                        <div className={`p-2 rounded-xl border flex items-center justify-center ${
                          isPreviewDark ? "bg-white/15 border-white/20 text-white" : "bg-black/[0.04] border-black/[0.08] text-slate-800"
                        }`}>
                          <Phone className="w-3.5 h-3.5" />
                        </div>
                        <div className={`p-2 rounded-xl border flex items-center justify-center ${
                          isPreviewDark ? "bg-white/15 border-white/20 text-white" : "bg-black/[0.04] border-black/[0.08] text-slate-800"
                        }`}>
                          <MessageSquare className="w-3.5 h-3.5" />
                        </div>
                        <div className={`p-2 rounded-xl border flex items-center justify-center ${
                          isPreviewDark ? "bg-white/15 border-white/20 text-white" : "bg-black/[0.04] border-black/[0.08] text-slate-800"
                        }`}>
                          <Mail className="w-3.5 h-3.5" />
                        </div>
                        <div className={`p-2 rounded-xl border flex items-center justify-center ${
                          isPreviewDark ? "bg-white/15 border-white/20 text-white" : "bg-black/[0.04] border-black/[0.08] text-slate-800"
                        }`}>
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 2. SECTION KONTAK */}
                  <div
                    className={`rounded-2xl p-2.5 border shadow-xs space-y-1.5 text-left ${
                      isPreviewDark ? "border-white/20 shadow-md" : "border-black/[0.08]"
                    }`}
                    style={{ backgroundColor: previewCardBg }}
                  >
                    {/* Header - Hapus teks 'Informasi Resmi' */}
                    <div className="flex items-center justify-between pb-0.5">
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${
                        isPreviewDark ? "text-white" : "text-slate-900"
                      }`}>
                        KONTAK
                      </span>
                    </div>

                    <div className="space-y-1 text-[9px]">
                      {/* Nama - Hapus simbol */}
                      <div className={`p-1.5 border rounded-xl ${
                        isPreviewDark ? "bg-white/15 border-white/20" : "bg-black/[0.04] border-black/[0.08]"
                      }`}>
                        <span className={`block text-[8px] leading-tight ${isPreviewDark ? "text-white/60" : "text-slate-400"}`}>Nama</span>
                        <span className={`font-bold truncate block ${isPreviewDark ? "text-white" : "text-slate-900"}`}>{displayName}</span>
                      </div>
                      {/* Telpon - Hapus simbol */}
                      {primaryPhone && (
                        <div className={`p-1.5 border rounded-xl ${
                          isPreviewDark ? "bg-white/15 border-white/20" : "bg-black/[0.04] border-black/[0.08]"
                        }`}>
                          <span className={`block text-[8px] leading-tight ${isPreviewDark ? "text-white/60" : "text-slate-400"}`}>Nomor Telpon</span>
                          <span className={`font-bold block ${isPreviewDark ? "text-white" : "text-slate-900"}`}>+{primaryPhone}</span>
                        </div>
                      )}
                      {/* Email - Hapus simbol */}
                      {formData.email && (
                        <div className={`p-1.5 border rounded-xl ${
                          isPreviewDark ? "bg-white/15 border-white/20" : "bg-black/[0.04] border-black/[0.08]"
                        }`}>
                          <span className={`block text-[8px] leading-tight ${isPreviewDark ? "text-white/60" : "text-slate-400"}`}>Email</span>
                          <span className={`font-bold truncate block ${isPreviewDark ? "text-white" : "text-slate-900"}`}>{formData.email}</span>
                        </div>
                      )}
                      {/* Perusahaan - Hapus simbol */}
                      {formData.businessName && (
                        <div className={`p-1.5 border rounded-xl ${
                          isPreviewDark ? "bg-white/15 border-white/20" : "bg-black/[0.04] border-black/[0.08]"
                        }`}>
                          <span className={`block text-[8px] leading-tight ${isPreviewDark ? "text-white/60" : "text-slate-400"}`}>Perusahaan</span>
                          <span className={`font-bold truncate block ${isPreviewDark ? "text-white" : "text-slate-900"}`}>{formData.businessName}</span>
                        </div>
                      )}
                    </div>

                    <div className={`w-full py-2 px-3 rounded-xl font-semibold text-[10px] flex items-center justify-between shadow-xs mt-1 ${
                      isPreviewDark ? "bg-white text-slate-900" : "bg-[#0B1528] text-white"
                    }`}>
                      <Download className="w-3 h-3 opacity-80" />
                      <span>Simpan Kontak ke HP (.vcf)</span>
                      <Download className="w-3 h-3 opacity-80" />
                    </div>
                  </div>

                  {/* 3. SECTION LOKASI */}
                  {(formData.address || formData.city) && (
                    <div
                      className={`rounded-2xl p-2.5 border shadow-xs space-y-1.5 text-left ${
                        isPreviewDark ? "border-white/20 shadow-md" : "border-black/[0.08]"
                      }`}
                      style={{ backgroundColor: previewCardBg }}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                          isPreviewDark ? "text-white" : "text-slate-900"
                        }`}>
                          <MapPin className={`w-3 h-3 ${isPreviewDark ? "text-white/80" : "text-slate-700"}`} />
                          <span>Lokasi</span>
                        </span>
                        {formData.city && (
                          <span className={`text-[8px] font-medium px-1.5 py-0.2 rounded-full border ${
                            isPreviewDark
                              ? "bg-white/20 text-amber-200 border-white/30"
                              : "text-[#9E8357] bg-[#FDF6ED] border-[#F2E2CE]"
                          }`}>
                            {formData.city}
                          </span>
                        )}
                      </div>
                      <p className={`text-[9px] line-clamp-2 ${isPreviewDark ? "text-white/90" : "text-slate-700"}`}>{formData.address}</p>
                      <div className={`w-full py-1.5 px-2.5 rounded-xl border text-[9px] font-semibold flex items-center justify-between ${
                        isPreviewDark
                          ? "bg-white/15 border-white/20 text-white"
                          : "bg-black/[0.04] border-black/[0.08] text-slate-800"
                      }`}>
                        <span>Buka di Google Maps</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </div>
                    </div>
                  )}

                  {/* 4. SECTION WEBSITE */}
                  {formData.website && (
                    <div
                      className={`rounded-2xl p-2.5 border shadow-xs space-y-1 text-left ${
                        isPreviewDark ? "border-white/20 shadow-md" : "border-black/[0.08]"
                      }`}
                      style={{ backgroundColor: previewCardBg }}
                    >
                      <span className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                        isPreviewDark ? "text-white" : "text-slate-900"
                      }`}>
                        <Globe className={`w-3 h-3 ${isPreviewDark ? "text-white/80" : "text-slate-700"}`} />
                        <span>Website</span>
                      </span>
                      <div className={`p-1.5 rounded-xl border flex items-center justify-between text-[9px] ${
                        isPreviewDark
                          ? "bg-white/15 border-white/20 text-white"
                          : "bg-black/[0.04] border-black/[0.08] text-slate-900"
                      }`}>
                        <span className="font-bold truncate">{formData.website}</span>
                        <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                      </div>
                    </div>
                  )}

                  {/* 5. SECTION MEDIA SOSIAL - 1 warna logo, tanpa subtitle */}
                  <div
                    className={`rounded-2xl p-2.5 border shadow-xs space-y-1 text-left ${
                      isPreviewDark ? "border-white/20 shadow-md" : "border-black/[0.08]"
                    }`}
                    style={{ backgroundColor: previewCardBg }}
                  >
                    <span className={`text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      isPreviewDark ? "text-white" : "text-slate-900"
                    }`}>
                      <Share2 className={`w-3 h-3 ${isPreviewDark ? "text-white/80" : "text-slate-700"}`} />
                      <span>Media Sosial & Chat</span>
                    </span>
                    <div className="space-y-1 text-[9px]">
                      {formData.whatsapp && (
                        <div className={`p-1.5 rounded-xl border flex items-center justify-between ${
                          isPreviewDark ? "bg-white/15 border-white/20 text-white" : "bg-black/[0.04] border-black/[0.08] text-slate-800"
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              isPreviewDark ? "bg-white/15 text-white" : "bg-black/[0.05] text-slate-900"
                            }`}>
                              <WhatsAppIcon size={12} />
                            </div>
                            <span className="font-bold">WhatsApp</span>
                          </div>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </div>
                      )}
                      {formData.instagramUsername && (
                        <div className={`p-1.5 rounded-xl border flex items-center justify-between ${
                          isPreviewDark ? "bg-white/15 border-white/20 text-white" : "bg-black/[0.04] border-black/[0.08] text-slate-800"
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              isPreviewDark ? "bg-white/15 text-white" : "bg-black/[0.05] text-slate-900"
                            }`}>
                              <InstagramIcon size={12} />
                            </div>
                            <span className="font-bold">Instagram</span>
                          </div>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </div>
                      )}
                      {formData.facebookUrl && (
                        <div className={`p-1.5 rounded-xl border flex items-center justify-between ${
                          isPreviewDark ? "bg-white/15 border-white/20 text-white" : "bg-black/[0.04] border-black/[0.08] text-slate-800"
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              isPreviewDark ? "bg-white/15 text-white" : "bg-black/[0.05] text-slate-900"
                            }`}>
                              <FacebookIcon size={12} />
                            </div>
                            <span className="font-bold">Facebook</span>
                          </div>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </div>
                      )}
                      {formData.tiktokUsername && (
                        <div className={`p-1.5 rounded-xl border flex items-center justify-between ${
                          isPreviewDark ? "bg-white/15 border-white/20 text-white" : "bg-black/[0.04] border-black/[0.08] text-slate-800"
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              isPreviewDark ? "bg-white/15 text-white" : "bg-black/[0.05] text-slate-900"
                            }`}>
                              <TikTokIcon size={12} />
                            </div>
                            <span className="font-bold">TikTok</span>
                          </div>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                        </div>
                      )}
                      {formData.linkedinUrl && (
                        <div className={`p-1.5 rounded-xl border flex items-center justify-between ${
                          isPreviewDark ? "bg-white/15 border-white/20 text-white" : "bg-black/[0.04] border-black/[0.08] text-slate-800"
                        }`}>
                          <div className="flex items-center gap-1.5">
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                              isPreviewDark ? "bg-white/15 text-white" : "bg-black/[0.05] text-slate-900"
                            }`}>
                              <LinkedInIcon size={12} />
                            </div>
                            <span className="font-bold">LinkedIn</span>
                          </div>
                          <ExternalLink className="w-2.5 h-2.5 opacity-60" />
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
