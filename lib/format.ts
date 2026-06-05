/**
 * Presentation helpers for gift certificate data. Pure functions kept apart
 * from components so formatting is consistent and independently testable.
 */

/** Formats a monetary amount using the certificate's currency. */
export function formatCurrency(amount: number, currencyCode: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
  }).format(amount);
}

/** Formats an ISO timestamp as a short, locale-aware date. */
export function formatDate(isoDate: string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(isoDate));
}
