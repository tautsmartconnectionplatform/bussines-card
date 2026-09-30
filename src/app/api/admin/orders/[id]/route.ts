import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateOrderSchema = z.object({
  quantity: z.number().int().min(1).optional(),
  packageName: z.string().optional().nullable(),
  totalPrice: z.number().int().min(0).optional(),
  paymentStatus: z.enum(["belum_bayar", "dp", "lunas"]).optional(),
  productionStatus: z.enum(["menunggu", "dicetak", "dikirim", "selesai"]).optional(),
  note: z.string().optional().nullable(),
});

interface RouteParams {
  params: {
    id: string;
  };
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const body = await request.json();
    const parsed = updateOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message || "Input tidak valid" },
        { status: 400 }
      );
    }

    const updated = await prisma.order.update({
      where: { id: params.id },
      data: parsed.data,
      include: {
        customer: {
          select: { businessName: true, slug: true },
        },
      },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (error) {
    console.error("Update order error:", error);
    return NextResponse.json({ error: "Gagal memperbarui pesanan" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    await prisma.order.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete order error:", error);
    return NextResponse.json({ error: "Gagal menghapus pesanan" }, { status: 500 });
  }
}
