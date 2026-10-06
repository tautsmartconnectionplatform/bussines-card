"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  ExternalLink,
  Menu,
  X,
  QrCode,
  ShieldCheck,
} from "lucide-react";

interface AdminSidebarProps {
  adminEmail: string;
}

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Pelanggan & Kartu", href: "/admin/customers", icon: Users },
  { name: "Pesanan", href: "/admin/orders", icon: ShoppingBag },
  { name: "Statistik", href: "/admin/stats", icon: BarChart3 },
  { name: "Pengaturan", href: "/admin/settings", icon: Settings },
];

export default function AdminSidebar({ adminEmail }: AdminSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Jangan render sidebar di halaman login
  if (pathname === "/admin/login") {
    return null;
  }

  const handleLogout = async () => {
    if (!confirm("Apakah Anda yakin ingin keluar dari panel admin?")) return;
    setLoggingOut(true);
    try {
      await fetch("/api/admin/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  const isActive = (itemHref: string, exact?: boolean) => {
    if (exact) return pathname === itemHref;
    return pathname === itemHref || pathname.startsWith(itemHref + "/");
  };

  return (
    <>
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#0B0F19] border-b border-slate-800 sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#8A6718] flex items-center justify-center text-black font-bold shadow-md shadow-amber-500/10">
            <QrCode className="w-4 h-4 text-black" />
          </div>
          <span className="font-extrabold text-sm text-white">
            Taut<span className="text-[#D4AF37]">Smart</span> Admin
          </span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-300 hover:text-white rounded-xl bg-slate-900 border border-slate-700/80 focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static top-0 bottom-0 left-0 z-50 w-64 bg-[#0B0F19] border-r border-slate-800 flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top Branding */}
        <div>
          <div className="p-6 border-b border-slate-800/80 flex items-center justify-between">
            <Link
              href="/admin"
              className="flex items-center gap-3 group"
              onClick={() => setMobileMenuOpen(false)}
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#8A6718] flex items-center justify-center text-black shadow-lg shadow-amber-500/15 group-hover:scale-105 transition-transform">
                <QrCode className="w-5 h-5 text-black" />
              </div>
              <div>
                <span className="font-black text-sm text-white block leading-tight">
                  Taut<span className="text-[#D4AF37]">Smart</span>
                </span>
                <span className="text-[10px] text-slate-400 block font-medium uppercase tracking-wider">
                  Panel Manajemen
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    active
                      ? "btn-gold text-black shadow-lg shadow-amber-500/20"
                      : "text-slate-400 hover:text-white hover:bg-slate-900/90"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-black" : "text-slate-400"}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Profile & Actions */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-[#D4AF37] hover:bg-slate-900/60 transition-colors"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Buka Web Publik</span>
            </span>
          </Link>

          <div className="p-3 bg-[#070A10] rounded-2xl border border-slate-800/80 flex items-center justify-between">
            <div className="min-w-0 pr-2">
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider block">
                Administrator
              </span>
              <p className="text-xs font-medium text-slate-200 truncate">{adminEmail}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              title="Keluar"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors focus-visible:ring-2 focus-visible:ring-[#D4AF37]"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
