import { notFound } from "next/navigation";
import { headers } from "next/headers";
import type { Metadata } from "next";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import PublicCardView from "@/components/public/PublicCardView";

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const customer = await prisma.customer.findFirst({
    where: {
      slug: params.slug,
      deletedAt: null,
    },
  });

  if (!customer) {
    return {
      title: "Profil Tidak Ditemukan",
    };
  }

  return {
    title: `${customer.businessName} - Kartu Bisnis Digital`,
    description: customer.tagline || `Hubungi ${customer.businessName} melalui WhatsApp, Instagram, dan sosial media.`,
    openGraph: {
      title: customer.businessName,
      description: customer.tagline || `Profil Kartu Bisnis Digital ${customer.businessName}`,
      images: customer.logoPath ? [customer.logoPath] : [],
    },
  };
}

// Deteksi tipe perangkat dari User-Agent
function getDeviceType(userAgent: string): "mobile" | "tablet" | "desktop" {
  const ua = userAgent.toLowerCase();
  if (/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua)) {
    return "tablet";
  }
  if (/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds)/.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

export default async function PublicCustomerPage({ params }: PageProps) {
  const customer = await prisma.customer.findFirst({
    where: {
      slug: params.slug,
      deletedAt: null,
    },
  });

  if (!customer) {
    notFound();
  }

  // Jika profil dinonaktifkan oleh admin
  if (!customer.isActive) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-center text-slate-100 selection:bg-rose-500 selection:text-white">
        <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            ⚠️
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Profil Tidak Aktif</h1>
          <p className="text-sm text-slate-400 leading-relaxed mb-6">
            Halaman profil bisnis ini saat ini sedang tidak aktif atau dinonaktifkan oleh pemilik sistem.
          </p>
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-xs text-slate-500">
            Jika ini adalah bisnis Anda, silakan hubungi penyedia layanan kartu bisnis Anda untuk mengaktifkan kembali.
          </div>
        </div>
      </div>
    );
  }

  // Rekam PageView tanpa memblokir render utama
  try {
    const headersList = headers();
    const userAgent = headersList.get("user-agent") || "";
    const forwardedFor = headersList.get("x-forwarded-for") || "";
    const ip = forwardedFor.split(",")[0].trim() || "127.0.0.1";
    const dateStr = new Date().toISOString().slice(0, 10);
    
    // Hash IP + Tanggal untuk privacy-friendly unique visitor counting
    const ipHash = crypto.createHash("sha256").update(`${ip}-${dateStr}`).digest("hex").slice(0, 16);
    const deviceType = getDeviceType(userAgent);

    // Asynchronous insert
    prisma.pageView.create({
      data: {
        customerId: customer.id,
        ipHash,
        deviceType,
      },
    }).catch((err) => console.error("PageView track error:", err));
  } catch (err) {
    console.error("Tracking header error:", err);
  }

  // Ambil pengaturan footer
  const footerSetting = await prisma.setting.findUnique({
    where: { key: "footer_text" },
  });

  return (
    <PublicCardView
      customer={{
        slug: customer.slug,
        businessName: customer.businessName,
        ownerName: customer.ownerName,
        jobTitle: customer.jobTitle,
        tagline: customer.tagline,
        logoPath: customer.logoPath,
        coverPath: customer.coverPath,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        mapsUrl: customer.mapsUrl,
        website: customer.website,
        whatsapp: customer.whatsapp,
        whatsappMessage: customer.whatsappMessage,
        facebookUrl: customer.facebookUrl,
        instagramUsername: customer.instagramUsername,
        tiktokUsername: customer.tiktokUsername,
        linkedinUrl: customer.linkedinUrl,
        accentColor: customer.accentColor,
      }}
      footerText={footerSetting?.value}
    />
  );
}
