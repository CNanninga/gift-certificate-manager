/**
 * Domain types for the Gift Certificates feature.
 *
 * These describe the shape of a gift certificate as it will eventually be
 * returned by the store's API. For now they back the mock data in
 * `data/mock-gift-certificates.ts`.
 */

interface PartyBase {
  /** Name as printed on the gift certificate. */
  name: string;
  /** Email as printed on the gift certificate. */
  email: string;
  /** Whether this party matches a registered customer account on the store. */
  isRegisteredCustomer: boolean;
  /**
   * Name on the registered customer account; null when not registered. May
   * differ from the name printed on the gift certificate.
   */
  accountName: string | null;
}

/**
 * The purchaser. Their registered account is matched independently of the
 * gift certificate, so the account email can differ from the one printed on it.
 */
export interface SenderParty extends PartyBase {
  /** Email on the registered customer account; null when not registered. */
  accountEmail: string | null;
}

/**
 * The person the certificate was purchased for. Recipients are matched to a
 * registered customer account BY email, so the account email always equals the
 * email on the gift certificate — it isn't stored or shown separately.
 */
export type RecipientParty = PartyBase;

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
  /** Person the certificate was purchased for. */
  recipient: RecipientParty;
  /** Person who purchased the certificate. */
  sender: SenderParty;
  /** Email template the certificate was sent with. */
  emailTemplate: GiftCertificateEmailTemplate;
  /** Current lifecycle status; only "Active" certificates can be acted on. */
  status: GiftCertificateStatus;
  /** ISO 8601 timestamp of when the certificate was purchased. */
  purchaseDate: string;
}
