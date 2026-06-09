import type { GiftCertificate } from "@/types";
import {
  filterGiftCertificates,
  sortGiftCertificates,
  type GiftCertificateFilters,
  type SortState,
} from "@/lib/gift-certificate-filters";

/**
 * Mock gift certificates used while the UI is built out ahead of real data.
 *
 * Deliberately spans a broad mix of states: every lifecycle status, senders
 * and recipients that are and are not registered customers, balances ranging
 * from fully unspent through partially redeemed to fully depleted, and a
 * variety of email templates. The Active set covers all four combinations of
 * full/partial balance × registered/unregistered recipient. Several registered
 * parties have account names/emails that differ from the details printed on the
 * certificate.
 *
 * Recipients are matched to a registered account by email, so they carry no
 * separate account email; senders do.
 *
 * Kept separate from the components so the presentation layer can be swapped
 * onto a live data source without touching the table markup.
 */

/** Looks up a single gift certificate by id. */
export function getGiftCertificateById(
  id: string,
): GiftCertificate | undefined {
  return mockGiftCertificates.find((giftCertificate) => giftCertificate.id === id);
}

export interface GiftCertificateQueryResult {
  /** The filtered, sorted page of results. */
  items: GiftCertificate[];
  /** Total certificates in the store, before filtering. */
  totalCount: number;
}

/**
 * Simulates a backing-store query: the filter and sort are applied as part of
 * the fetch (as a real WHERE/ORDER BY would be), not after the fact on a fully
 * loaded set. An artificial randomized latency makes the effect of caching
 * observable; the returned data is otherwise deterministic for given inputs.
 */
export async function fetchGiftCertificates(
  filters: GiftCertificateFilters,
  sort: SortState,
): Promise<GiftCertificateQueryResult> {
  const delayMs = 300 + Math.floor(Math.random() * 900);
  await new Promise((resolve) => setTimeout(resolve, delayMs));

  const items = sortGiftCertificates(
    filterGiftCertificates(mockGiftCertificates, filters),
    sort,
  );

  return { items, totalCount: mockGiftCertificates.length };
}

export const mockGiftCertificates: GiftCertificate[] = [
  // Active · full balance · registered recipient (account name differs)
  {
    id: "gc_01HRA8QY",
    code: "GC-4F9A-7C21",
    currencyCode: "USD",
    originalAmount: 100,
    balance: 100,
    emailTemplate: "Birthday",
    recipient: {
      name: "Maya Chen",
      email: "maya.chen@example.com",
      isRegisteredCustomer: true,
      accountName: "Maya L. Chen",
    },
    sender: {
      name: "Daniel Reyes",
      email: "daniel.reyes@example.com",
      isRegisteredCustomer: true,
      accountName: "Daniel Reyes",
      accountEmail: "daniel.reyes@example.com",
    },
    status: "Active",
    purchaseDate: "2026-01-14T16:32:00.000Z",
  },
  // Active · full balance · unregistered recipient · registered sender (name + email differ)
  {
    id: "gc_01HRA9ZK",
    code: "GC-9C2D-5E10",
    currencyCode: "USD",
    originalAmount: 50,
    balance: 50,
    emailTemplate: "Celebration",
    recipient: {
      name: "Noah Patel",
      email: "noah.patel@example.com",
      isRegisteredCustomer: false,
      accountName: null,
    },
    sender: {
      name: "Grace Kim",
      email: "grace.kim@example.com",
      isRegisteredCustomer: true,
      accountName: "Grace H. Kim",
      accountEmail: "g.kim@personal.example.com",
    },
    status: "Active",
    purchaseDate: "2026-03-02T11:20:00.000Z",
  },
  // Active · partial balance · registered recipient (account name differs)
  {
    id: "gc_01HRAB3M",
    code: "GC-3A77-B412",
    currencyCode: "USD",
    originalAmount: 200,
    balance: 84.3,
    emailTemplate: "General",
    recipient: {
      name: "Olivia Santos",
      email: "olivia.santos@example.com",
      isRegisteredCustomer: true,
      accountName: "Olivia Santos-Park",
    },
    sender: {
      name: "Marcus Lee",
      email: "marcus.lee@example.com",
      isRegisteredCustomer: false,
      accountName: null,
      accountEmail: null,
    },
    status: "Active",
    purchaseDate: "2026-02-19T08:45:00.000Z",
  },
  // Active · partial balance · unregistered recipient · registered sender (matches)
  {
    id: "gc_01HRD5TP",
    code: "GC-6B3E-04D8",
    currencyCode: "USD",
    originalAmount: 75,
    balance: 22,
    emailTemplate: "Boy",
    recipient: {
      name: "Aaron Goldberg",
      email: "aaron.goldberg@example.com",
      isRegisteredCustomer: false,
      accountName: null,
    },
    sender: {
      name: "Emily Tran",
      email: "emily.tran@example.com",
      isRegisteredCustomer: true,
      accountName: "Emily Tran",
      accountEmail: "emily.tran@example.com",
    },
    status: "Active",
    purchaseDate: "2026-02-08T13:12:00.000Z",
  },
  // Pending · full balance · registered recipient · unregistered sender
  {
    id: "gc_01HRAE7Q",
    code: "GC-2F88-6D31",
    currencyCode: "USD",
    originalAmount: 150,
    balance: 150,
    emailTemplate: "Girl",
    recipient: {
      name: "Hannah Brooks",
      email: "hannah.brooks@example.com",
      isRegisteredCustomer: true,
      accountName: "Hannah Brooks",
    },
    sender: {
      name: "Tom Becker",
      email: "tom.becker@example.com",
      isRegisteredCustomer: false,
      accountName: null,
      accountEmail: null,
    },
    status: "Pending",
    purchaseDate: "2026-03-10T15:05:00.000Z",
  },
  // Pending · partial balance · unregistered recipient · registered sender (email differs)
  {
    id: "gc_01HRB2KD",
    code: "GC-8E1B-22F0",
    currencyCode: "USD",
    originalAmount: 50,
    balance: 18.75,
    emailTemplate: "General",
    recipient: {
      name: "Jordan Whitfield",
      email: "jordan.w@example.com",
      isRegisteredCustomer: false,
      accountName: null,
    },
    sender: {
      name: "Priya Anand",
      email: "priya.anand@example.com",
      isRegisteredCustomer: true,
      accountName: "Priya Anand",
      accountEmail: "priya@anandfamily.example.com",
    },
    status: "Pending",
    purchaseDate: "2025-12-02T09:05:00.000Z",
  },
  // Expired · fully depleted · registered recipient · registered sender (both match)
  {
    id: "gc_01HRC9MN",
    code: "GC-1D7C-9A45",
    currencyCode: "USD",
    originalAmount: 250,
    balance: 0,
    emailTemplate: "Christmas",
    recipient: {
      name: "Sofia Marchetti",
      email: "sofia.marchetti@example.com",
      isRegisteredCustomer: true,
      accountName: "Sofia Marchetti",
    },
    sender: {
      name: "Liam O'Connor",
      email: "liam.oconnor@example.com",
      isRegisteredCustomer: true,
      accountName: "Liam O'Connor",
      accountEmail: "liam.oconnor@example.com",
    },
    status: "Expired",
    purchaseDate: "2025-11-21T19:48:00.000Z",
  },
  // Expired · partial balance · unregistered (both parties)
  {
    id: "gc_01HRAF1T",
    code: "GC-7E45-1A09",
    currencyCode: "USD",
    originalAmount: 80,
    balance: 40,
    emailTemplate: "Celebration",
    recipient: {
      name: "Diego Romero",
      email: "diego.romero@example.com",
      isRegisteredCustomer: false,
      accountName: null,
    },
    sender: {
      name: "Sara Nilsson",
      email: "sara.nilsson@example.com",
      isRegisteredCustomer: false,
      accountName: null,
      accountEmail: null,
    },
    status: "Expired",
    purchaseDate: "2025-10-15T14:30:00.000Z",
  },
  // Disabled · partial balance · registered recipient · registered sender (name + email differ)
  {
    id: "gc_01HRAG8W",
    code: "GC-5C19-9F22",
    currencyCode: "USD",
    originalAmount: 500,
    balance: 320,
    emailTemplate: "Christmas",
    recipient: {
      name: "Wei Zhang",
      email: "wei.zhang@example.com",
      isRegisteredCustomer: true,
      accountName: "Wei Zhang",
    },
    sender: {
      name: "Carla Mendez",
      email: "carla.mendez@example.com",
      isRegisteredCustomer: true,
      accountName: "Carla R. Mendez",
      accountEmail: "carla.mendez@work.example.com",
    },
    status: "Disabled",
    purchaseDate: "2026-01-29T10:10:00.000Z",
  },
];
