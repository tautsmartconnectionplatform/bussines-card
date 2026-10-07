import React from "react";
import { getCurrentAdmin } from "@/lib/auth";
import AdminSidebar from "@/components/admin/AdminSidebar";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const admin = await getCurrentAdmin();

  return (
    <div className="min-h-screen bg-[#070A10] text-slate-100 flex flex-col md:flex-row selection:bg-[#D4AF37] selection:text-black">
      {/* Sidebar Component */}
      <AdminSidebar adminEmail={admin?.email || "admin_tautsmart@gmail.com"} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
