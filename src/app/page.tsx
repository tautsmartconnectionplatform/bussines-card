import Link from "next/link";
import {
  QrCode,
  Smartphone,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Store,
  Layers,
  Sparkles,
  Download,
  CheckCircle2,
  ExternalLink,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const customers = await prisma.customer.findMany({
    where: { isActive: true, deletedAt: null },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col justify-between selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
      {/* Subtle Top Gold Ambient Light */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* Navigation Header */}
      <header className="w-full border-b border-slate-800/80 bg-[#070A10]/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 py-3.5 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#8A6718] flex items-center justify-center shadow-lg shadow-amber-500/15 group-hover:scale-105 transition-transform">
              <QrCode className="w-5 h-5 text-black" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-white block leading-tight">
                Taut<span className="text-[#D4AF37]">Smart</span>
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase">
                Digital Business Card
              </span>
            </div>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 text-xs sm:text-sm font-bold text-black bg-gradient-to-r from-[#D4AF37] to-[#C5A059] hover:brightness-110 rounded-xl transition-all shadow-md shadow-amber-500/20 flex items-center gap-2 active:scale-95"
            >
              <span>Panel Admin</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center">
        {/* Badge Indicator */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-amber-500/30 text-amber-300 text-xs font-semibold mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span>Platform Kartu Bisnis Digital Berbasis QR Eksklusif</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl leading-[1.15]">
          Cetak Kartu Sekali, Perbarui Data Kapan Saja{" "}
          <span className="gold-gradient-text block sm:inline">
            Tanpa Perlu Cetak Ulang.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 text-sm sm:text-lg max-w-2xl mt-6 leading-relaxed">
          Tautkan kartu fisik Anda dengan profil bisnis mobile-first profesional. Satu kali pemindaian QR langsung menghubungkan WhatsApp, media sosial, Google Maps, dan unduhan vCard.
        </p>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/admin"
            className="px-6 py-3.5 btn-gold text-black font-extrabold rounded-2xl transition-all flex items-center gap-2.5 active:scale-95"
          >
            <Layers className="w-5 h-5 text-black" />
            <span>Kelola Panel Pelanggan</span>
          </Link>
        </div>

        {/* Live Demo Cards Showcase (Real Customer Data) */}
        <div className="mt-16 w-full text-left">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 pb-4 border-b border-slate-800/80 gap-3">
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2.5">
                <Store className="w-5 h-5 text-[#D4AF37]" />
                <span>Eksplorasi Profil Bisnis Demo</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Pilih profil di bawah untuk menguji pengalaman visual dan fungsi kartu secara langsung:
              </p>
            </div>
            <span className="text-xs text-amber-400/90 font-semibold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 w-fit">
              {customers.length} Profil Siap Ditinjau
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {customers.map((c) => {
              const cardAccent = c.accentColor || "#D4AF37";
              return (
                <Link
                  key={c.id}
                  href={`/c/${c.slug}`}
                  className="group relative p-5 rounded-3xl bg-[#0B0F19]/90 hover:bg-[#101726] border border-slate-800 hover:border-amber-500/40 transition-all duration-300 hover:-translate-y-1 shadow-xl flex flex-col justify-between overflow-hidden"
                >
                  {/* Top hairline border accent */}
                  <div
                    className="absolute top-0 inset-x-0 h-[2px] opacity-75"
                    style={{ backgroundColor: cardAccent }}
                  />

                  <div>
                    <div className="flex items-center gap-3.5 mb-3.5">
                      {c.logoPath ? (
                        <img
                          src={c.logoPath}
                          alt={c.businessName}
                          className="w-12 h-12 rounded-2xl object-cover bg-slate-900 border border-slate-700 shadow-md"
                        />
                      ) : (
                        <div
                          className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-md text-lg"
                          style={{
                            background: `linear-gradient(135deg, ${cardAccent} 0%, #070A10 100%)`,
                          }}
                        >
                          {c.businessName.charAt(0).toUpperCase()}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-white group-hover:text-[#D4AF37] transition-colors text-sm truncate">
                          {c.businessName}
                        </h3>
                        <p className="text-xs text-slate-400 truncate">
                          {c.ownerName ? `${c.ownerName}` : `@${c.slug}`}
                        </p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 line-clamp-2 mb-4 leading-relaxed min-h-[32px]">
                      {c.tagline || c.address}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs font-semibold text-[#D4AF37]">
                    <span>Buka Kartu Digital</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Feature Grid (3 Core Pillars with clear purposeful copy) */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800/80 backdrop-blur-md hover:border-amber-500/30 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-[#D4AF37] flex items-center justify-center mb-4 border border-amber-500/20">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Desain Mobile-First & Responsif</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Dioptimalkan untuk kecepatan layar smartphone dengan tombol aksi cepat (WhatsApp, Telepon, Email, Lokasi, dan vCard).
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800/80 backdrop-blur-md hover:border-amber-500/30 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-[#D4AF37] flex items-center justify-center mb-4 border border-amber-500/20">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Ekspor QR Presisi Tinggi</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Menghasilkan kode QR format vektor SVG untuk kebutuhan cetak kartu fisik dan file gambar PNG siap pakai.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-[#0B0F19]/90 border border-slate-800/80 backdrop-blur-md hover:border-amber-500/30 transition-all">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/10 text-[#D4AF37] flex items-center justify-center mb-4 border border-amber-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-base mb-2">Analitik & Manajemen Terpusat</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Pantau statistik pemindaian harian, tombol tautan yang paling diminati pengunjung, serta data pelanggan secara lengkap.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-800/80 bg-[#070A10] py-8 text-center text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TautSmart Platform. Seluruh hak cipta dilindungi.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/admin" className="hover:text-[#D4AF37] transition-colors font-medium">
              Panel Administrator
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
