"use client";

import { Button, Input, Panel, Select } from "@/components/ui";
import {
  GIFT_CERTIFICATE_STATUSES,
  type GiftCertificateFilters,
  type RegisteredFilter,
  type StatusFilter,
} from "@/lib/gift-certificate-filters";

interface GiftCertificateFiltersPanelProps {
  filters: GiftCertificateFilters;
  onChange: (filters: GiftCertificateFilters) => void;
  onReset: () => void;
  canReset: boolean;
}

/** Parses a numeric input, treating blank/invalid values as "no bound". */
function parseBound(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Filter controls for every column, built with custom Tailwind form components.
 * Text columns match by substring, the registered-customer and status columns
 * are selects, and balance and purchase date are expressed as inclusive ranges
 * (date ranges use native `type="date"` inputs that already emit `yyyy-mm-dd`).
 */
export function GiftCertificateFiltersPanel({
  filters,
  onChange,
  onReset,
  canReset,
}: GiftCertificateFiltersPanelProps) {
  function update<K extends keyof GiftCertificateFilters>(
    key: K,
    value: GiftCertificateFilters[K],
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <Panel
      className="mb-6"
      header="Filters"
      action={
        <Button variant="subtle" onClick={onReset} disabled={!canReset}>
          Clear filters
        </Button>
      }
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Input
          label="Certificate #"
          placeholder="e.g. GC-4F9A"
          value={filters.code}
          onChange={(event) => update("code", event.target.value)}
        />
        <Input
          label="Recipient"
          placeholder="Name contains…"
          value={filters.recipientName}
          onChange={(event) => update("recipientName", event.target.value)}
        />
        <Input
          label="Recipient email"
          placeholder="Email contains…"
          value={filters.recipientEmail}
          onChange={(event) => update("recipientEmail", event.target.value)}
        />
        <Select<RegisteredFilter>
          label="Registered customer"
          options={[
            { value: "all", label: "Any" },
            { value: "yes", label: "Yes" },
            { value: "no", label: "No" },
          ]}
          value={filters.registered}
          onValueChange={(value) => update("registered", value)}
        />
        <Select<StatusFilter>
          label="Status"
          options={[
            { value: "all", label: "Any" },
            ...GIFT_CERTIFICATE_STATUSES.map((status) => ({
              value: status,
              label: status,
            })),
          ]}
          value={filters.status}
          onValueChange={(value) => update("status", value)}
        />
        <Input
          label="Min balance"
          type="number"
          min={0}
          step={0.01}
          placeholder="Min"
          value={filters.balanceMin === null ? "" : String(filters.balanceMin)}
          onChange={(event) =>
            update("balanceMin", parseBound(event.target.value))
          }
        />
        <Input
          label="Max balance"
          type="number"
          min={0}
          step={0.01}
          placeholder="Max"
          value={filters.balanceMax === null ? "" : String(filters.balanceMax)}
          onChange={(event) =>
            update("balanceMax", parseBound(event.target.value))
          }
        />
        <Input
          label="Purchased after"
          type="date"
          value={filters.purchaseDateFrom}
          onChange={(event) => update("purchaseDateFrom", event.target.value)}
        />
        <Input
          label="Purchased before"
          type="date"
          value={filters.purchaseDateTo}
          onChange={(event) => update("purchaseDateTo", event.target.value)}
        />
      </div>
    </Panel>
  );
}
