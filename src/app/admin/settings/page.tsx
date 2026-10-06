"use client";

import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  Globe,
  Store,
  Lock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
} from "lucide-react";

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [sellerName, setSellerName] = useState("");
  const [footerText, setFooterText] = useState("");
  const [baseDomain, setBaseDomain] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings");
      const data = await res.json();
      if (data.settings) {
        setSellerName(data.settings.seller_name || "");
        setFooterText(data.settings.footer_text || "");
        setBaseDomain(data.settings.base_domain || "");
      }
      if (data.adminEmail) {
        setAdminEmail(data.adminEmail);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword && newPassword !== confirmPassword) {
      setError("Konfirmasi password baru tidak cocok.");
      return;
    }

    if (newPassword && newPassword.length < 6) {
      setError("Password baru minimal 6 karakter.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seller_name: sellerName,
          footer_text: footerText,
          base_domain: baseDomain,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyimpan pengaturan");
      }

      setSuccess("Pengaturan berhasil disimpan!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="pb-2 border-b border-slate-800/80">
        <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          Pengaturan Sistem
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Konfigurasi identitas penjual, teks branding footer, domain QR, dan keamanan akun
        </p>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#D4AF37]" />
          <p className="text-xs">Memuat pengaturan...</p>
        </div>
      ) : (
        <form onSubmit={handleSave} className="space-y-6">
          {/* Card: Branding & Domain */}
          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <Store className="w-4 h-4 text-[#D4AF37]" />
              <span>Branding & URL Dasar QR</span>
            </h2>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Nama Penjual / Penyedia Layanan
                </label>
                <input
                  type="text"
                  required
                  value={sellerName}
                  onChange={(e) => setSellerName(e.target.value)}
                  placeholder="Contoh: TautSmart Indonesia"
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Teks Footer Halaman Profil Publik
                </label>
                <input
                  type="text"
                  required
                  value={footerText}
                  onChange={(e) => setFooterText(e.target.value)}
                  placeholder="Contoh: Dibuat oleh TautSmart"
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Teks ini akan muncul di bagian footer setiap kartu bisnis publik pelanggan.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Domain Dasar (Target QR Code)
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-800 bg-[#070A10]">
                  <span className="px-3.5 py-2.5 bg-[#0B0F19] text-[#D4AF37] flex items-center border-r border-slate-800">
                    <Globe className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={baseDomain}
                    onChange={(e) => setBaseDomain(e.target.value)}
                    placeholder="https://tautsmart.com"
                    className="flex-1 px-3.5 py-2.5 bg-transparent text-white focus:outline-none"
                  />
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  Domain yang disematkan ke dalam QR Code fisik (misal: <code>https://tautsmart.com</code>).
                </p>
              </div>
            </div>
          </div>

          {/* Card: Keamanan & Password */}
          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800 shadow-xl space-y-4">
            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800/80">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Ganti Kata Sandi Admin</span>
            </h2>

            <div className="space-y-3.5 text-xs">
              <div className="p-3.5 bg-[#070A10] rounded-2xl border border-slate-800 text-slate-400">
                Email admin aktif: <span className="text-white font-bold">{adminEmail}</span>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Kata Sandi Saat Ini (Wajib diisi jika ingin mengganti sandi)
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Konfirmasi Kata Sandi Baru
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi baru"
                    className="w-full px-3.5 py-2.5 bg-[#070A10] border border-slate-800 rounded-xl text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 btn-gold text-black font-extrabold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all active:scale-95"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-black" />
                  <span>Simpan Semua Pengaturan</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
