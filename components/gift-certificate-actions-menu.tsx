"use client";

import { useRouter } from "next/navigation";
import { Button, Dropdown } from "@bigcommerce/big-design";
import { MoreHorizIcon } from "@bigcommerce/big-design-icons";
import type { GiftCertificate } from "@/types";

interface GiftCertificateActionsMenuProps {
  giftCertificate: GiftCertificate;
}

/**
 * Row actions menu built on BigDesign's Dropdown. "Transfer to Credit" is
 * disabled (with an explanatory tooltip) when the recipient has no account.
 * Resend/Transfer are placeholders for now.
 */
export function GiftCertificateActionsMenu({
  giftCertificate: gc,
}: GiftCertificateActionsMenuProps) {
  const router = useRouter();

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
          onItemClick: () => {
            // Placeholder — wired up in a later phase.
          },
        },
        {
          content: "Transfer to Credit",
          disabled: !gc.hasRegisteredCustomer,
          tooltip: gc.hasRegisteredCustomer
            ? undefined
            : "Recipient is not a registered customer",
          onItemClick: () => {
            // Placeholder — wired up in a later phase.
          },
        },
      ]}
    />
  );
}
