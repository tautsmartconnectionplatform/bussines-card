import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateQRPNGBuffer, generateQRSVG } from "@/lib/qr";

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get("format") || "png";
    const colorDark = searchParams.get("colorDark") || "#000000";
    const colorLight = searchParams.get("colorLight") || "#ffffff";
    const margin = parseInt(searchParams.get("margin") || "2", 10);

    const customer = await prisma.customer.findFirst({
      where: { id: params.id, deletedAt: null },
    });

    if (!customer) {
      return new NextResponse("Pelanggan tidak ditemukan", { status: 404 });
    }

    const baseDomainSetting = await prisma.setting.findUnique({
      where: { key: "base_domain" },
    });
    const baseUrl = baseDomainSetting?.value || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const targetUrl = `${baseUrl}/c/${customer.slug}`;

    if (format === "svg") {
      const svgString = await generateQRSVG(targetUrl, {
        errorCorrectionLevel: "H",
        margin,
        color: { dark: colorDark, light: colorLight },
      });

      return new NextResponse(svgString, {
        status: 200,
        headers: {
          "Content-Type": "image/svg+xml",
          "Content-Disposition": `attachment; filename="qr-${customer.slug}.svg"`,
          "Cache-Control": "no-cache",
        },
      });
    }

    // Default: PNG High Resolution (1000x1000)
    const pngBuffer = await generateQRPNGBuffer(targetUrl, {
      width: 1200,
      margin,
      errorCorrectionLevel: "H",
      color: { dark: colorDark, light: colorLight },
    });

    return new NextResponse(new Uint8Array(pngBuffer), {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Disposition": `attachment; filename="qr-${customer.slug}.png"`,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Generate QR error:", error);
    return new NextResponse("Gagal menghasilkan QR code", { status: 500 });
  }
}
