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

const customerSchema = z.object({
  businessName: z.string().min(1, "Nama bisnis wajib diisi"),
  ownerName: z.string().min(1, "Nama pemilik wajib diisi"),
  jobTitle: z.string().optional().nullable(),
  email: z.string().email("Format email tidak valid").optional().nullable().or(z.literal("")),
  phone: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  slug: z.string().optional(),
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const sort = searchParams.get("sort") || "newest";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    const where: any = {
      deletedAt: null,
    };

    if (status === "active") where.isActive = true;
    if (status === "inactive") where.isActive = false;

    if (search) {
      where.OR = [
        { businessName: { contains: search } },
        { ownerName: { contains: search } },
        { slug: { contains: search } },
        { whatsapp: { contains: search } },
      ];
    }

    let orderBy: any = { createdAt: "desc" };
    if (sort === "oldest") orderBy = { createdAt: "asc" };
    if (sort === "name") orderBy = { businessName: "asc" };

    const total = await prisma.customer.count({ where });
    const customers = await prisma.customer.findMany({
      where,
      orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: {
        _count: {
          select: { pageViews: true, orders: true },
        },
      },
    });

    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch customers error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pelanggan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = customerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // Normalisasi input
    const normalizedWA = normalizeWhatsApp(data.whatsapp);
    const normalizedIG = normalizeUsername(data.instagramUsername);
    const normalizedTT = normalizeUsername(data.tiktokUsername);
    const normalizedFB = normalizeFacebookUrl(data.facebookUrl);

    // Buat slug otomatis jika belum ada atau gunakan slug yang diinput
    let targetSlug = data.slug ? generateSlug(data.slug) : generateSlug(data.businessName);
    if (!targetSlug) targetSlug = `bisnis-${Date.now().toString().slice(-4)}`;

    // Cek keunikan slug
    const existing = await prisma.customer.findUnique({
      where: { slug: targetSlug },
    });

    if (existing) {
      // Jika ada duplikasi, tambahkan suffix acak
      targetSlug = `${targetSlug}-${Math.floor(1000 + Math.random() * 9000)}`;
    }

    const newCustomer = await prisma.customer.create({
      data: {
        businessName: data.businessName.trim(),
        ownerName: data.ownerName.trim(),
        jobTitle: data.jobTitle?.trim() || null,
        email: data.email?.trim() || null,
        phone: data.phone ? normalizeWhatsApp(data.phone) : null,
        city: data.city?.trim() || null,
        website: normalizeWebsiteUrl(data.website) || null,
        slug: targetSlug,
        tagline: data.tagline?.trim() || null,
        logoPath: data.logoPath || null,
        coverPath: data.coverPath || null,
        address: data.address.trim(),
        mapsUrl: data.mapsUrl?.trim() || null,
        whatsapp: normalizedWA,
        whatsappMessage: data.whatsappMessage?.trim() || null,
        facebookUrl: normalizedFB || null,
        instagramUsername: normalizedIG || null,
        tiktokUsername: normalizedTT || null,
        linkedinUrl: normalizeLinkedinUrl(data.linkedinUrl) || null,
        accentColor: data.accentColor || "#2563EB",
        isActive: data.isActive ?? true,
        internalNote: data.internalNote?.trim() || null,
      },
    });

    return NextResponse.json({ success: true, customer: newCustomer });
  } catch (error) {
    console.error("Create customer error:", error);
    return NextResponse.json({ error: "Gagal menyimpan data pelanggan" }, { status: 500 });
  }
}
