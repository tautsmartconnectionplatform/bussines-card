import { NextResponse } from "next/server";
import JSZip from "jszip";
import { prisma } from "@/lib/prisma";
import { generateQRPNGBuffer } from "@/lib/qr";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const ids = searchParams.get("ids")?.split(",").filter(Boolean);

    const where: any = { deletedAt: null, isActive: true };
    if (ids && ids.length > 0) {
      where.id = { in: ids };
    }

    const customers = await prisma.customer.findMany({
      where,
      select: { id: true, slug: true, businessName: true },
    });

    if (customers.length === 0) {
      return new NextResponse("Tidak ada pelanggan yang dipilih", { status: 400 });
    }

    const baseDomainSetting = await prisma.setting.findUnique({
      where: { key: "base_domain" },
    });
    const baseUrl = baseDomainSetting?.value || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const zip = new JSZip();

    for (const c of customers) {
      const targetUrl = `${baseUrl}/c/${c.slug}`;
      const pngBuffer = await generateQRPNGBuffer(targetUrl, {
        width: 1200,
        margin: 2,
        errorCorrectionLevel: "H",
      });
      zip.file(`qr-${c.slug}.png`, pngBuffer);
    }

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return new NextResponse(new Uint8Array(zipBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="qr-codes-batch-${Date.now()}.zip"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("QR Zip export error:", error);
    return new NextResponse("Gagal membuat file ZIP", { status: 500 });
  }
}
