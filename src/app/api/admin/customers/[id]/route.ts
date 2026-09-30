import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import {
  normalizeWhatsApp,
  normalizeUsername,
  normalizeFacebookUrl,
  normalizeWebsiteUrl,
  normalizeLinkedinUrl,
  generateSlug,
} from "@/lib/normalize";

const updateSchema = z.object({
  businessName: z.string().min(1, "Nama bisnis wajib diisi"),
  ownerName: z.string().min(1, "Nama pemilik wajib diisi"),
  jobTitle: z.string().optional().nullable(),
  email: z.string().email("Format email tidak valid").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  slug: z.string().min(1, "Slug wajib diisi"),
  tagline: z.string().max(160, "Tagline maksimal 160 karakter").optional().nullable(),
  logoPath: z.string().optional().nullable(),
  coverPath: z.string().optional().nullable(),
  address: z.string().min(1, "Alamat wajib diisi"),
  mapsUrl: z.string().optional().nullable(),
  whatsapp: z.string().min(5, "Nomor WhatsApp wajib diisi"),
  whatsappMessage: z.string().optional().nullable(),
  facebookUrl: z.string().optional().nullable(),
  instagramUsername: z.string().optional().nullable(),
  tiktokUsername: z.string().optional().nullable(),
  linkedinUrl: z.string().optional().nullable(),
  accentColor: z.string().default("#2563EB"),
  isActive: z.boolean().default(true),
  internalNote: z.string().optional().nullable(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function GET(request: Request, { params }: RouteParams) {
  try {
    const customer = await prisma.customer.findFirst({
      where: { id: params.id, deletedAt: null },
      include: {
        orders: {
          orderBy: { createdAt: "desc" },
        },
        _count: {
          select: { pageViews: true, linkClicks: true },
        },
      },
    });

    if (!customer) {
      return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error("Get customer detail error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pelanggan" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!existing || existing.deletedAt) {
      return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 });
    }

    const cleanSlug = generateSlug(data.slug);

    // Cek apakah slug sudah dipakai oleh pelanggan lain
    if (cleanSlug !== existing.slug) {
      const duplicate = await prisma.customer.findUnique({
        where: { slug: cleanSlug },
      });
      if (duplicate && duplicate.id !== params.id) {
        return NextResponse.json(
          { error: "Slug ini sudah digunakan oleh bisnis lain. Silakan pilih slug yang berbeda." },
          { status: 400 }
        );
      }
    }

    const updated = await prisma.customer.update({
      where: { id: params.id },
      data: {
        businessName: data.businessName.trim(),
        ownerName: data.ownerName.trim(),
        jobTitle: data.jobTitle?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone ? normalizeWhatsApp(data.phone) : null,
        city: data.city?.trim() || null,
        website: normalizeWebsiteUrl(data.website) || null,
        slug: cleanSlug,
        tagline: data.tagline?.trim() || null,
        logoPath: data.logoPath || null,
        coverPath: data.coverPath || null,
        address: data.address.trim(),
        mapsUrl: data.mapsUrl?.trim() || null,
        whatsapp: normalizeWhatsApp(data.whatsapp),
        whatsappMessage: data.whatsappMessage?.trim() || null,
        facebookUrl: normalizeFacebookUrl(data.facebookUrl) || null,
        instagramUsername: normalizeUsername(data.instagramUsername) || null,
        tiktokUsername: normalizeUsername(data.tiktokUsername) || null,
        linkedinUrl: normalizeLinkedinUrl(data.linkedinUrl) || null,
        accentColor: data.accentColor || "#2563EB",
        isActive: data.isActive,
        internalNote: data.internalNote?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, customer: updated });
  } catch (error) {
    console.error("Update customer error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data pelanggan" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const existing = await prisma.customer.findUnique({
      where: { id: params.id },
    });

    if (!existing) {
      return NextResponse.json({ error: "Pelanggan tidak ditemukan" }, { status: 404 });
    }

    // Soft delete sesuai PRD Section 8
    await prisma.customer.update({
      where: { id: params.id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete customer error:", error);
    return NextResponse.json({ error: "Gagal menghapus data pelanggan" }, { status: 500 });
  }
}
