import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentAdmin, hashPassword, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = await prisma.setting.findMany();
    const settingsMap: Record<string, string> = {};
    settings.forEach((s) => {
      settingsMap[s.key] = s.value;
    });

    const admin = await getCurrentAdmin();

    return NextResponse.json({
      settings: {
        seller_name: settingsMap.seller_name || "TautSmart Indonesia",
        footer_text: settingsMap.footer_text || "Dibuat oleh TautSmart",
        base_domain: settingsMap.base_domain || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",
      },
      adminEmail: admin?.email || "",
    });
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "Gagal mengambil pengaturan" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { seller_name, footer_text, base_domain, currentPassword, newPassword } = body;

    // Update settings keys
    if (seller_name !== undefined) {
      await prisma.setting.upsert({
        where: { key: "seller_name" },
        update: { value: String(seller_name).trim() },
        create: { key: "seller_name", value: String(seller_name).trim() },
      });
    }

    if (footer_text !== undefined) {
      await prisma.setting.upsert({
        where: { key: "footer_text" },
        update: { value: String(footer_text).trim() },
        create: { key: "footer_text", value: String(footer_text).trim() },
      });
    }

    if (base_domain !== undefined) {
      let cleanDomain = String(base_domain).trim().replace(/\/+$/, "");
      if (!cleanDomain.startsWith("http://") && !cleanDomain.startsWith("https://")) {
        cleanDomain = "https://" + cleanDomain;
      }
      await prisma.setting.upsert({
        where: { key: "base_domain" },
        update: { value: cleanDomain },
        create: { key: "base_domain", value: cleanDomain },
      });
    }

    // Ganti Password Admin jika diisi
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: "Password saat ini wajib diisi untuk mengganti password." },
          { status: 400 }
        );
      }

      const admin = await getCurrentAdmin();
      if (!admin) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const adminRecord = await prisma.admin.findUnique({
        where: { id: admin.adminId },
      });

      if (!adminRecord) {
        return NextResponse.json({ error: "Admin tidak ditemukan" }, { status: 404 });
      }

      const isValid = await verifyPassword(currentPassword, adminRecord.passwordHash);
      if (!isValid) {
        return NextResponse.json(
          { error: "Password saat ini salah. Silakan coba lagi." },
          { status: 400 }
        );
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: "Password baru minimal 6 karakter." },
          { status: 400 }
        );
      }

      const newHash = await hashPassword(newPassword);
      await prisma.admin.update({
        where: { id: admin.adminId },
        data: { passwordHash: newHash },
      });
    }

    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
