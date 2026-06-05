import type { GiftCertificate } from "@/types";

/**
 * Pure filtering and sorting logic for the gift certificate listing. Kept out
 * of the components so the rules are consistent and independently testable.
 */

export type SortableColumn =
  | "code"
  | "balance"
  | "recipientName"
  | "recipientEmail"
  | "hasRegisteredCustomer"
  | "purchaseDate";

export type SortDirection = "asc" | "desc";

export interface SortState {
  column: SortableColumn;
  direction: SortDirection;
}

export type RegisteredFilter = "all" | "yes" | "no";

export interface GiftCertificateFilters {
  code: string;
  recipientName: string;
  recipientEmail: string;
  registered: RegisteredFilter;
  /** Inclusive lower/upper bounds on remaining balance; null means unbounded. */
  balanceMin: number | null;
  balanceMax: number | null;
  /** Inclusive date range as `yyyy-mm-dd` strings; "" means unbounded. */
  purchaseDateFrom: string;
  purchaseDateTo: string;
}

export const emptyFilters: GiftCertificateFilters = {
  code: "",
  recipientName: "",
  recipientEmail: "",
  registered: "all",
  balanceMin: null,
  balanceMax: null,
  purchaseDateFrom: "",
  purchaseDateTo: "",
};

/** True when no filter is narrowing the result set. */
export function hasActiveFilters(filters: GiftCertificateFilters): boolean {
  return (
    filters.code.trim() !== "" ||
    filters.recipientName.trim() !== "" ||
    filters.recipientEmail.trim() !== "" ||
    filters.registered !== "all" ||
    filters.balanceMin !== null ||
    filters.balanceMax !== null ||
    filters.purchaseDateFrom !== "" ||
    filters.purchaseDateTo !== ""
  );
}

function includesInsensitive(haystack: string, needle: string): boolean {
  return haystack.toLowerCase().includes(needle.trim().toLowerCase());
}

export function filterGiftCertificates(
  items: GiftCertificate[],
  filters: GiftCertificateFilters,
): GiftCertificate[] {
  // Date range bounds: include the whole "to" day by using its end of day.
  const fromTime = filters.purchaseDateFrom
    ? new Date(`${filters.purchaseDateFrom}T00:00:00`).getTime()
    : null;
  const toTime = filters.purchaseDateTo
    ? new Date(`${filters.purchaseDateTo}T23:59:59.999`).getTime()
    : null;

  return items.filter((gc) => {
    if (filters.code && !includesInsensitive(gc.code, filters.code)) {
      return false;
    }
    if (
      filters.recipientName &&
      !includesInsensitive(gc.recipient.name, filters.recipientName)
    ) {
      return false;
    }
    if (
      filters.recipientEmail &&
      !includesInsensitive(gc.recipient.email, filters.recipientEmail)
    ) {
      return false;
    }
    if (filters.registered === "yes" && !gc.hasRegisteredCustomer) {
      return false;
    }
    if (filters.registered === "no" && gc.hasRegisteredCustomer) {
      return false;
    }
    if (filters.balanceMin !== null && gc.balance < filters.balanceMin) {
      return false;
    }
    if (filters.balanceMax !== null && gc.balance > filters.balanceMax) {
      return false;
    }

    const purchaseTime = new Date(gc.purchaseDate).getTime();
    if (fromTime !== null && purchaseTime < fromTime) {
      return false;
    }
    if (toTime !== null && purchaseTime > toTime) {
      return false;
    }

    return true;
  });
}

/** Returns the comparable value for a column on a given record. */
function sortValue(
  gc: GiftCertificate,
  column: SortableColumn,
): string | number {
  switch (column) {
    case "code":
      return gc.code;
    case "balance":
      return gc.balance;
    case "recipientName":
      return gc.recipient.name;
    case "recipientEmail":
      return gc.recipient.email;
    case "hasRegisteredCustomer":
      return gc.hasRegisteredCustomer ? 1 : 0;
    case "purchaseDate":
      return new Date(gc.purchaseDate).getTime();
  }
}

export function sortGiftCertificates(
  items: GiftCertificate[],
  sort: SortState,
): GiftCertificate[] {
  const factor = sort.direction === "asc" ? 1 : -1;

  // Copy before sorting so callers' arrays aren't mutated in place.
  return [...items].sort((a, b) => {
    const aValue = sortValue(a, sort.column);
    const bValue = sortValue(b, sort.column);

    if (typeof aValue === "string" && typeof bValue === "string") {
      return aValue.localeCompare(bValue) * factor;
    }
    return ((aValue as number) - (bValue as number)) * factor;
  });
}
