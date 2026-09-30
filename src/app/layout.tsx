import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TautSmart - Solusi Kartu Bisnis Digital QR Modern",
  description: "Platform kartu bisnis digital TautSmart berbasis QR code. Update data profil bisnis Anda kapan saja tanpa cetak ulang kartu.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>💳</text></svg>",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-blue-500 selection:text-white">
        {children}
      </body>
    </html>
  );
}
