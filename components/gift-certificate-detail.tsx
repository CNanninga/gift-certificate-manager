"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, H1, Link, Tabs, Text } from "@bigcommerce/big-design";
import type { GiftCertificate } from "@/types";
import { GiftCertificateDetailsTab } from "@/components/gift-certificate-details-tab";
import { GiftCertificateBalanceTab } from "@/components/gift-certificate-balance-tab";

interface GiftCertificateDetailProps {
  giftCertificate: GiftCertificate;
}

const TABS = [
  { id: "details", title: "Details" },
  { id: "balance", title: "Balance" },
];

/**
 * Client view for a single gift certificate, split into Details and Balance
 * tabs.
 */
export function GiftCertificateDetail({
  giftCertificate,
}: GiftCertificateDetailProps) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("details");

  return (
    <Box
      backgroundColor="secondary20"
      padding={{ mobile: "medium", tablet: "xLarge" }}
    >
      <Box style={{ maxWidth: 900, margin: "0 auto" }}>
        <Box marginBottom="medium">
          <Link
            href="/"
            onClick={(event) => {
              event.preventDefault();
              router.push("/");
            }}
          >
            ← Back to gift certificates
          </Link>
        </Box>

        <Box marginBottom="medium">
          <H1 marginBottom="xSmall">{giftCertificate.code}</H1>
          <Text color="secondary60" marginBottom="none">
            Manage this gift certificate.
          </Text>
        </Box>

        <Tabs activeTab={activeTab} items={TABS} onTabClick={setActiveTab} />

        <Box marginTop="medium">
          {activeTab === "details" ? (
            <GiftCertificateDetailsTab giftCertificate={giftCertificate} />
          ) : (
            <GiftCertificateBalanceTab giftCertificate={giftCertificate} />
          )}
        </Box>
      </Box>
    </Box>
  );
}
