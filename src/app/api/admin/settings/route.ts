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

    // Ganti Email atau Password Admin jika diisi
    if (newPassword || (body.adminEmail && body.adminEmail.trim())) {
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

      const isEmailChanged = body.adminEmail && body.adminEmail.trim().toLowerCase() !== adminRecord.email.toLowerCase();

      if (newPassword || isEmailChanged) {
        if (!currentPassword) {
          return NextResponse.json(
            { error: "Password saat ini wajib diisi untuk mengubah kredensial akun." },
            { status: 400 }
          );
        }

        const isValid = await verifyPassword(currentPassword, adminRecord.passwordHash);
        if (!isValid) {
          return NextResponse.json(
            { error: "Password saat ini salah. Silakan coba lagi." },
            { status: 400 }
          );
        }

        const updateData: { email?: string; passwordHash?: string } = {};

        if (isEmailChanged) {
          const targetEmail = body.adminEmail.trim().toLowerCase();
          const emailExists = await prisma.admin.findFirst({
            where: {
              email: targetEmail,
              id: { not: admin.adminId },
            },
          });
          if (emailExists) {
            return NextResponse.json(
              { error: "Email tersebut sudah digunakan oleh akun lain." },
              { status: 400 }
            );
          }
          updateData.email = targetEmail;
        }

        if (newPassword) {
          if (newPassword.length < 6) {
            return NextResponse.json(
              { error: "Password baru minimal 6 karakter." },
              { status: 400 }
            );
          }
          updateData.passwordHash = await hashPassword(newPassword);
        }

        if (Object.keys(updateData).length > 0) {
          await prisma.admin.update({
            where: { id: admin.adminId },
            data: updateData,
          });
        }
      }
    }

    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}
