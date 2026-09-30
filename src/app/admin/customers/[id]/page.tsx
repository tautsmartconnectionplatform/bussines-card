import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerDetailView from "@/components/admin/CustomerDetailView";

interface PageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0;

export default async function CustomerDetailPage({ params }: PageProps) {
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
    notFound();
  }

  const baseDomainSetting = await prisma.setting.findUnique({
    where: { key: "base_domain" },
  });
  const baseUrl = baseDomainSetting?.value || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

  return <CustomerDetailView customer={customer} baseUrl={baseUrl} />;
}
