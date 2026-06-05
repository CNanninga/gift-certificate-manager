"use client";

import { useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { GiftCertificate } from "@/types";
import { formatCurrency, formatDate } from "@/lib/format";
import { RegisteredCustomerBadge } from "@/components/registered-customer-badge";
import { GiftCertificateActionsMenu } from "@/components/gift-certificate-actions-menu";
import { GiftCertificateTooltip } from "@/components/gift-certificate-tooltip";

interface GiftCertificateRowProps {
  giftCertificate: GiftCertificate;
}

const cellClasses = "px-4 py-3 text-sm text-zinc-700 dark:text-zinc-300";

// Approximate tooltip size, used only to keep it inside the viewport.
const TOOLTIP_WIDTH = 288;
const TOOLTIP_HEIGHT = 200;
const CURSOR_OFFSET = 16;

export function GiftCertificateRow({
  giftCertificate: gc,
}: GiftCertificateRowProps) {
  const router = useRouter();
  const [tooltip, setTooltip] = useState<{ x: number; y: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const href = `/gift-certificates/${gc.id}`;

  // Position the tooltip near the cursor, nudged back inside the viewport.
  function tooltipPosition(event: React.MouseEvent) {
    let x = event.clientX + CURSOR_OFFSET;
    let y = event.clientY + CURSOR_OFFSET;
    if (x + TOOLTIP_WIDTH + CURSOR_OFFSET > window.innerWidth) {
      x = event.clientX - TOOLTIP_WIDTH - CURSOR_OFFSET;
    }
    if (y + TOOLTIP_HEIGHT + CURSOR_OFFSET > window.innerHeight) {
      y = window.innerHeight - TOOLTIP_HEIGHT - CURSOR_OFFSET;
    }
    return { x, y };
  }

  return (
    <>
      <tr
        onClick={() => router.push(href)}
        onMouseMove={(event) => {
          if (!menuOpen) {
            setTooltip(tooltipPosition(event));
          }
        }}
        onMouseLeave={() => setTooltip(null)}
        className="cursor-pointer transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900"
      >
        <td className={`${cellClasses} font-mono font-medium text-zinc-900 dark:text-zinc-100`}>
          <Link
            href={href}
            onClick={(event) => event.stopPropagation()}
            className="underline-offset-2 hover:underline"
          >
            {gc.code}
          </Link>
        </td>
        <td className={`${cellClasses} text-right font-medium tabular-nums text-zinc-900 dark:text-zinc-100`}>
          {formatCurrency(gc.balance, gc.currencyCode)}
        </td>
        <td className={cellClasses}>{gc.recipient.name}</td>
        <td className={cellClasses}>{gc.recipient.email}</td>
        <td className={`${cellClasses} text-center`}>
          <RegisteredCustomerBadge value={gc.hasRegisteredCustomer} />
        </td>
        <td className={`${cellClasses} whitespace-nowrap`}>
          {formatDate(gc.purchaseDate)}
        </td>
        <td
          className={`${cellClasses} text-right`}
          onClick={(event) => event.stopPropagation()}
        >
          <GiftCertificateActionsMenu
            certificateCode={gc.code}
            canTransferToCredit={gc.hasRegisteredCustomer}
            onOpenChange={(open) => {
              setMenuOpen(open);
              if (open) {
                setTooltip(null);
              }
            }}
          />
        </td>
      </tr>

      {tooltip && !menuOpen && typeof document !== "undefined"
        ? createPortal(
            <GiftCertificateTooltip
              giftCertificate={gc}
              x={tooltip.x}
              y={tooltip.y}
            />,
            document.body,
          )
        : null}
    </>
  );
}
