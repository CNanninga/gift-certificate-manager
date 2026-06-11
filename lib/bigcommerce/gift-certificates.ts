import type {
  GiftCertificate,
  GiftCertificateEmailTemplate,
  GiftCertificateStatus,
} from "@/types";
import {
  bigCommerceRequest,
  BigCommerceApiError,
} from "@/lib/bigcommerce/client";
import { getDataSourceMode } from "@/lib/bigcommerce/auth";
import { mockGiftCertificates } from "@/data/mock-gift-certificates";
import {
  emptyFilters,
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

/** Applies the requested filter/sort to a full set of certificates. */
function applyQuery(
  all: GiftCertificate[],
  filters: GiftCertificateFilters,
  sort: SortState,
): GiftCertificateQueryResult {
  const items = sortGiftCertificates(filterGiftCertificates(all, filters), sort);
  return { items, totalCount: all.length };
}

// --- Real REST API (used by both "static" and "multiTenant" modes) ---

// Fetch-level caching, configured per request type. Tags allow targeted
// revalidation (revalidateTag) once mutations land. Tune the windows freely.
/** Cache tag covering all gift certificate data (list + every detail). */
const GIFT_CERTIFICATES_TAG = "gift-certificates";
/** Per-certificate cache tag for targeted detail revalidation. */
const giftCertificateTag = (id: string) => `gift-certificate:${id}`;
/** The listing changes as certificates are created/redeemed. */
const LIST_REVALIDATE_SECONDS = 300;
/** A single certificate's balance/status can change on redemption. */
const DETAIL_REVALIDATE_SECONDS = 300;

/**
 * Maps the filters the v2 list endpoint supports as query params onto the API
 * parameter names, so they're applied server-side (not on the fetched page).
 * Supported: code, recipient name (to_name), recipient email (to_email).
 */
function buildListQuery(filters: GiftCertificateFilters): string {
  const params = new URLSearchParams({ limit: "250" });
  if (filters.code.trim()) {
    params.set("code", filters.code.trim());
  }
  if (filters.recipientName.trim()) {
    params.set("to_name", filters.recipientName.trim());
  }
  if (filters.recipientEmail.trim()) {
    params.set("to_email", filters.recipientEmail.trim());
  }
  return params.toString();
}

/**
 * The filters the v2 endpoint has NO query param for, so they must be applied
 * to the fetched results: status, balance range, and purchase-date range.
 * (Sorting is also done in code — the list endpoint only sorts by `id`, which
 * isn't one of our sortable columns.)
 */
function unsupportedFilters(
  filters: GiftCertificateFilters,
): GiftCertificateFilters {
  return {
    ...emptyFilters,
    status: filters.status,
    balanceMin: filters.balanceMin,
    balanceMax: filters.balanceMax,
    purchaseDateFrom: filters.purchaseDateFrom,
    purchaseDateTo: filters.purchaseDateTo,
  };
}

async function fetchFromApi(
  filters: GiftCertificateFilters,
  sort: SortState,
): Promise<GiftCertificateQueryResult> {
  const raw = await bigCommerceRequest<BigCommerceGiftCertificate[]>(
    `/v2/gift_certificates?${buildListQuery(filters)}`,
    {
      next: {
        revalidate: LIST_REVALIDATE_SECONDS,
        tags: [GIFT_CERTIFICATES_TAG],
      },
    },
  );
  const mapped = raw.map(mapGiftCertificate);
  const items = sortGiftCertificates(
    filterGiftCertificates(mapped, unsupportedFilters(filters)),
    sort,
  );
  return { items, totalCount: mapped.length };
}

async function getByIdFromApi(
  id: string,
): Promise<GiftCertificate | undefined> {
  try {
    const raw = await bigCommerceRequest<BigCommerceGiftCertificate>(
      `/v2/gift_certificates/${id}`,
      {
        next: {
          revalidate: DETAIL_REVALIDATE_SECONDS,
          tags: [GIFT_CERTIFICATES_TAG, giftCertificateTag(id)],
        },
      },
    );
    return mapGiftCertificate(raw);
  } catch (error) {
    if (error instanceof BigCommerceApiError && error.status === 404) {
      return undefined;
    }
    throw error;
  }
}

// --- Mock implementation (used by "mock" mode) ---

function fetchFromMock(
  filters: GiftCertificateFilters,
  sort: SortState,
): Promise<GiftCertificateQueryResult> {
  return Promise.resolve(applyQuery(mockGiftCertificates, filters, sort));
}

function getByIdFromMock(id: string): Promise<GiftCertificate | undefined> {
  return Promise.resolve(mockGiftCertificates.find((gc) => gc.id === id));
}

// --- Public API: three-way switch on the configured data source ---

/** Fetches gift certificates from the active data source, filtered and sorted. */
export async function fetchGiftCertificates(
  filters: GiftCertificateFilters,
  sort: SortState,
): Promise<GiftCertificateQueryResult> {
  switch (getDataSourceMode()) {
    case "mock":
      return fetchFromMock(filters, sort);
    case "static":
    case "multiTenant":
      // Both hit the real REST API; only the token source differs (see auth.ts:
      // static env token vs. per-store OAuth, the latter not yet implemented).
      return fetchFromApi(filters, sort);
  }
}

/** Looks up a single gift certificate by id; undefined when not found. */
export async function getGiftCertificateById(
  id: string,
): Promise<GiftCertificate | undefined> {
  switch (getDataSourceMode()) {
    case "mock":
      return getByIdFromMock(id);
    case "static":
    case "multiTenant":
      return getByIdFromApi(id);
  }
}
