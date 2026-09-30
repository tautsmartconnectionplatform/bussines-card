import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const orderSchema = z.object({
  customerId: z.string().min(1, "Pelanggan wajib dipilih"),
  orderDate: z.string().optional(),
  quantity: z.number().int().min(1, "Jumlah minimal 1"),
  packageName: z.string().optional().nullable(),
  totalPrice: z.number().int().min(0, "Harga total harus berupa angka"),
  paymentStatus: z.enum(["belum_bayar", "dp", "lunas"]).default("belum_bayar"),
  productionStatus: z.enum(["menunggu", "dicetak", "dikirim", "selesai"]).default("menunggu"),
  note: z.string().optional().nullable(),
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "all";
    const productionStatus = searchParams.get("productionStatus") || "all";
    const customerId = searchParams.get("customerId") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "15", 10);

    const where: any = {};

    if (customerId) where.customerId = customerId;
    if (paymentStatus !== "all") where.paymentStatus = paymentStatus;
    if (productionStatus !== "all") where.productionStatus = productionStatus;

    if (search) {
      where.customer = {
        OR: [
          { businessName: { contains: search } },
          { ownerName: { contains: search } },
          { slug: { contains: search } },
        ],
      };
    }

    const total = await prisma.order.count({ where });
    const orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: {
          select: { id: true, businessName: true, slug: true, ownerName: true, whatsapp: true },
        },
      },
    });

    return NextResponse.json({
      orders,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Fetch orders error:", error);
    return NextResponse.json({ error: "Gagal mengambil data pesanan" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = orderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const newOrder = await prisma.order.create({
      data: {
        customerId: data.customerId,
        orderDate: data.orderDate ? new Date(data.orderDate) : new Date(),
        quantity: data.quantity,
        packageName: data.packageName || "Paket Standar",
        totalPrice: data.totalPrice,
        paymentStatus: data.paymentStatus,
        productionStatus: data.productionStatus,
        note: data.note || null,
      },
      include: {
        customer: {
          select: { businessName: true, slug: true },
        },
      },
    });

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json({ error: "Gagal membuat pesanan" }, { status: 500 });
  }
}
