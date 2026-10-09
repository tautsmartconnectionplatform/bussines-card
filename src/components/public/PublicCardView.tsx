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

export default function PublicCardView({ customer, footerText }: PublicCardViewProps) {
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const primaryPhone = customer.phone || customer.whatsapp;
  const displayName = customer.ownerName || customer.businessName;

  const cardBg = customer.accentColor || "#FFFFFF";
  const isDark = isDarkColor(cardBg);

  // Set body background to match accent color dynamically
  useEffect(() => {
    const originalBg = document.body.style.backgroundColor;
    const originalColor = document.body.style.color;
    document.body.style.backgroundColor = cardBg;
    document.body.style.color = isDark ? "#FFFFFF" : "#1E293B";

    return () => {
      document.body.style.backgroundColor = originalBg;
      document.body.style.color = originalColor;
    };
  }, [cardBg, isDark]);

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

  const handleMapsClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    e.stopPropagation();
    trackClick("maps");

    const targetUrl =
      mapsLink && !mapsLink.startsWith("#")
        ? mapsLink
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            [customer.address, customer.city].filter(Boolean).join(", ") || "Google Maps"
          )}`;

    if (typeof window !== "undefined") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
    }
  };

  // WhatsApp URL formulation
  const waMessage = customer.whatsappMessage
    ? encodeURIComponent(customer.whatsappMessage)
    : "";
  const waUrl = `https://wa.me/${customer.whatsapp}${waMessage ? `?text=${waMessage}` : ""}`;

  // Google Maps URL (langsung mengarah ke Google Maps eksternal, bukan scroll internal)
  const rawMapsUrl = customer.mapsUrl?.trim();
  const isValidMapsUrl = Boolean(
    rawMapsUrl &&
    !rawMapsUrl.startsWith("#") &&
    !rawMapsUrl.includes("section-lokasi")
  );

  const mapsLocationQuery = [
    customer.address?.trim(),
    customer.city?.trim() && customer.city.trim() !== customer.address.trim() ? customer.city.trim() : null,
  ].filter(Boolean).join(", ");

  const mapsLink = isValidMapsUrl
    ? rawMapsUrl!.startsWith("http://") || rawMapsUrl!.startsWith("https://")
      ? rawMapsUrl!
      : `https://${rawMapsUrl}`
    : mapsLocationQuery
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsLocationQuery)}`
    : "https://maps.google.com";

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
    <div
      className="min-h-screen relative overflow-x-hidden font-sans transition-colors duration-200"
      style={{ backgroundColor: cardBg, color: isDark ? "#FFFFFF" : "#1E293B" }}
    >
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
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full shadow-xs transition-all active:scale-95 ${
              isDark
                ? "bg-white/15 hover:bg-white/25 border border-white/25 text-white"
                : "bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-slate-800"
            }`}
          >
            <QrIcon className="w-3.5 h-3.5" />
            <span>QR</span>
          </button>

          <button
            onClick={handleShare}
            aria-label="Bagikan profil"
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full shadow-xs transition-all active:scale-95 ${
              isDark
                ? "bg-white/15 hover:bg-white/25 border border-white/25 text-white"
                : "bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-slate-800"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Bagikan</span>
          </button>
        </div>

        {/* ============================================================ */}
        {/* CARD 1: PROFILE & QUICK ACTIONS */}
        {/* ============================================================ */}
        <section
          aria-label="Profil Bisnis"
          className={`w-full rounded-[26px] border ${
            isDark ? "border-white/20 shadow-lg" : "border-black/[0.08] shadow-xs"
          } overflow-hidden flex flex-col items-center text-center`}
          style={{ backgroundColor: cardBg }}
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
          <div className="relative -mt-11 sm:-mt-12 mb-3 z-10 shrink-0">
            <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-[22px] bg-[#0B1528] border-[3px] ${
              isDark ? "border-white/90" : "border-white"
            } shadow-md flex items-center justify-center overflow-hidden p-0.5 shrink-0 mx-auto`}>
              {customer.logoPath ? (
                <img
                  src={customer.logoPath}
                  alt={displayName}
                  className="w-full h-full object-cover rounded-[18px]"
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
          <h1 className={`text-xl sm:text-2xl font-bold tracking-tight px-4 ${
            isDark ? "text-white" : "text-slate-900"
          }`}>
            {displayName}
          </h1>

          {/* Job Title / Role Badge - Hapus simbol, hanya teks */}
          {customer.jobTitle && (
            <div className={`inline-flex items-center px-3.5 py-1 rounded-full text-xs font-semibold mt-2 shadow-xs ${
              isDark
                ? "bg-white/20 border border-white/30 text-white"
                : "bg-black/[0.05] border border-black/10 text-slate-800"
            }`}>
              <span>{customer.jobTitle}</span>
            </div>
          )}

          {/* Company Name */}
          {customer.businessName && (
            <p className={`text-xs font-semibold uppercase tracking-widest mt-2 px-4 ${
              isDark ? "text-white/80" : "text-slate-500"
            }`}>
              {customer.businessName}
            </p>
          )}

          {/* Bio / Tagline */}
          {customer.tagline && (
            <p className={`text-xs mt-1 max-w-xs px-4 font-normal ${
              isDark ? "text-white/70" : "text-slate-500"
            }`}>
              {customer.tagline}
            </p>
          )}

          {/* 4 Quick Action Buttons (Telpon, SMS, Email, Google Maps) */}
          <div className={`grid grid-cols-4 gap-2 sm:gap-2.5 w-full px-4 pt-4 pb-4 mt-4 border-t ${
            isDark ? "border-white/15" : "border-black/[0.06]"
          }`}>
            {/* Telpon */}
            <a
              href={primaryPhone ? `tel:${primaryPhone}` : "#"}
              onClick={() => trackClick("call")}
              title="Panggil Telpon"
              aria-label="Panggil Telpon"
              id="btn-quick-call"
              className={`flex items-center justify-center py-3 px-2 sm:px-3 rounded-2xl transition-all active:scale-95 group ${
                isDark
                  ? "bg-white/15 hover:bg-white/25 border border-white/20 text-white"
                  : "bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-slate-800"
              }`}
            >
              <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>

            {/* SMS */}
            <a
              href={primaryPhone ? `sms:${primaryPhone}` : "#"}
              onClick={() => trackClick("sms")}
              title="Kirim SMS"
              aria-label="Kirim SMS"
              id="btn-quick-sms"
              className={`flex items-center justify-center py-3 px-2 sm:px-3 rounded-2xl transition-all active:scale-95 group ${
                isDark
                  ? "bg-white/15 hover:bg-white/25 border border-white/20 text-white"
                  : "bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-slate-800"
              }`}
            >
              <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>

            {/* Email */}
            <a
              href={customer.email ? `mailto:${customer.email}` : "#"}
              onClick={() => trackClick("email")}
              title="Kirim Email"
              aria-label="Kirim Email"
              id="btn-quick-email"
              className={`flex items-center justify-center py-3 px-2 sm:px-3 rounded-2xl transition-all active:scale-95 group ${
                isDark
                  ? "bg-white/15 hover:bg-white/25 border border-white/20 text-white"
                  : "bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-slate-800"
              }`}
            >
              <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>

            {/* Google Maps */}
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleMapsClick}
              title="Buka Google Maps"
              aria-label="Buka Google Maps"
              id="btn-quick-maps"
              className={`flex items-center justify-center py-3 px-2 sm:px-3 rounded-2xl transition-all active:scale-95 group ${
                isDark
                  ? "bg-white/15 hover:bg-white/25 border border-white/20 text-white"
                  : "bg-black/[0.04] hover:bg-black/[0.08] border border-black/[0.08] text-slate-800"
              }`}
            >
              <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>
          </div>
        </section>

        {/* ============================================================ */}
        {/* CARD 2: KONTAK */}
        {/* ============================================================ */}
        <section
          aria-label="Detail Kontak"
          className={`w-full rounded-[26px] border ${
            isDark ? "border-white/20 shadow-lg" : "border-black/[0.08] shadow-xs"
          } p-4 sm:p-5 space-y-3`}
          style={{ backgroundColor: cardBg }}
        >
          {/* Header - Hapus teks 'Informasi Resmi' */}
          <div className="flex items-center justify-between pb-1">
            <h2 className={`text-xs font-bold tracking-wider uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
              KONTAK
            </h2>
          </div>

          <div className="space-y-2.5">
            {/* Nama - Hapus simbol ikon kiri */}
            <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
              isDark ? "bg-white/15 border-white/20" : "bg-black/[0.04] border-black/[0.08]"
            }`}>
              <div className="min-w-0">
                <span className={`text-[10px] font-medium block leading-tight ${
                  isDark ? "text-white/70" : "text-slate-400"
                }`}>
                  Nama
                </span>
                <span className={`text-xs sm:text-sm font-bold truncate block mt-0.5 ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  {displayName}
                </span>
              </div>
            </div>

            {/* Nomor Telpon - Hapus simbol ikon kiri */}
            {primaryPhone && (
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDark ? "bg-white/15 border-white/20" : "bg-black/[0.04] border-black/[0.08]"
              }`}>
                <div className="min-w-0 pr-2">
                  <span className={`text-[10px] font-medium block leading-tight ${
                    isDark ? "text-white/70" : "text-slate-400"
                  }`}>
                    Nomor Telpon
                  </span>
                  <a
                    href={`tel:${primaryPhone}`}
                    onClick={() => trackClick("call")}
                    className={`text-xs sm:text-sm font-bold transition-colors truncate block mt-0.5 ${
                      isDark ? "text-white hover:text-blue-200" : "text-slate-900 hover:text-blue-600"
                    }`}
                  >
                    +{primaryPhone}
                  </a>
                </div>
                <button
                  onClick={() => copyToClipboard(`+${primaryPhone}`, "Nomor telepon")}
                  aria-label="Salin nomor telepon"
                  title="Salin nomor telepon"
                  className={`p-2 rounded-xl transition active:scale-95 ${
                    isDark
                      ? "text-white/80 hover:text-white hover:bg-white/20"
                      : "text-slate-400 hover:text-slate-700 hover:bg-black/[0.05]"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Email - Hapus simbol ikon kiri */}
            {customer.email && (
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDark ? "bg-white/15 border-white/20" : "bg-black/[0.04] border-black/[0.08]"
              }`}>
                <div className="min-w-0 pr-2">
                  <span className={`text-[10px] font-medium block leading-tight ${
                    isDark ? "text-white/70" : "text-slate-400"
                  }`}>
                    Email
                  </span>
                  <a
                    href={`mailto:${customer.email}`}
                    onClick={() => trackClick("email")}
                    className={`text-xs sm:text-sm font-bold transition-colors truncate block mt-0.5 ${
                      isDark ? "text-white hover:text-blue-200" : "text-slate-900 hover:text-blue-600"
                    }`}
                  >
                    {customer.email}
                  </a>
                </div>
                <button
                  onClick={() => copyToClipboard(customer.email || "", "Email")}
                  aria-label="Salin email"
                  title="Salin email"
                  className={`p-2 rounded-xl transition active:scale-95 ${
                    isDark
                      ? "text-white/80 hover:text-white hover:bg-white/20"
                      : "text-slate-400 hover:text-slate-700 hover:bg-black/[0.05]"
                  }`}
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Perusahaan - Hapus simbol ikon kiri */}
            {customer.businessName && (
              <div className={`p-3.5 rounded-2xl border flex items-center justify-between ${
                isDark ? "bg-white/15 border-white/20" : "bg-black/[0.04] border-black/[0.08]"
              }`}>
                <div className="min-w-0">
                  <span className={`text-[10px] font-medium block leading-tight ${
                    isDark ? "text-white/70" : "text-slate-400"
                  }`}>
                    Perusahaan
                  </span>
                  <span className={`text-xs sm:text-sm font-bold truncate block mt-0.5 ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}>
                    {customer.businessName}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Simpan Kontak ke HP Button */}
          <a
            href={`/c/${customer.slug}/vcard`}
            onClick={handleVcardDownload}
            id="btn-save-contact"
            className={`w-full py-3.5 px-4 rounded-xl flex items-center justify-between shadow-md transition font-semibold text-xs sm:text-sm mt-1 active:scale-[0.98] ${
              isDark
                ? "bg-white text-slate-950 hover:bg-white/90"
                : "bg-[#0B1528] text-white hover:bg-[#162238]"
            }`}
          >
            <Download className={`w-4 h-4 ${isDark ? "text-slate-950" : "text-white/90"}`} />
            <span>Simpan Kontak ke HP (.vcf)</span>
            <Download className={`w-4 h-4 ${isDark ? "text-slate-950" : "text-white/90"}`} />
          </a>
        </section>

        {/* ============================================================ */}
        {/* CARD 3: LOKASI */}
        {/* ============================================================ */}
        {(customer.address || customer.city) && (
          <section
            id="card-lokasi"
            aria-label="Lokasi Bisnis"
            className={`w-full rounded-[26px] border ${
              isDark ? "border-black/20" : "border-[#ECE7DE]"
            } shadow-[0_2px_12px_rgba(0,0,0,0.025)] p-4 sm:p-5 space-y-3`}
            style={{ backgroundColor: cardBg }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-1">
              <div className="flex items-center gap-2">
                <MapPin className={`w-4 h-4 ${isDark ? "text-white/90" : "text-slate-700"}`} />
                <h2 className={`text-xs font-bold tracking-wider uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
                  LOKASI
                </h2>
              </div>
              {customer.city && (
                <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                  isDark
                    ? "text-amber-200 bg-white/20 border border-white/30"
                    : "text-[#9E8357] bg-[#FDF6ED] border border-[#F2E2CE]"
                }`}>
                  {customer.city}
                </span>
              )}
            </div>

            {/* Address Box */}
            <div className={`p-3.5 rounded-2xl border text-xs leading-relaxed ${
              isDark ? "bg-white/15 border-white/20 text-white/90" : "bg-black/[0.04] border-black/[0.08] text-slate-700"
            }`}>
              <p className="font-normal">{customer.address}</p>
              {customer.city && customer.address !== customer.city && (
                <p className={`text-[11px] font-medium mt-1 ${isDark ? "text-white/70" : "text-slate-400"}`}>
                  {customer.city}
                </p>
              )}
            </div>

            {/* Show on Map Button */}
            <a
              href={mapsLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleMapsClick}
              id="btn-show-on-map"
              className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] ${
                isDark
                  ? "bg-white/15 hover:bg-white/25 border-white/20 text-white"
                  : "bg-black/[0.04] hover:bg-black/[0.08] border-black/[0.08] text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  isDark ? "bg-white/25 text-white" : "bg-black/[0.06] text-slate-800"
                }`}>
                  <MapPin className="w-4 h-4" />
                </div>
                <span className={`text-xs font-semibold ${isDark ? "text-white" : "text-slate-800"}`}>
                  Buka di Google Maps
                </span>
              </div>
              <ExternalLink className={`w-3.5 h-3.5 ${isDark ? "text-white/70" : "text-slate-400"}`} />
            </a>
          </section>
        )}

        {/* ============================================================ */}
        {/* CARD 4: WEBSITE */}
        {/* ============================================================ */}
        {customer.website && (
          <section
            aria-label="Website Resmi"
            className={`w-full rounded-[26px] border ${
              isDark ? "border-white/20 shadow-lg" : "border-black/[0.08] shadow-xs"
            } p-4 sm:p-5 space-y-3`}
            style={{ backgroundColor: cardBg }}
          >
            {/* Header */}
            <div className="flex items-center gap-2 pb-1">
              <Globe className={`w-4 h-4 ${isDark ? "text-white/90" : "text-slate-700"}`} />
              <h2 className={`text-xs font-bold tracking-wider uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
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
              className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] ${
                isDark
                  ? "bg-white/15 hover:bg-white/25 border-white/20 text-white"
                  : "bg-black/[0.04] hover:bg-black/[0.08] border-black/[0.08] text-slate-800"
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${
                  isDark ? "bg-white/20 border-white/30 text-white" : "bg-black/[0.05] border-black/10 text-slate-800"
                }`}>
                  <Globe className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className={`text-[10px] font-medium block leading-tight ${isDark ? "text-white/70" : "text-slate-400"}`}>
                    Situs Resmi
                  </span>
                  <span className={`text-xs sm:text-sm font-bold truncate block ${isDark ? "text-white" : "text-slate-900"}`}>
                    {displayWebsite}
                  </span>
                </div>
              </div>
              <ExternalLink className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-white/70" : "text-slate-400"}`} />
            </a>
          </section>
        )}

        {/* ============================================================ */}
        {/* CARD 5: MEDIA SOSIAL & CHAT */}
        {/* ============================================================ */}
        <section
          aria-label="Media Sosial dan Chat"
          className={`w-full rounded-[26px] border ${
            isDark ? "border-white/20 shadow-lg" : "border-black/[0.08] shadow-xs"
          } p-4 sm:p-5 space-y-2.5`}
          style={{ backgroundColor: cardBg }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 pb-1">
            <Share2 className={`w-4 h-4 ${isDark ? "text-white/90" : "text-slate-700"}`} />
            <h2 className={`text-xs font-bold tracking-wider uppercase ${isDark ? "text-white" : "text-slate-900"}`}>
              MEDIA SOSIAL & CHAT
            </h2>
          </div>

          <div className="space-y-2">
            {/* WhatsApp - 1 warna logo, lingkaran bulat (rounded-full), tanpa subtitle */}
            {customer.whatsapp && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("whatsapp")}
                id="btn-whatsapp-chat"
                className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] ${
                  isDark
                    ? "bg-white/15 hover:bg-white/25 border-white/20 text-white"
                    : "bg-black/[0.04] hover:bg-black/[0.08] border-black/[0.08] text-slate-800"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isDark ? "bg-white/15 text-white" : "bg-black/[0.05] text-slate-900"
                  }`}>
                    <WhatsAppIcon size={19} />
                  </div>
                  <span className={`text-xs sm:text-sm font-bold truncate block ${isDark ? "text-white" : "text-slate-900"}`}>
                    WhatsApp
                  </span>
                </div>
                <ExternalLink className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-white/70" : "text-slate-400"}`} />
              </a>
            )}

            {/* Instagram - 1 warna logo, lingkaran bulat (rounded-full), tanpa subtitle */}
            {customer.instagramUsername && (
              <a
                href={`https://instagram.com/${cleanIg}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("instagram")}
                id="btn-instagram"
                className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] ${
                  isDark
                    ? "bg-white/15 hover:bg-white/25 border-white/20 text-white"
                    : "bg-black/[0.04] hover:bg-black/[0.08] border-black/[0.08] text-slate-800"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isDark ? "bg-white/15 text-white" : "bg-black/[0.05] text-slate-900"
                  }`}>
                    <InstagramIcon size={19} />
                  </div>
                  <span className={`text-xs sm:text-sm font-bold truncate block ${isDark ? "text-white" : "text-slate-900"}`}>
                    Instagram
                  </span>
                </div>
                <ExternalLink className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-white/70" : "text-slate-400"}`} />
              </a>
            )}

            {/* Facebook - 1 warna logo, lingkaran bulat (rounded-full), tanpa subtitle */}
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
                className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] ${
                  isDark
                    ? "bg-white/15 hover:bg-white/25 border-white/20 text-white"
                    : "bg-black/[0.04] hover:bg-black/[0.08] border-black/[0.08] text-slate-800"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isDark ? "bg-white/15 text-white" : "bg-black/[0.05] text-slate-900"
                  }`}>
                    <FacebookIcon size={19} />
                  </div>
                  <span className={`text-xs sm:text-sm font-bold truncate block ${isDark ? "text-white" : "text-slate-900"}`}>
                    Facebook
                  </span>
                </div>
                <ExternalLink className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-white/70" : "text-slate-400"}`} />
              </a>
            )}

            {/* TikTok - 1 warna logo, lingkaran bulat (rounded-full), tanpa subtitle */}
            {customer.tiktokUsername && (
              <a
                href={`https://tiktok.com/@${cleanTiktok}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackClick("tiktok")}
                id="btn-tiktok"
                className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] ${
                  isDark
                    ? "bg-white/15 hover:bg-white/25 border-white/20 text-white"
                    : "bg-black/[0.04] hover:bg-black/[0.08] border-black/[0.08] text-slate-800"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isDark ? "bg-white/15 text-white" : "bg-black/[0.05] text-slate-900"
                  }`}>
                    <TikTokIcon size={19} />
                  </div>
                  <span className={`text-xs sm:text-sm font-bold truncate block ${isDark ? "text-white" : "text-slate-900"}`}>
                    TikTok
                  </span>
                </div>
                <ExternalLink className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-white/70" : "text-slate-400"}`} />
              </a>
            )}

            {/* LinkedIn - 1 warna logo, lingkaran bulat (rounded-full), tanpa subtitle */}
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
                className={`w-full p-3 rounded-2xl border flex items-center justify-between transition-all active:scale-[0.98] ${
                  isDark
                    ? "bg-white/15 hover:bg-white/25 border-white/20 text-white"
                    : "bg-black/[0.04] hover:bg-black/[0.08] border-black/[0.08] text-slate-800"
                }`}
              >
                <div className="flex items-center gap-3 min-w-0 pr-2">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    isDark ? "bg-white/15 text-white" : "bg-black/[0.05] text-slate-900"
                  }`}>
                    <LinkedInIcon size={19} />
                  </div>
                  <span className={`text-xs sm:text-sm font-bold truncate block ${isDark ? "text-white" : "text-slate-900"}`}>
                    LinkedIn
                  </span>
                </div>
                <ExternalLink className={`w-3.5 h-3.5 shrink-0 ${isDark ? "text-white/70" : "text-slate-400"}`} />
              </a>
            )}
          </div>
        </section>

        {/* Footer - Hapus duplikasi teks */}
        <footer className="w-full flex items-center justify-center gap-3 pt-4 pb-8">
          <div className={`h-[1px] w-8 ${isDark ? "bg-white/30" : "bg-stone-300"}`} />
          <span className={`text-[11px] font-normal ${isDark ? "text-white/60" : "text-stone-400"}`}>
            {footerText?.startsWith("Dibuat oleh")
              ? footerText
              : `Dibuat oleh ${footerText || "TautSmart"}`}
          </span>
          <div className={`h-[1px] w-8 ${isDark ? "bg-white/30" : "bg-stone-300"}`} />
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
