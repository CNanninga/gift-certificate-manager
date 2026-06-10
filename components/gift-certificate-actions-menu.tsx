"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GiftCertificate } from "@/types";

interface GiftCertificateActionsMenuProps {
  giftCertificate: GiftCertificate;
}

interface ActionItem {
  content: string;
  disabled?: boolean;
  title?: string;
  onClick: () => void;
}

/**
 * Row actions menu built as a simple dropdown. Only "View details" is always
 * available; "Resend" requires an Active certificate, and "Transfer to Credit"
 * additionally requires a registered customer. Disabled actions explain
 * themselves via a native title tooltip. Resend/Transfer are placeholders.
 */
export function GiftCertificateActionsMenu({
  giftCertificate: gc,
}: GiftCertificateActionsMenuProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const isActive = gc.status === "Active";

  useEffect(() => {
    if (!open) {
      return;
    }
    const onClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [open]);

  const items: ActionItem[] = [
    {
      content: "View details",
      onClick: () => router.push(`/gift-certificates/${gc.id}`),
    },
    {
      content: "Resend",
      disabled: !isActive,
      title: isActive ? undefined : "Only active gift certificates can be resent",
      onClick: () => {
        // Placeholder — wired up in a later phase.
      },
    },
    {
      content: "Transfer to Credit",
      disabled: !isActive,
      title: !isActive
        ? "Only active gift certificates can be transferred"
        : undefined,
      onClick: () => {
        // Placeholder — wired up in a later phase.
      },
    },
  ];

  return (
    <div ref={containerRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-label={`Actions for ${gc.code}`}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="rounded-md px-2 py-1 text-lg leading-none text-slate-500 hover:bg-slate-100 hover:text-slate-700"
      >
        ⋯
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 z-10 mt-1 w-48 overflow-hidden rounded-md border border-slate-200 bg-white py-1 shadow-lg"
        >
          {items.map((item) => (
            <button
              key={item.content}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              title={item.title}
              onClick={() => {
                if (item.disabled) {
                  return;
                }
                setOpen(false);
                item.onClick();
              }}
              className="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400 disabled:hover:bg-transparent"
            >
              {item.content}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
