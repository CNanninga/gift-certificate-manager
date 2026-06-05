import type { GiftCertificate } from "@/types";

/**
 * Mock gift certificates used while the UI is built out ahead of real data.
 *
 * Kept deliberately separate from the components so the presentation layer
 * can be swapped onto a live data source without touching the table markup.
 */
export const mockGiftCertificates: GiftCertificate[] = [
  {
    id: "gc_01HRA8QY",
    code: "GC-4F9A-7C21",
    currencyCode: "USD",
    originalAmount: 100,
    balance: 100,
    recipient: {
      name: "Maya Chen",
      email: "maya.chen@example.com",
    },
    sender: {
      name: "Daniel Reyes",
      email: "daniel.reyes@example.com",
    },
    hasRegisteredCustomer: true,
    purchaseDate: "2026-01-14T16:32:00.000Z",
  },
  {
    id: "gc_01HRB2KD",
    code: "GC-8E1B-22F0",
    currencyCode: "USD",
    originalAmount: 50,
    balance: 18.75,
    recipient: {
      name: "Jordan Whitfield",
      email: "jordan.w@example.com",
    },
    sender: {
      name: "Priya Anand",
      email: "priya.anand@example.com",
    },
    hasRegisteredCustomer: false,
    purchaseDate: "2025-12-02T09:05:00.000Z",
  },
  {
    id: "gc_01HRC9MN",
    code: "GC-1D7C-9A45",
    currencyCode: "USD",
    originalAmount: 250,
    balance: 0,
    recipient: {
      name: "Sofia Marchetti",
      email: "sofia.marchetti@example.com",
    },
    sender: {
      name: "Liam O'Connor",
      email: "liam.oconnor@example.com",
    },
    hasRegisteredCustomer: true,
    purchaseDate: "2025-11-21T19:48:00.000Z",
  },
  {
    id: "gc_01HRD5TP",
    code: "GC-6B3E-04D8",
    currencyCode: "USD",
    originalAmount: 75,
    balance: 75,
    recipient: {
      name: "Aaron Goldberg",
      email: "aaron.goldberg@example.com",
    },
    sender: {
      name: "Emily Tran",
      email: "emily.tran@example.com",
    },
    hasRegisteredCustomer: false,
    purchaseDate: "2026-02-08T13:12:00.000Z",
  },
];
