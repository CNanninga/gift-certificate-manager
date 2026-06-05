/**
 * Domain types for the Gift Certificates feature.
 *
 * These describe the shape of a gift certificate as it will eventually be
 * returned by the store's API. For now they back the mock data in
 * `data/mock-gift-certificates.ts`.
 */

export interface Party {
  name: string;
  email: string;
}

/** Lifecycle state of a gift certificate. */
export type GiftCertificateStatus =
  | "Active"
  | "Expired"
  | "Pending"
  | "Disabled";

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
  recipient: Party;
  /** Person who purchased the certificate. */
  sender: Party;
  /**
   * Whether the recipient's email matches a registered customer account on
   * the store. Drives the ability to transfer the balance to store credit.
   */
  hasRegisteredCustomer: boolean;
  /** Current lifecycle status; only "Active" certificates can be acted on. */
  status: GiftCertificateStatus;
  /** ISO 8601 timestamp of when the certificate was purchased. */
  purchaseDate: string;
}
