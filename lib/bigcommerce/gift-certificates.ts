import type {
  GiftCertificate,
  GiftCertificateEmailTemplate,
  GiftCertificateStatus,
} from "@/types";
import {
  bigCommerceRequest,
  BigCommerceApiError,
} from "@/lib/bigcommerce/client";
import {
  filterGiftCertificates,
  sortGiftCertificates,
  type GiftCertificateFilters,
  type SortState,
} from "@/lib/gift-certificate-filters";

/** Raw gift certificate object as returned by the BigCommerce v2 API. */
interface BigCommerceGiftCertificate {
  id: number;
  code: string;
  to_name: string;
  to_email: string;
  from_name: string;
  from_email: string;
  amount: string;
  balance: string;
  currency_code: string;
  status: string;
  template: string;
  purchase_date: string;
}

const STATUS_BY_API: Record<string, GiftCertificateStatus> = {
  active: "Active",
  pending: "Pending",
  disabled: "Disabled",
  expired: "Expired",
};

const TEMPLATE_BY_API: Record<string, GiftCertificateEmailTemplate> = {
  "birthday.html": "Birthday",
  "boy.html": "Boy",
  "celebration.html": "Celebration",
  "christmas.html": "Christmas",
  "general.html": "General",
  "girl.html": "Girl",
};

/** v2 timestamps come as Unix seconds (string); normalize to an ISO string. */
function toIsoDate(value: string): string {
  if (!value) {
    return "";
  }
  const seconds = Number(value);
  const date = Number.isFinite(seconds) ? new Date(seconds * 1000) : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
}

function mapGiftCertificate(
  raw: BigCommerceGiftCertificate,
): GiftCertificate {
  return {
    id: String(raw.id),
    code: raw.code,
    currencyCode: raw.currency_code,
    originalAmount: Number.parseFloat(raw.amount),
    balance: Number.parseFloat(raw.balance),
    recipient: { name: raw.to_name, email: raw.to_email },
    sender: { name: raw.from_name, email: raw.from_email },
    emailTemplate: TEMPLATE_BY_API[raw.template] ?? "General",
    status: STATUS_BY_API[raw.status] ?? "Active",
    purchaseDate: toIsoDate(raw.purchase_date),
  };
}

export interface GiftCertificateQueryResult {
  /** The filtered, sorted page of results. */
  items: GiftCertificate[];
  /** Total certificates fetched from the store, before filtering. */
  totalCount: number;
}

/**
 * Fetches gift certificates from the store and applies the requested filter and
 * sort. The v2 list endpoint only sorts by `id`, so the full set is retrieved
 * (up to the API's max page size) and our richer filtering/sorting is applied
 * in code.
 */
export async function fetchGiftCertificates(
  filters: GiftCertificateFilters,
  sort: SortState,
): Promise<GiftCertificateQueryResult> {
  const raw = await bigCommerceRequest<BigCommerceGiftCertificate[]>(
    "/v2/gift_certificates?limit=250",
  );
  const all = raw.map(mapGiftCertificate);
  const items = sortGiftCertificates(
    filterGiftCertificates(all, filters),
    sort,
  );

  return { items, totalCount: all.length };
}

/** Looks up a single gift certificate by id; undefined when not found (404). */
export async function getGiftCertificateById(
  id: string,
): Promise<GiftCertificate | undefined> {
  try {
    const raw = await bigCommerceRequest<BigCommerceGiftCertificate>(
      `/v2/gift_certificates/${id}`,
    );
    return mapGiftCertificate(raw);
  } catch (error) {
    if (error instanceof BigCommerceApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}
