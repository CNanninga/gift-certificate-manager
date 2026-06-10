import type { GetServerSideProps } from "next";
import { getGiftCertificateById } from "@/data/mock-gift-certificates";
import type { GiftCertificate } from "@/types";
import { GiftCertificateDetail } from "@/components/gift-certificate-detail";

interface GiftCertificateDetailPageProps {
  giftCertificate: GiftCertificate;
}

export default function GiftCertificateDetailPage({
  giftCertificate,
}: GiftCertificateDetailPageProps) {
  return <GiftCertificateDetail giftCertificate={giftCertificate} />;
}

export const getServerSideProps: GetServerSideProps<
  GiftCertificateDetailPageProps
> = async (context) => {
  const id = context.params?.id;
  const giftCertificate =
    typeof id === "string" ? getGiftCertificateById(id) : undefined;

  if (!giftCertificate) {
    return { notFound: true };
  }

  return { props: { giftCertificate } };
};
