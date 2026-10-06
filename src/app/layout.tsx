import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TautSmart | Kartu Bisnis Digital QR Premium & Profesional",
  description: "Platform kartu bisnis digital pintar berbasis QR code. Solusi profil mobile-first eksklusif untuk pengusaha, eksekutif, dan profesional modern.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>👑</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="dark">
      <body className="min-h-screen bg-[#070A10] text-slate-100 antialiased selection:bg-[#D4AF37] selection:text-black">
        {children}
      </body>
    </html>
  );
}
