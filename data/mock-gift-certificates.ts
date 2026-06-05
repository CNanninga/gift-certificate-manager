import type { GiftCertificate } from "@/types";

/**
 * Mock gift certificates used while the UI is built out ahead of real data.
 *
 * Deliberately spans a broad mix of states: every lifecycle status, recipients
 * that are and are not registered customers, and balances ranging from fully
 * unspent through partially redeemed to fully depleted. In particular, the
 * Active set covers all four combinations of full/partial balance × registered/
 * unregistered recipient.
 *
 * Kept separate from the components so the presentation layer can be swapped
 * onto a live data source without touching the table markup.
 */
export const mockGiftCertificates: GiftCertificate[] = [
  // Active · full balance · registered
  {
    id: "gc_01HRA8QY",
    code: "GC-4F9A-7C21",
    currencyCode: "USD",
    originalAmount: 100,
    balance: 100,
    recipient: { name: "Maya Chen", email: "maya.chen@example.com" },
    sender: { name: "Daniel Reyes", email: "daniel.reyes@example.com" },
    hasRegisteredCustomer: true,
    status: "Active",
    purchaseDate: "2026-01-14T16:32:00.000Z",
  },
  // Active · full balance · not registered
  {
    id: "gc_01HRA9ZK",
    code: "GC-9C2D-5E10",
    currencyCode: "USD",
    originalAmount: 50,
    balance: 50,
    recipient: { name: "Noah Patel", email: "noah.patel@example.com" },
    sender: { name: "Grace Kim", email: "grace.kim@example.com" },
    hasRegisteredCustomer: false,
    status: "Active",
    purchaseDate: "2026-03-02T11:20:00.000Z",
  },
  // Active · partial balance · registered
  {
    id: "gc_01HRAB3M",
    code: "GC-3A77-B412",
    currencyCode: "USD",
    originalAmount: 200,
    balance: 84.3,
    recipient: { name: "Olivia Santos", email: "olivia.santos@example.com" },
    sender: { name: "Marcus Lee", email: "marcus.lee@example.com" },
    hasRegisteredCustomer: true,
    status: "Active",
    purchaseDate: "2026-02-19T08:45:00.000Z",
  },
  // Active · partial balance · not registered
  {
    id: "gc_01HRD5TP",
    code: "GC-6B3E-04D8",
    currencyCode: "USD",
    originalAmount: 75,
    balance: 22,
    recipient: { name: "Aaron Goldberg", email: "aaron.goldberg@example.com" },
    sender: { name: "Emily Tran", email: "emily.tran@example.com" },
    hasRegisteredCustomer: false,
    status: "Active",
    purchaseDate: "2026-02-08T13:12:00.000Z",
  },
  // Pending · full balance · registered
  {
    id: "gc_01HRAE7Q",
    code: "GC-2F88-6D31",
    currencyCode: "USD",
    originalAmount: 150,
    balance: 150,
    recipient: { name: "Hannah Brooks", email: "hannah.brooks@example.com" },
    sender: { name: "Tom Becker", email: "tom.becker@example.com" },
    hasRegisteredCustomer: true,
    status: "Pending",
    purchaseDate: "2026-03-10T15:05:00.000Z",
  },
  // Pending · partial balance · not registered
  {
    id: "gc_01HRB2KD",
    code: "GC-8E1B-22F0",
    currencyCode: "USD",
    originalAmount: 50,
    balance: 18.75,
    recipient: { name: "Jordan Whitfield", email: "jordan.w@example.com" },
    sender: { name: "Priya Anand", email: "priya.anand@example.com" },
    hasRegisteredCustomer: false,
    status: "Pending",
    purchaseDate: "2025-12-02T09:05:00.000Z",
  },
  // Expired · fully depleted · registered
  {
    id: "gc_01HRC9MN",
    code: "GC-1D7C-9A45",
    currencyCode: "USD",
    originalAmount: 250,
    balance: 0,
    recipient: { name: "Sofia Marchetti", email: "sofia.marchetti@example.com" },
    sender: { name: "Liam O'Connor", email: "liam.oconnor@example.com" },
    hasRegisteredCustomer: true,
    status: "Expired",
    purchaseDate: "2025-11-21T19:48:00.000Z",
  },
  // Expired · partial balance · not registered
  {
    id: "gc_01HRAF1T",
    code: "GC-7E45-1A09",
    currencyCode: "USD",
    originalAmount: 80,
    balance: 40,
    recipient: { name: "Diego Romero", email: "diego.romero@example.com" },
    sender: { name: "Sara Nilsson", email: "sara.nilsson@example.com" },
    hasRegisteredCustomer: false,
    status: "Expired",
    purchaseDate: "2025-10-15T14:30:00.000Z",
  },
  // Disabled · partial balance · registered
  {
    id: "gc_01HRAG8W",
    code: "GC-5C19-9F22",
    currencyCode: "USD",
    originalAmount: 500,
    balance: 320,
    recipient: { name: "Wei Zhang", email: "wei.zhang@example.com" },
    sender: { name: "Carla Mendez", email: "carla.mendez@example.com" },
    hasRegisteredCustomer: true,
    status: "Disabled",
    purchaseDate: "2026-01-29T10:10:00.000Z",
  },
];
