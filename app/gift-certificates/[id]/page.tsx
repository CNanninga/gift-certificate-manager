import { GiftCertificateDetail } from "@/components/gift-certificate-detail";

interface GiftCertificateDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GiftCertificateDetailPage({
  params,
}: GiftCertificateDetailPageProps) {
  const { id } = await params;

  return <GiftCertificateDetail id={id} />;
}
