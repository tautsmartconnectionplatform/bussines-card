import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const customerId = searchParams.get("customerId");

    const wherePage: any = {};
    const whereClick: any = {};

    if (customerId) {
      wherePage.customerId = customerId;
      whereClick.customerId = customerId;
    }

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    wherePage.viewedAt = { gte: thirtyDaysAgo };
    whereClick.clickedAt = { gte: thirtyDaysAgo };

    // 1. Total views & clicks
    const [totalViews, totalClicks] = await Promise.all([
      prisma.pageView.count({ where: wherePage }),
      prisma.linkClick.count({ where: whereClick }),
    ]);

    // 2. Link Clicks Breakdown
    const linkClicksGroup = await prisma.linkClick.groupBy({
      by: ["linkType"],
      where: whereClick,
      _count: { linkType: true },
    });

    const clicksByType = linkClicksGroup.map((item) => ({
      type: item.linkType,
      count: item._count.linkType,
    }));

    // 3. Device Breakdown
    const devicesGroup = await prisma.pageView.groupBy({
      by: ["deviceType"],
      where: wherePage,
      _count: { deviceType: true },
    });

    const deviceStats = devicesGroup.map((item) => ({
      device: item.deviceType || "unknown",
      count: item._count.deviceType,
    }));

    // 4. Daily Views (30 days)
    const dailyStats: { date: string; label: string; views: number; clicks: number }[] = [];

    for (let i = 29; i >= 0; i--) {
      const start = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

      const dayViews = await prisma.pageView.count({
        where: {
          ...wherePage,
          viewedAt: { gte: start, lt: end },
        },
      });

      const dayClicks = await prisma.linkClick.count({
        where: {
          ...whereClick,
          clickedAt: { gte: start, lt: end },
        },
      });

      dailyStats.push({
        date: start.toISOString().split("T")[0],
        label: start.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        views: dayViews,
        clicks: dayClicks,
      });
    }

    return NextResponse.json({
      totalViews,
      totalClicks,
      clicksByType,
      deviceStats,
      dailyStats,
    });
  } catch (error) {
    console.error("Stats API error:", error);
    return NextResponse.json({ error: "Gagal mengambil data analitik" }, { status: 500 });
  }
}
