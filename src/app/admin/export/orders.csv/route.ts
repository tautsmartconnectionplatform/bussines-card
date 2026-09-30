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
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: { businessName: true, ownerName: true, slug: true, whatsapp: true },
        },
      },
    });

    const headers = [
      "ID Pesanan",
      "Nama Bisnis",
      "Nama Pemilik",
      "Slug Profil",
      "WhatsApp",
      "Paket",
      "Jumlah (Pcs)",
      "Total Harga (Rp)",
      "Status Bayar",
      "Status Produksi",
      "Catatan",
      "Tanggal Pesanan",
    ];

    const rows = orders.map((o) => [
      escapeCSV(o.id),
      escapeCSV(o.customer.businessName),
      escapeCSV(o.customer.ownerName),
      escapeCSV(o.customer.slug),
      escapeCSV(o.customer.whatsapp),
      escapeCSV(o.packageName || "Standar"),
      escapeCSV(o.quantity),
      escapeCSV(o.totalPrice),
      escapeCSV(o.paymentStatus),
      escapeCSV(o.productionStatus),
      escapeCSV(o.note || "-"),
      escapeCSV(o.orderDate.toISOString().slice(0, 10)),
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="data-pesanan-${Date.now()}.csv"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Export orders CSV error:", error);
    return new NextResponse("Gagal mengekspor CSV pesanan", { status: 500 });
  }
}
