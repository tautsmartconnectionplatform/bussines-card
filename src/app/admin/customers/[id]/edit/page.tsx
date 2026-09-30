import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CustomerForm from "@/components/admin/CustomerForm";

interface PageProps {
  params: {
    id: string;
  };
}

export const revalidate = 0;

export default async function EditCustomerPage({ params }: PageProps) {
  const customer = await prisma.customer.findFirst({
    where: { id: params.id, deletedAt: null },
  });

  if (!customer) {
    notFound();
  }

  return (
    <CustomerForm
      isEdit={true}
      initialData={{
        id: customer.id,
        businessName: customer.businessName,
        ownerName: customer.ownerName,
        slug: customer.slug,
        tagline: customer.tagline,
        logoPath: customer.logoPath,
        address: customer.address,
        mapsUrl: customer.mapsUrl,
        whatsapp: customer.whatsapp,
        whatsappMessage: customer.whatsappMessage,
        facebookUrl: customer.facebookUrl,
        instagramUsername: customer.instagramUsername,
        tiktokUsername: customer.tiktokUsername,
        accentColor: customer.accentColor,
        isActive: customer.isActive,
        internalNote: customer.internalNote,
      }}
    />
  );
}
