"use client";

import { useRouter } from "next/navigation";
import { Button, Dropdown } from "@bigcommerce/big-design";
import { MoreHorizIcon } from "@bigcommerce/big-design-icons";
import type { GiftCertificate } from "@/types";

interface GiftCertificateActionsMenuProps {
  giftCertificate: GiftCertificate;
}

/**
 * Row actions menu built on BigDesign's Dropdown. Only "View details" is
 * available unless the certificate is Active; "Transfer to Credit"
 * additionally requires a registered customer. Each disabled action explains
 * itself via a tooltip. Resend/Transfer are placeholders for now.
 */
export function GiftCertificateActionsMenu({
  giftCertificate: gc,
}: GiftCertificateActionsMenuProps) {
  const router = useRouter();

  const isActive = gc.status === "Active";

  return (
    <Dropdown
      placement="bottom-end"
      toggle={
        <Button
          variant="subtle"
          iconOnly={<MoreHorizIcon title="Actions" />}
          aria-label={`Actions for ${gc.code}`}
        />
      }
      items={[
        {
          content: "View details",
          onItemClick: () => router.push(`/gift-certificates/${gc.id}`),
        },
        {
          content: "Resend",
          disabled: !isActive,
          tooltip: isActive
            ? undefined
            : "Only active gift certificates can be resent",
          onItemClick: () => {
            // Placeholder — wired up in a later phase.
          },
        },
        {
          content: "Transfer to Credit",
          disabled: !isActive,
          tooltip: isActive
            ? undefined
            : "Only active gift certificates can be transferred",
          onItemClick: () => {
            // Placeholder — wired up in a later phase.
          },
        },
      ]}
    />
  );
}
