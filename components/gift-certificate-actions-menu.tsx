"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

interface GiftCertificateActionsMenuProps {
  certificateCode: string;
  /** Whether "Transfer to Credit" is available (recipient has an account). */
  canTransferToCredit: boolean;
  /** Notifies the parent so it can suppress the row tooltip while open. */
  onOpenChange?: (open: boolean) => void;
}

// Matches the rendered menu (w-52) plus a rough height for flip detection.
const MENU_WIDTH = 208;
const MENU_HEIGHT = 96;

const menuItemClasses =
  "flex w-full items-center px-3 py-2 text-left text-sm text-zinc-700 hover:bg-zinc-100 disabled:cursor-not-allowed disabled:text-zinc-400 disabled:hover:bg-transparent dark:text-zinc-200 dark:hover:bg-zinc-800 dark:disabled:text-zinc-600";

/**
 * Row actions menu (Resend / Transfer to Credit). The dropdown is rendered in
 * a portal with fixed positioning so it escapes the table's clipped container.
 * Actions are placeholders for now and only close the menu.
 */
export function GiftCertificateActionsMenu({
  certificateCode,
  canTransferToCredit,
  onOpenChange,
}: GiftCertificateActionsMenuProps) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  );
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Keep the latest callback without making effects depend on its identity.
  const onOpenChangeRef = useRef(onOpenChange);
  useEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  }, [onOpenChange]);

  const close = useCallback(() => {
    setOpen(false);
    onOpenChangeRef.current?.(false);
  }, []);

  function handleToggle(event: React.MouseEvent) {
    event.stopPropagation();
    if (open) {
      close();
      return;
    }
    const rect = buttonRef.current?.getBoundingClientRect();
    if (rect) {
      const top =
        rect.bottom + MENU_HEIGHT > window.innerHeight
          ? rect.top - MENU_HEIGHT - 4
          : rect.bottom + 4;
      const left = Math.max(8, rect.right - MENU_WIDTH);
      setPosition({ top, left });
    }
    setOpen(true);
    onOpenChangeRef.current?.(true);
  }

  useEffect(() => {
    if (!open) {
      return;
    }
    function handlePointerDown(event: MouseEvent) {
      const target = event.target as Node;
      if (menuRef.current?.contains(target)) return;
      if (buttonRef.current?.contains(target)) return;
      close();
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        close();
      }
    }
    // Position is anchored to the button, so close if the page moves under it.
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open, close]);

  // Placeholder actions — wired to real behavior in a later phase.
  function handleResend(event: React.MouseEvent) {
    event.stopPropagation();
    close();
  }

  function handleTransfer(event: React.MouseEvent) {
    event.stopPropagation();
    close();
  }

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Actions for ${certificateCode}`}
        onClick={handleToggle}
        className="inline-flex items-center justify-center rounded-md p-1.5 text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="8" cy="3" r="1.5" />
          <circle cx="8" cy="8" r="1.5" />
          <circle cx="8" cy="13" r="1.5" />
        </svg>
      </button>

      {open && position && typeof document !== "undefined"
        ? createPortal(
            <div
              ref={menuRef}
              role="menu"
              style={{ top: position.top, left: position.left }}
              onClick={(event) => event.stopPropagation()}
              className="fixed z-50 w-52 overflow-hidden rounded-lg border border-zinc-200 bg-white py-1 shadow-lg dark:border-zinc-700 dark:bg-zinc-900"
            >
              <button
                type="button"
                role="menuitem"
                onClick={handleResend}
                className={menuItemClasses}
              >
                Resend
              </button>
              <button
                type="button"
                role="menuitem"
                onClick={handleTransfer}
                disabled={!canTransferToCredit}
                title={
                  canTransferToCredit
                    ? undefined
                    : "Recipient is not a registered customer"
                }
                className={menuItemClasses}
              >
                Transfer to Credit
              </button>
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
