import Link from "next/link";
import {
  QrCode,
  Smartphone,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  Store,
  Layers,
  CheckCircle2,
} from "lucide-react";
import { prisma } from "@/lib/prisma";

export default async function HomePage() {
  const customers = await prisma.customer.findMany({
    where: { isActive: true, deletedAt: null },
    take: 3,
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Navbar */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <QrCode className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Taut<span className="text-blue-400">Smart</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all shadow-md shadow-blue-600/30 flex items-center gap-2 active:scale-95"
            >
              <span>Panel Admin</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-20 flex flex-col items-center text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-8 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>TautSmart - Platform Kartu Bisnis Digital Berbasis QR</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-3xl leading-tight">
          Cetak Sekali, Update Kapan Saja{" "}
          <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-cyan-400 bg-clip-text text-transparent">
            Tanpa Cetak Ulang.
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-2xl mt-6 leading-relaxed">
          Hubungkan kartu bisnis fisik Anda dengan profil digital pintar TautSmart. Satu kali scan membuka WhatsApp, media sosial, Google Maps, dan vCard dalam hitungan detik.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/admin"
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl shadow-xl shadow-blue-600/25 transition-all flex items-center gap-2.5 active:scale-95"
          >
            <Layers className="w-5 h-5" />
            <span>Buka Dashboard Penjual</span>
          </Link>
        </div>

        {/* Live Demo Cards Showcase */}
        <div className="mt-16 w-full text-left">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Store className="w-5 h-5 text-blue-400" />
                <span>Lihat Contoh Profil Bisnis Langsung</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Pindai atau klik profil demo di bawah untuk merasakan pengalaman mobile-first:
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {customers.map((c) => (
              <Link
                key={c.id}
                href={`/c/${c.slug}`}
                className="group relative p-5 rounded-2xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all duration-200 hover:-translate-y-1 shadow-lg"
              >
                <div
                  className="w-2 h-2 rounded-full absolute top-5 right-5"
                  style={{ backgroundColor: c.accentColor }}
                />
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center font-bold text-white shadow-md text-base"
                    style={{ backgroundColor: c.accentColor }}
                  >
                    {c.businessName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors text-sm line-clamp-1">
                      {c.businessName}
                    </h3>
                    <p className="text-xs text-slate-400">@{c.slug}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                  {c.tagline || c.address}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs font-medium text-blue-400">
                  <span>Buka Profil</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Feature Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center mb-4">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white mb-2">Mobile-First & Ultra Cepat</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Halaman publik ringan dengan tombol besar ramah jempol. Membuka chat WhatsApp langsung tanpa perlu simpan nomor manual.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
              <QrCode className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white mb-2">QR Vector & High-Res PNG</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Generator QR langsung menghasilkan format SVG untuk percetakan presisi tinggi dan PNG 1000x1000 siap pakai.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800/80 backdrop-blur-md">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white mb-2">Statistik Kunjungan & Klik</h3>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Pantau performa scan QR harian, distribusi tombol yang paling sering diklik, serta tipe perangkat pengunjung.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 TautSmart Platform. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/admin" className="hover:text-white transition-colors">
              Panel Admin
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
