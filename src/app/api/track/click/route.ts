import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    let body;
    const contentType = request.headers.get("content-type") || "";
    
    if (contentType.includes("application/json")) {
      body = await request.json();
    } else {
      const text = await request.text();
      body = JSON.parse(text);
    }

    const { slug, linkType } = body;
    if (!slug || !linkType) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    const customer = await prisma.customer.findFirst({
      where: { slug, deletedAt: null },
      select: { id: true },
    });

    if (!customer) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }

    await prisma.linkClick.create({
      data: {
        customerId: customer.id,
        linkType: String(linkType).slice(0, 30),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Link track error:", error);
    return NextResponse.json({ error: "Failed to record click" }, { status: 500 });
  }
}
