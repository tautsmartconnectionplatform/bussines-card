"use client";

import React, { useState } from "react";
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Globe,
  Share2,
  Download,
  ExternalLink,
  Check,
  Copy,
  Building2,
  Briefcase,
  User,
} from "lucide-react";
import {
  WhatsAppIcon,
  InstagramIcon,
  FacebookIcon,
  TikTokIcon,
  LinkedInIcon,
} from "@/components/ui/BrandIcons";

export interface PublicCustomerData {
  slug: string;
  businessName: string;
  ownerName?: string | null;
  jobTitle?: string | null;
  tagline?: string | null;
  logoPath?: string | null;
  coverPath?: string | null;
  phone?: string | null;
  email?: string | null;
  address: string;
  city?: string | null;
  mapsUrl?: string | null;
  website?: string | null;
  whatsapp: string;
  whatsappMessage?: string | null;
  facebookUrl?: string | null;
  instagramUsername?: string | null;
  tiktokUsername?: string | null;
  linkedinUrl?: string | null;
  accentColor?: string;
}

interface PublicCardViewProps {
  customer: PublicCustomerData;
  footerText?: string;
}

export default function PublicCardView({ customer, footerText }: PublicCardViewProps) {
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [shared, setShared] = useState(false);

  const accent = customer.accentColor || "#2563EB";
  const primaryPhone = customer.phone || customer.whatsapp;
  const displayName = customer.ownerName || customer.businessName;

  // Track link click asynchronously
  const trackClick = async (linkType: string) => {
    try {
      if (navigator.sendBeacon) {
        navigator.sendBeacon(
          "/api/track/click",
          JSON.stringify({ slug: customer.slug, linkType })
        );
      } else {
        fetch("/api/track/click", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slug: customer.slug, linkType }),
          keepalive: true,
        }).catch(() => {});
      }
    } catch {
      // Non-blocking error
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleShare = async () => {
    trackClick("share");
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} | ${customer.businessName}`,
          text: customer.tagline || `Kartu Bisnis Digital ${displayName}`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback
      }
    }

    copyToClipboard(window.location.href, "share");
    setShared(true);
    setTimeout(() => setShared(false), 2000);
  };

  // WhatsApp link preparation
  const waMessage = customer.whatsappMessage
    ? encodeURIComponent(customer.whatsappMessage)
    : "";
  const waUrl = `https://wa.me/${customer.whatsapp}${waMessage ? `?text=${waMessage}` : ""}`;

  // Maps URL fallback
  const mapsLink =
    customer.mapsUrl ||
    `https://maps.google.com/?q=${encodeURIComponent(
      customer.city ? `${customer.address}, ${customer.city}` : customer.address
    )}`;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-between p-4 sm:p-6 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Background ambient gradient with purpose (identity focus accent) */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 opacity-20 blur-3xl pointer-events-none -z-10 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${accent} 0%, transparent 70%)`,
        }}
      />

      {/* Main Container */}
      <main className="w-full max-w-md mx-auto my-auto flex flex-col items-center space-y-4">
        {/* Floating Share Button */}
        <div className="w-full flex justify-end">
          <button
            onClick={handleShare}
            aria-label="Bagikan profil"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-300 bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 rounded-full backdrop-blur-md transition-all active:scale-95 shadow-sm focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
          >
            {shared || copiedField === "share" ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-semibold">Tautan Tersalin</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5" />
                <span>Bagikan</span>
              </>
            )}
          </button>
        </div>

        {/* SECTION 1: PROFIL WITH COVER BANNER */}
        <section
          aria-label="Profil Bisnis"
          className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-xl shadow-xl overflow-hidden"
        >
          {/* Cover Photo / Sampul Banner */}
          <div className="w-full h-32 sm:h-40 relative bg-slate-800 overflow-hidden">
            {customer.coverPath ? (
              <img
                src={customer.coverPath}
                alt="Foto Sampul"
                className="w-full h-full object-cover"
              />
            ) : (
              <div
                className="w-full h-full relative"
                style={{
                  background: `linear-gradient(135deg, ${accent}ee 0%, #0f172a 100%)`,
                }}
              >
                <div className="absolute inset-0 bg-black/20" />
              </div>
            )}
          </div>

          <div className="p-6 -mt-14 relative z-10 flex flex-col items-center text-center">
            {/* Logo / Foto Profil (Overlapping Cover) */}
            {customer.logoPath ? (
              <div className="relative mb-3.5">
                <img
                  src={customer.logoPath}
                  alt={displayName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover shadow-2xl border-4 border-slate-900 bg-slate-950"
                />
              </div>
            ) : (
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-white text-3xl font-extrabold mb-3.5 shadow-2xl border-4 border-slate-900"
                style={{ backgroundColor: accent }}
              >
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}

            {/* 1.1. Nama */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {displayName}
            </h1>

            {/* 1.2. Jabatan / Pekerjaan */}
            {customer.jobTitle && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-semibold text-slate-300 mt-2">
                <Briefcase className="w-3.5 h-3.5 text-blue-400" />
                <span>{customer.jobTitle}</span>
              </div>
            )}

            {/* Perusahaan (Jika nama pemilik berbeda dengan nama bisnis) */}
            {customer.ownerName && customer.businessName && customer.ownerName !== customer.businessName && (
              <p className="text-sm font-medium text-slate-400 mt-1">
                {customer.businessName}
              </p>
            )}

            {/* Tagline */}
            {customer.tagline && (
              <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed max-w-xs">
                {customer.tagline}
              </p>
            )}

            {/* 1.3. Quick Action Buttons: Telpon, SMS, Email, Lokasi */}
            <div className="grid grid-cols-4 gap-2.5 w-full mt-6 pt-5 border-t border-slate-800/80">
              {/* Telpon */}
              {primaryPhone ? (
                <a
                  href={`tel:${primaryPhone}`}
                  onClick={() => trackClick("call")}
                  id="btn-quick-call"
                  title="Panggil Telpon"
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-slate-200 hover:text-white transition-all active:scale-95 group focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-xl bg-blue-500/15 text-blue-400 group-hover:bg-blue-500 group-hover:text-white flex items-center justify-center transition-colors mb-1">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold">Telpon</span>
                </a>
              ) : (
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950/40 border border-slate-800/50 text-slate-600 opacity-50">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-slate-600 flex items-center justify-center mb-1">
                    <Phone className="w-4 h-4" />
                  </div>
                  <span className="text-[11px]">Telpon</span>
                </div>
              )}

              {/* SMS */}
              {primaryPhone ? (
                <a
                  href={`sms:${primaryPhone}`}
                  onClick={() => trackClick("sms")}
                  id="btn-quick-sms"
                  title="Kirim SMS"
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-slate-200 hover:text-white transition-all active:scale-95 group focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white flex items-center justify-center transition-colors mb-1">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold">SMS</span>
                </a>
              ) : (
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950/40 border border-slate-800/50 text-slate-600 opacity-50">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-slate-600 flex items-center justify-center mb-1">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <span className="text-[11px]">SMS</span>
                </div>
              )}

              {/* Email */}
              {customer.email ? (
                <a
                  href={`mailto:${customer.email}`}
                  onClick={() => trackClick("email")}
                  id="btn-quick-email"
                  title="Kirim Email"
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-slate-200 hover:text-white transition-all active:scale-95 group focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 group-hover:bg-amber-500 group-hover:text-white flex items-center justify-center transition-colors mb-1">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold">Email</span>
                </a>
              ) : (
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950/40 border border-slate-800/50 text-slate-600 opacity-50">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-slate-600 flex items-center justify-center mb-1">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-[11px]">Email</span>
                </div>
              )}

              {/* Lokasi */}
              {customer.address || customer.city ? (
                <a
                  href="#section-lokasi"
                  id="btn-quick-lokasi"
                  title="Lihat Lokasi"
                  className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-700/90 border border-slate-700 text-slate-200 hover:text-white transition-all active:scale-95 group focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 group-hover:bg-purple-500 group-hover:text-white flex items-center justify-center transition-colors mb-1">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[11px] font-semibold">Lokasi</span>
                </a>
              ) : (
                <div className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-950/40 border border-slate-800/50 text-slate-600 opacity-50">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 text-slate-600 flex items-center justify-center mb-1">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <span className="text-[11px]">Lokasi</span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* SECTION 2: KONTAK */}
        <section
          aria-label="Detail Kontak"
          className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <User className="w-4 h-4 text-blue-400" />
              <span>Kontak</span>
            </h2>
            <span className="text-[10px] text-slate-400 font-medium">Informasi Resmi</span>
          </div>

          <div className="space-y-3">
            {/* 2.1. Nama */}
            <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block font-medium">Nama</span>
                  <span className="text-xs font-semibold text-white">{displayName}</span>
                </div>
              </div>
            </div>

            {/* 2.2. No Telpon */}
            {primaryPhone && (
              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">Nomor Telpon</span>
                    <a
                      href={`tel:${primaryPhone}`}
                      onClick={() => trackClick("call")}
                      className="text-xs font-semibold text-white hover:text-blue-400 transition-colors truncate block"
                    >
                      +{primaryPhone}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(`+${primaryPhone}`, "phone")}
                  title="Salin Nomor Telpon"
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                >
                  {copiedField === "phone" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* 2.3. Email */}
            {customer.email && (
              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 block font-medium">Email</span>
                    <a
                      href={`mailto:${customer.email}`}
                      onClick={() => trackClick("email")}
                      className="text-xs font-semibold text-white hover:text-blue-400 transition-colors truncate block"
                    >
                      {customer.email}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(customer.email || "", "email")}
                  title="Salin Email"
                  className="p-2 text-slate-400 hover:text-white rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 transition-colors"
                >
                  {copiedField === "email" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            )}

            {/* 2.4. Perusahaan */}
            {customer.businessName && (
              <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Perusahaan</span>
                    <span className="text-xs font-semibold text-white">{customer.businessName}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Save Contact vCard CTA */}
            <div className="pt-2">
              <a
                href={`/c/${customer.slug}/vcard`}
                onClick={() => trackClick("vcard")}
                id="btn-save-contact"
                className="w-full min-h-[48px] py-3.5 px-5 rounded-2xl font-bold text-white flex items-center justify-between shadow-lg transition-all duration-200 hover:brightness-110 active:scale-[0.98] group focus-visible:ring-2 focus-visible:ring-emerald-500 focus:outline-none"
                style={{ backgroundColor: accent }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center">
                    <Download className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm">Simpan Kontak ke HP (.vcf)</span>
                </div>
                <Download className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          </div>
        </section>

        {/* SECTION 3: LOKASI */}
        {(customer.address || customer.city) && (
          <section
            id="section-lokasi"
            aria-label="Lokasi Bisnis"
            className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <MapPin className="w-4 h-4 text-purple-400" />
                <span>Lokasi</span>
              </h2>
              {customer.city && (
                <span className="text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                  {customer.city}
                </span>
              )}
            </div>

            <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800/80 text-xs text-slate-300 leading-relaxed">
              <p className="font-medium text-slate-200">{customer.address}</p>
              {customer.city && customer.address !== customer.city && (
                <p className="text-[11px] text-slate-400 mt-1">{customer.city}</p>
              )}
            </div>

            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick("maps")}
              id="btn-show-on-map"
              className="w-full min-h-[44px] py-3 px-5 rounded-2xl font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 flex items-center justify-between transition-all duration-200 active:scale-[0.98] group focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
            >
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center">
                  <MapPin className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-bold">Show on Map (Buka di Peta)</span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
            </a>
          </section>
        )}

        {/* SECTION 4: WEBSITE */}
        {customer.website && (
          <section
            aria-label="Website Resmi"
            className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-3"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Globe className="w-4 h-4 text-blue-400" />
                <span>Website</span>
              </h2>
            </div>

            <a
              href={customer.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick("website")}
              id="btn-website"
              className="w-full min-h-[44px] py-3.5 px-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-200 flex items-center justify-between transition-all duration-200 active:scale-[0.98] group focus-visible:ring-2 focus-visible:ring-blue-500 focus:outline-none"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 block font-medium">Situs Resmi</span>
                  <span className="text-xs font-bold text-white group-hover:text-blue-400 transition-colors truncate block">
                    {customer.website.replace(/^https?:\/\//, "").replace(/\/$/, "")}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          </section>
        )}

        {/* SECTION 5: MEDIA SOSIAL & CHAT */}
        <section
          aria-label="Media Sosial dan Chat"
          className="w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Share2 className="w-4 h-4 text-emerald-400" />
              <span>Media Sosial & Chat</span>
            </h2>
          </div>

          <div className="space-y-2.5">
            {/* 5.3. WhatsApp */}
            {customer.whatsapp && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("whatsapp")}
                id="btn-whatsapp-chat"
                className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-100 flex items-center justify-between transition-all duration-200 active:scale-[0.98] group focus-visible:ring-2 focus-visible:ring-emerald-500 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#25D366]/15 text-[#25D366] flex items-center justify-center shrink-0">
                    <WhatsAppIcon size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">WhatsApp</span>
                    <span className="text-[10px] text-slate-400">+{customer.whatsapp}</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            )}

            {/* 5.2. Instagram */}
            {customer.instagramUsername && (
              <a
                href={`https://instagram.com/${customer.instagramUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("instagram")}
                id="btn-instagram"
                className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-100 flex items-center justify-between transition-all duration-200 active:scale-[0.98] group focus-visible:ring-2 focus-visible:ring-pink-500 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#F58529]/20 via-[#DD2A7B]/20 to-[#8134AF]/20 text-[#E1306C] flex items-center justify-center shrink-0">
                    <InstagramIcon size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Instagram</span>
                    <span className="text-[10px] text-slate-400">@{customer.instagramUsername}</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            )}

            {/* 5.1. Facebook */}
            {customer.facebookUrl && (
              <a
                href={customer.facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("facebook")}
                id="btn-facebook"
                className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-100 flex items-center justify-between transition-all duration-200 active:scale-[0.98] group focus-visible:ring-2 focus-visible:ring-blue-600 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#1877F2]/15 text-[#1877F2] flex items-center justify-center shrink-0">
                    <FacebookIcon size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">Facebook</span>
                    <span className="text-[10px] text-slate-400">Halaman / Profil</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            )}

            {/* 5.4. TikTok */}
            {customer.tiktokUsername && (
              <a
                href={`https://tiktok.com/@${customer.tiktokUsername}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("tiktok")}
                id="btn-tiktok"
                className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-100 flex items-center justify-between transition-all duration-200 active:scale-[0.98] group focus-visible:ring-2 focus-visible:ring-cyan-500 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center shrink-0">
                    <TikTokIcon size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">TikTok</span>
                    <span className="text-[10px] text-slate-400">@{customer.tiktokUsername}</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            )}

            {/* 5.5. LinkedIn / dll */}
            {customer.linkedinUrl && (
              <a
                href={customer.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("linkedin")}
                id="btn-linkedin"
                className="w-full min-h-[44px] py-3 px-4 rounded-2xl bg-slate-950/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-100 flex items-center justify-between transition-all duration-200 active:scale-[0.98] group focus-visible:ring-2 focus-visible:ring-sky-500 focus:outline-none"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-[#0A66C2]/15 text-[#0A66C2] flex items-center justify-center shrink-0">
                    <LinkedInIcon size={20} />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">LinkedIn</span>
                    <span className="text-[10px] text-slate-400">Profil Profesional</span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 opacity-70 group-hover:opacity-100 transition-opacity" />
              </a>
            )}
          </div>
        </section>
      </main>

      {/* Footer Branding */}
      <footer className="w-full max-w-md text-center py-6 text-xs text-slate-500">
        <p>{footerText || "Dibuat dengan TautSmart"}</p>
      </footer>
    </div>
  );
}
