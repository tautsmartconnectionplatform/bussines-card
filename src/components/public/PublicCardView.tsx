"use client";

import React, { useState, useEffect } from "react";
import QRCode from "qrcode";
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
  QrCode as QrIcon,
  X,
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

function TautRibbonLogo({ className = "" }: { className?: string }) {
  return (
    <svg
      width="34"
      height="30"
      viewBox="0 0 38 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 drop-shadow ${className}`}
    >
      <defs>
        <linearGradient id="tautRibbonGold" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="35%" stopColor="#EAD8B1" />
          <stop offset="70%" stopColor="#C9A364" />
          <stop offset="100%" stopColor="#9E763B" />
        </linearGradient>
      </defs>
      <path
        d="M4 6.5C4 5.1 5.2 4 6.8 4H32.2C33.8 4 35 5.1 35 6.5C32.5 7.8 28 8.2 23.5 8.7C22.2 11.5 21 16 18.5 24C17.7 26.5 15.6 28 13.2 28C11.5 28 10.8 26.8 11.3 25.2C13 19.5 15.2 13 17.5 8.9C11.2 8.7 6.2 7.8 4 6.5Z"
        fill="url(#tautRibbonGold)"
      />
    </svg>
  );
}

export default function PublicCardView({ customer, footerText }: PublicCardViewProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const primaryPhone = customer.phone || customer.whatsapp;
  const displayName = customer.ownerName || customer.businessName;

  // Set body background to warm light tone on mount
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    const originalColor = document.body.style.color;
    document.body.style.backgroundColor = "#F6F4EE";
    document.body.style.color = "#1E293B";

    return () => {
      document.body.style.backgroundColor = originalBg;
      document.body.style.color = originalColor;
    };
  }, []);

  // Show temporary toast notification
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2400);
  };

  // Generate QR Code data URL on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const currentUrl = window.location.href;
      QRCode.toDataURL(currentUrl, {
        width: 320,
        margin: 2,
        color: {
          dark: "#0B1528",
          light: "#FFFFFF",
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch(() => {});
    }
  }, [customer.slug]);

  // Handle escape key to close QR modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && qrModalOpen) {
        setQrModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [qrModalOpen]);

  // Track link clicks asynchronously
  const trackClick = async (linkType: string) => {
    try {
      if (typeof navigator !== "undefined" && navigator.sendBeacon) {
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
      // Non-blocking track error
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} berhasil disalin`);
    }
  };

  const handleShare = async () => {
    trackClick("share");
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: `${displayName} | ${customer.businessName}`,
          text: customer.tagline || `Kartu Bisnis Digital ${displayName}`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback if cancelled
      }
    }

    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      showToast("Tautan profil berhasil disalin");
    }
  };

  const handleVcardDownload = () => {
    trackClick("vcard");
    showToast("Mengunduh kontak vCard...");
  };

  // WhatsApp URL formulation
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

  // Formatted display website
  const displayWebsite = customer.website
    ? customer.website.replace(/^https?:\/\//, "").replace(/\/$/, "")
    : "www.tautsmart.com";

  // Clean social handles
  const cleanIg = customer.instagramUsername
    ? customer.instagramUsername.replace(/^@/, "")
    : null;
  const cleanTiktok = customer.tiktokUsername
    ? customer.tiktokUsername.replace(/^@/, "")
    : null;

  return (
    <div className="min-h-screen bg-[#F6F4EE] text-slate-800 selection:bg-[#EBDDC3] selection:text-slate-900 relative overflow-x-hidden font-sans">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0B1528] border border-white/10 text-white text-xs font-semibold shadow-2xl backdrop-blur-md animate-bounce"
        >
          <Check className="w-4 h-4 text-[#EAD8B1]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Container */}
      <main className="w-full max-w-[420px] mx-auto px-4 py-5 sm:py-7 flex flex-col space-y-4">
        {/* Top Header Actions (Bagikan + QR Code) */}
        <div className="w-full flex items-center justify-end gap-2 pr-0.5">
          <button
            onClick={() => {
              trackClick("view_qr");
              setQrModalOpen(true);
            }}
            aria-label="Tampilkan QR Code"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-[#FAF9F5] border border-[#E5E0D6] rounded-full shadow-sm transition-all active:scale-95"
          >
            <QrIcon className="w-3.5 h-3.5 text-slate-600" />
            <span>QR</span>
          </button>

          <button
            onClick={handleShare}
            aria-label="Bagikan profil"
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-[#FAF9F5] border border-[#E5E0D6] rounded-full shadow-sm transition-all active:scale-95"
          >
            <Share2 className="w-3.5 h-3.5 text-slate-600" />
            <span>Bagikan</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* CARD 1: PROFILE & QUICK ACTIONS */}
        {/* ============================================================ */}
        <section
          aria-label="Profil Bisnis"
          className="w-full bg-white rounded-[26px] border border-[#ECE7DE] shadow-[0_2px_12px_rgba(0,0,0,0.025)] overflow-hidden flex flex-col items-center text-center"
        >
          {/* Top Navy Banner */}
          <div className="w-full h-28 sm:h-32 bg-[#0B1528] relative flex items-center justify-center overflow-hidden">
            {customer.coverPath ? (
              <img
                src={customer.coverPath}
                alt={`Sampul ${displayName}`}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center gap-2.5 pb-5">
                <TautRibbonLogo />
                <span className="text-white font-extrabold text-2xl tracking-widest font-sans">
                  TAUT
                </span>
              </div>
            )}
          </div>

          {/* Squircle Avatar / Logo (Overlapping Banner) */}
          <div className="relative -mt-11 sm:-mt-12 mb-3 z-10">
            <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-[22px] bg-[#0B1528] border-[3px] border-white shadow-md flex flex-col items-center justify-center overflow-hidden p-1.5">
              {customer.logoPath ? (
                <img
                  src={customer.logoPath}
                  alt={displayName}
                  className="w-full h-full object-contain rounded-xl"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <TautRibbonLogo className="scale-75" />
                  <span className="text-white text-[9px] font-extrabold tracking-widest -mt-1">
                    TAUT
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Profile Name */}
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight px-4">
            {displayName}
          </h1>

          {/* Job Title / Role Badge */}
          {customer.jobTitle && (
            <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FAF6EE] border border-[#EBDDC3] text-[#8C6D3F] text-xs font-medium mt-2 shadow-sm">
              <span className="text-xs">💼</span>
              <span>{customer.jobTitle}</span>
            </div>
          )}

          {/* Company Name */}
          {customer.businessName && (
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mt-2 px-4">
              {customer.businessName}
            </p>
          )}

          {/* Bio / Tagline */}
          {customer.tagline && (
            <p className="text-xs text-slate-400 mt-1 max-w-xs px-4 font-normal">
              {customer.tagline}
            </p>
          )}

          {/* 4 Quick Action Buttons */}
          <div className="grid grid-cols-4 gap-2 w-full px-4 pt-5 pb-5 mt-4 border-t border-[#F0ECE3]">
            {/* Telpon */}
            <a
              href={primaryPhone ? `tel:${primaryPhone}` : "#"}
              onClick={() => trackClick("call")}
              title="Panggil Telpon"
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-[#F9F8F5] hover:bg-[#F2EFE8] border border-[#ECE7DE] text-slate-700 transition-all active:scale-95 group"
            >
              <Phone className="w-4 h-4 text-slate-700 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium text-slate-700">Telpon</span>
            </a>

            {/* SMS */}
            <a
              href={primaryPhone ? `sms:${primaryPhone}` : "#"}
              onClick={() => trackClick("sms")}
              title="Kirim SMS"
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-[#F9F8F5] hover:bg-[#F2EFE8] border border-[#ECE7DE] text-slate-700 transition-all active:scale-95 group"
            >
              <MessageSquare className="w-4 h-4 text-slate-700 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium text-slate-700">SMS</span>
            </a>

            {/* Email */}
            <a
              href={customer.email ? `mailto:${customer.email}` : "#"}
              onClick={() => trackClick("email")}
              title="Kirim Email"
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-[#F9F8F5] hover:bg-[#F2EFE8] border border-[#ECE7DE] text-slate-700 transition-all active:scale-95 group"
            >
              <Mail className="w-4 h-4 text-slate-700 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium text-slate-700">Email</span>
            </a>

            {/* Lokasi */}
            <a
              href="#section-lokasi"
              title="Lihat Lokasi"
              className="flex flex-col items-center justify-center py-2.5 px-1 rounded-2xl bg-[#F9F8F5] hover:bg-[#F2EFE8] border border-[#ECE7DE] text-slate-700 transition-all active:scale-95 group"
            >
              <MapPin className="w-4 h-4 text-slate-700 mb-1.5 group-hover:scale-110 transition-transform" />
              <span className="text-[11px] font-medium text-slate-700">Lokasi</span>
            </a>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CARD 2: KONTAK */}
        {/* ============================================================ */}
        <section
          aria-label="Detail Kontak Resmi"
          className="w-full bg-white rounded-[26px] border border-[#ECE7DE] shadow-[0_2px_12px_rgba(0,0,0,0.025)] p-4 sm:p-5 space-y-3"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-1">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
                KONTAK
              </h2>
            </div>
            <span className="text-[11px] font-medium text-[#9E8357]">
              Informasi Resmi
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Nama */}
            <div className="p-3 rounded-2xl bg-[#F9F8F5] border border-[#ECE7DE] flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-slate-600 shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-medium block leading-tight">
                    Nama
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">
                    {displayName}
                  </span>
                </div>
              </div>
            </div>

            {/* Nomor Telpon */}
            {primaryPhone && (
              <div className="p-3 rounded-2xl bg-[#F9F8F5] border border-[#ECE7DE] flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-slate-600 shrink-0">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-medium block leading-tight">
                      Nomor Telpon
                    </span>
                    <a
                      href={`tel:${primaryPhone}`}
                      onClick={() => trackClick("call")}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                    >
                      +{primaryPhone}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(`+${primaryPhone}`, "Nomor telepon")}
                  aria-label="Salin nomor telepon"
                  title="Salin nomor telepon"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-[#EAE5DC] transition active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Email */}
            {customer.email && (
              <div className="p-3 rounded-2xl bg-[#F9F8F5] border border-[#ECE7DE] flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-slate-600 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-medium block leading-tight">
                      Email
                    </span>
                    <a
                      href={`mailto:${customer.email}`}
                      onClick={() => trackClick("email")}
                      className="text-xs sm:text-sm font-bold text-slate-900 hover:text-blue-600 transition-colors truncate block"
                    >
                      {customer.email}
                    </a>
                  </div>
                </div>
                <button
                  onClick={() => copyToClipboard(customer.email || "", "Email")}
                  aria-label="Salin email"
                  title="Salin email"
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white border border-transparent hover:border-[#EAE5DC] transition active:scale-95"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Perusahaan */}
            {customer.businessName && (
              <div className="p-3 rounded-2xl bg-[#F9F8F5] border border-[#ECE7DE] flex items-center justify-between">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-slate-600 shrink-0">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[10px] text-slate-400 font-medium block leading-tight">
                      Perusahaan
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">
                      {customer.businessName}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Simpan Kontak ke HP Button */}
          <a
            href={`/c/${customer.slug}/vcard`}
            onClick={handleVcardDownload}
            id="btn-save-contact"
            className="w-full py-3.5 px-4 rounded-xl bg-[#0B1528] hover:bg-[#162238] active:scale-[0.98] text-white flex items-center justify-between shadow-md transition font-semibold text-xs sm:text-sm mt-1"
          >
            <Download className="w-4 h-4 text-white/90" />
            <span>Simpan Kontak ke HP (.vcf)</span>
            <Download className="w-4 h-4 text-white/90" />
          </a>
        </section>

        {/* ============================================================ */}
        {/* CARD 3: LOKASI */}
        {/* ============================================================ */}
        {(customer.address || customer.city) && (
          <section
            id="section-lokasi"
            aria-label="Lokasi Bisnis"
            className="w-full bg-white rounded-[26px] border border-[#ECE7DE] shadow-[0_2px_12px_rgba(0,0,0,0.025)] p-4 sm:p-5 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-slate-700" />
                <h2 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
                  LOKASI
                </h2>
              </div>
              {customer.city && (
                <span className="text-[11px] font-medium text-[#9E8357] bg-[#FDF6ED] border border-[#F2E2CE] px-2.5 py-0.5 rounded-full">
                  {customer.city}
                </span>
              )}
            </div>

            {/* Address Box */}
            <div className="p-3.5 rounded-2xl bg-[#F9F8F5] border border-[#ECE7DE] text-xs text-slate-700 leading-relaxed">
              <p className="font-normal">{customer.address}</p>
              {customer.city && customer.address !== customer.city && (
                <p className="text-[11px] text-slate-400 font-medium mt-1">
                  {customer.city}
                </p>
              )}
            </div>

            {/* Show on Map Button */}
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick("maps")}
              id="btn-show-on-map"
              className="w-full p-3 rounded-2xl bg-[#F9F8F5] hover:bg-[#F2EFE8] border border-[#ECE7DE] flex items-center justify-between text-slate-800 transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#EFE8DD] text-[#8C6D3F] flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-slate-800">
                  Show on Map (Buka di Peta)
                </span>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </a>
          </section>
        )}

        {/* ============================================================ */}
        {/* CARD 4: WEBSITE */}
        {/* ============================================================ */}
        {customer.website && (
          <section
            aria-label="Website Resmi"
            className="w-full bg-white rounded-[26px] border border-[#ECE7DE] shadow-[0_2px_12px_rgba(0,0,0,0.025)] p-4 sm:p-5 space-y-3"
          >
            {/* Header */}
            <div className="flex items-center gap-2 pb-1">
              <Globe className="w-4 h-4 text-slate-700" />
              <h2 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
                WEBSITE
              </h2>
            </div>

            {/* Website Row */}
            <a
              href={customer.website}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick("website")}
              id="btn-website"
              className="w-full p-3 rounded-2xl bg-[#F9F8F5] hover:bg-[#F2EFE8] border border-[#ECE7DE] flex items-center justify-between transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-slate-600 shrink-0">
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-medium block leading-tight">
                    Situs Resmi
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-slate-900 truncate block">
                    {displayWebsite}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </a>
          </section>
        )}

        {/* ============================================================ */}
        {/* CARD 5: MEDIA SOSIAL & CHAT */}
        {/* ============================================================ */}
        <section
          aria-label="Media Sosial dan Chat"
          className="w-full bg-white rounded-[26px] border border-[#ECE7DE] shadow-[0_2px_12px_rgba(0,0,0,0.025)] p-4 sm:p-5 space-y-2.5"
        >
          {/* Header */}
          <div className="flex items-center gap-2 pb-1">
            <Share2 className="w-4 h-4 text-slate-700" />
            <h2 className="text-xs font-bold text-slate-900 tracking-wider uppercase">
              MEDIA SOSIAL & CHAT
            </h2>
          </div>

          <div className="space-y-2">
            {/* WhatsApp */}
            {customer.whatsapp && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("whatsapp")}
                id="btn-whatsapp-chat"
                className="w-full p-3 rounded-2xl bg-[#F9F8F5] hover:bg-[#F2EFE8] border border-[#ECE7DE] flex items-center justify-between transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#25D366] shrink-0">
                    <WhatsAppIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      WhatsApp
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      +{customer.whatsapp}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </a>
            )}

            {/* Instagram */}
            {customer.instagramUsername && (
              <a
                href={`https://instagram.com/${cleanIg}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("instagram")}
                id="btn-instagram"
                className="w-full p-3 rounded-2xl bg-[#F9F8F5] hover:bg-[#F2EFE8] border border-[#ECE7DE] flex items-center justify-between transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#E1306C] shrink-0">
                    <InstagramIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      Instagram
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      @{cleanIg}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </a>
            )}

            {/* Facebook */}
            {customer.facebookUrl && (
              <a
                href={
                  customer.facebookUrl.startsWith("http")
                    ? customer.facebookUrl
                    : `https://${customer.facebookUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("facebook")}
                id="btn-facebook"
                className="w-full p-3 rounded-2xl bg-[#F9F8F5] hover:bg-[#F2EFE8] border border-[#ECE7DE] flex items-center justify-between transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#1877F2] shrink-0">
                    <FacebookIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      Facebook
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      Halaman / Profil
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </a>
            )}

            {/* TikTok */}
            {customer.tiktokUsername && (
              <a
                href={`https://tiktok.com/@${cleanTiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("tiktok")}
                id="btn-tiktok"
                className="w-full p-3 rounded-2xl bg-[#F9F8F5] hover:bg-[#F2EFE8] border border-[#ECE7DE] flex items-center justify-between transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-slate-900 shrink-0">
                    <TikTokIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      TikTok
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      @{cleanTiktok}
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </a>
            )}

            {/* LinkedIn */}
            {customer.linkedinUrl && (
              <a
                href={
                  customer.linkedinUrl.startsWith("http")
                    ? customer.linkedinUrl
                    : `https://${customer.linkedinUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("linkedin")}
                id="btn-linkedin"
                className="w-full p-3 rounded-2xl bg-[#F9F8F5] hover:bg-[#F2EFE8] border border-[#ECE7DE] flex items-center justify-between transition-all active:scale-[0.98]"
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#EAE5DC] flex items-center justify-center text-[#0A66C2] shrink-0">
                    <LinkedInIcon size={18} />
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                      LinkedIn
                    </span>
                    <span className="text-[11px] text-slate-500 block truncate">
                      Profil Profesional
                    </span>
                  </div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </a>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="w-full flex items-center justify-center gap-3 pt-4 pb-8">
          <div className="h-[1px] w-8 bg-stone-300" />
          <span className="text-[11px] text-stone-400 font-normal">
            Dibuat oleh {footerText || "TautSmart"}
          </span>
          <div className="h-[1px] w-8 bg-stone-300" />
        </footer>
      </main>

      {/* QR Code Modal Dialog */}
      {qrModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="qr-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
          onClick={() => setQrModalOpen(false)}
        >
          <div
            className="w-full max-w-sm bg-white border border-[#ECE7DE] rounded-3xl p-6 shadow-2xl relative text-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              onClick={() => setQrModalOpen(false)}
              aria-label="Tutup modal QR"
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-800 rounded-full bg-[#F9F8F5] hover:bg-stone-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-10 h-10 rounded-2xl bg-[#FAF6EE] text-[#8C6D3F] border border-[#EBDDC3] flex items-center justify-center mx-auto mb-3">
              <QrIcon className="w-5 h-5" />
            </div>

            <h3 id="qr-modal-title" className="text-lg font-bold text-slate-900">
              Pindai Kartu Bisnis
            </h3>
            <p className="text-xs text-slate-500 mt-1 mb-5">
              Arahkan kamera smartphone ke kode QR di bawah untuk membuka profil ini seketika.
            </p>

            {/* QR Code Container */}
            <div className="p-4 bg-white rounded-2xl inline-block shadow-sm border border-[#ECE7DE] mb-5">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code ${displayName}`}
                  className="w-56 h-56 mx-auto object-contain"
                />
              ) : (
                <div className="w-56 h-56 flex items-center justify-center text-slate-400 text-xs">
                  Membuat kode QR...
                </div>
              )}
            </div>

            <div className="space-y-2">
              <button
                onClick={() => {
                  if (typeof window !== "undefined") {
                    navigator.clipboard.writeText(window.location.href);
                    showToast("Tautan profil berhasil disalin");
                  }
                }}
                className="w-full py-2.5 px-4 bg-[#0B1528] hover:bg-[#162238] text-xs font-semibold text-white rounded-xl transition-all flex items-center justify-center gap-2 active:scale-95 shadow-sm"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Salin Tautan Profil</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
