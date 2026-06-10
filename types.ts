/**
 * Domain types for the Gift Certificates feature. These mirror the fields
 * returned by the BigCommerce v2 Gift Certificates API (see
 * `lib/bigcommerce/gift-certificates.ts` for the mapping).
 */

/**
 * A party named on the gift certificate. The v2 API exposes only the name and
 * email printed on the certificate (`to_name`/`to_email`, `from_name`/
 * `from_email`); it does not indicate whether either party maps to a registered
 * customer account — that would require a separate Customers API lookup.
 */
export interface Party {
  /** Name as printed on the gift certificate. */
  name: string;
  /** Email as printed on the gift certificate. */
  email: string;
}

/** Lifecycle state of a gift certificate. */
export type GiftCertificateStatus =
  | "Active"
  | "Expired"
  | "Pending"
  | "Disabled";

/** Email template a gift certificate was sent with. */
export type GiftCertificateEmailTemplate =
  | "Birthday"
  | "Boy"
  | "Celebration"
  | "Christmas"
  | "General"
  | "Girl";

/** The selectable email templates, in display order. */
export const GIFT_CERTIFICATE_EMAIL_TEMPLATES: GiftCertificateEmailTemplate[] = [
  "Birthday",
  "Boy",
  "Celebration",
  "Christmas",
  "General",
  "Girl",
];

export interface GiftCertificate {
  /** Stable identifier used for routing to the detail view. */
  id: string;
  /** Human-facing gift certificate number printed on the certificate. */
  code: string;
  /** ISO 4217 currency code, e.g. "USD". */
  currencyCode: string;
  /** Amount the certificate was originally purchased for. */
  originalAmount: number;
  /** Amount currently remaining on the certificate. */
  balance: number;
  /** Person the certificate was purchased for (to_name / to_email). */
  recipient: Party;
  /** Person who purchased the certificate (from_name / from_email). */
  sender: Party;
  /** Email template the certificate was sent with. */
  emailTemplate: GiftCertificateEmailTemplate;
  /** Current lifecycle status; only "Active" certificates can be acted on. */
  status: GiftCertificateStatus;
  /** ISO 8601 timestamp of when the certificate was purchased. */
  purchaseDate: string;
}
