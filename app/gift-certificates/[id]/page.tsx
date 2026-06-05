import { notFound } from "next/navigation";
import { getGiftCertificateById } from "@/data/mock-gift-certificates";
import { GiftCertificateDetail } from "@/components/gift-certificate-detail";

interface GiftCertificateDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GiftCertificateDetailPage({
  params,
}: GiftCertificateDetailPageProps) {
  const { id } = await params;
  const giftCertificate = getGiftCertificateById(id);

  if (!giftCertificate) {
    notFound();
  }

  return <GiftCertificateDetail giftCertificate={giftCertificate} />;
}
