import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateVCard } from "@/lib/vcard";

interface RouteParams {
  params: {
    slug: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  const customer = await prisma.customer.findFirst({
    where: {
      slug: params.slug,
      deletedAt: null,
    },
  });

  if (!customer || !customer.isActive) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Ambil base domain untuk url profil
  const baseDomainSetting = await prisma.setting.findUnique({
    where: { key: "base_domain" },
  });
  const baseUrl = baseDomainSetting?.value || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const profileUrl = `${baseUrl}/c/${customer.slug}`;

  const vcardContent = generateVCard({
    businessName: customer.businessName,
    ownerName: customer.ownerName,
    jobTitle: customer.jobTitle,
    phone: customer.phone || customer.whatsapp,
    email: customer.email,
    address: customer.address,
    city: customer.city,
    tagline: customer.tagline,
    url: profileUrl,
    website: customer.website,
  });

  return new NextResponse(vcardContent, {
    status: 200,
    headers: {
      "Content-Type": "text/vcard; charset=utf-8",
      "Content-Disposition": `attachment; filename="${customer.slug}.vcf"`,
      "Cache-Control": "no-cache",
    },
  });
}
