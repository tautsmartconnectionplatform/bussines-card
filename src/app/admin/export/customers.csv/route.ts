import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function escapeCSV(field: any): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET() {
  try {
    const customers = await prisma.customer.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { pageViews: true, orders: true },
        },
      },
    });

    const headers = [
      "ID",
      "Nama Bisnis",
      "Nama Pemilik",
      "Slug",
      "Nomor WhatsApp",
      "Alamat",
      "Status",
      "Total Scan (Views)",
      "Total Pesanan",
      "Warna Aksen",
      "Instagram",
      "TikTok",
      "Facebook",
      "Tanggal Dibuat",
    ];

    const rows = customers.map((c) => [
      escapeCSV(c.id),
      escapeCSV(c.businessName),
      escapeCSV(c.ownerName),
      escapeCSV(c.slug),
      escapeCSV(c.whatsapp),
      escapeCSV(c.address),
      escapeCSV(c.isActive ? "Aktif" : "Nonaktif"),
      escapeCSV(c._count.pageViews),
      escapeCSV(c._count.orders),
      escapeCSV(c.accentColor),
      escapeCSV(c.instagramUsername || "-"),
      escapeCSV(c.tiktokUsername || "-"),
      escapeCSV(c.facebookUrl || "-"),
      escapeCSV(c.createdAt.toISOString().slice(0, 10)),
    ]);

    // Tambahkan UTF-8 BOM (\uFEFF) agar Microsoft Excel membuka karakter khusus dengan benar
    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="data-pelanggan-${Date.now()}.csv"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Export customers CSV error:", error);
    return new NextResponse("Gagal mengekspor CSV", { status: 500 });
  }
}
