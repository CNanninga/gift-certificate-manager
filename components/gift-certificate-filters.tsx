"use client";

import { Datepicker, Grid, Input, Panel, Select } from "@bigcommerce/big-design";
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
 * A `yyyy-mm-dd` filter value as the local-midnight string the picker wants.
 * Returns undefined (not "") when empty, since the picker does `new Date(value)`
 * and an empty string would become an Invalid Date.
 */
function toPickerValue(ymd: string): string | undefined {
  return ymd ? `${ymd}T00:00:00` : undefined;
}

/** Converts the picker's ISO output back to a local `yyyy-mm-dd` string. */
function fromPickerValue(iso: string): string {
  if (!iso) {
    return "";
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/**
 * Filter controls for every column, built with BigDesign form components.
 * Text columns match by substring, the registered-customer column is a select,
 * and balance and purchase date are expressed as inclusive ranges.
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
      header="Filters"
      action={{
        text: "Clear filters",
        variant: "subtle",
        onClick: onReset,
        disabled: !canReset,
      }}
    >
      <Grid
        gridColumns={{ mobile: "1fr", tablet: "1fr 1fr", desktop: "repeat(4, 1fr)" }}
        gridGap="16px"
      >
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
            { value: "all", content: "Any" },
            { value: "yes", content: "Yes" },
            { value: "no", content: "No" },
          ]}
          value={filters.registered}
          onOptionChange={(value) => update("registered", value ?? "all")}
        />
        <Select<StatusFilter>
          label="Status"
          options={[
            { value: "all", content: "Any" },
            ...GIFT_CERTIFICATE_STATUSES.map((status) => ({
              value: status,
              content: status,
            })),
          ]}
          value={filters.status}
          onOptionChange={(value) => update("status", value ?? "all")}
        />
        <Input
          label="Min balance"
          type="number"
          min={0}
          step={0.01}
          placeholder="Min"
          value={filters.balanceMin === null ? "" : String(filters.balanceMin)}
          onChange={(event) => update("balanceMin", parseBound(event.target.value))}
        />
        <Input
          label="Max balance"
          type="number"
          min={0}
          step={0.01}
          placeholder="Max"
          value={filters.balanceMax === null ? "" : String(filters.balanceMax)}
          onChange={(event) => update("balanceMax", parseBound(event.target.value))}
        />
        <Datepicker
          label="Purchased after"
          value={toPickerValue(filters.purchaseDateFrom)}
          onDateChange={(iso) =>
            update("purchaseDateFrom", fromPickerValue(iso))
          }
        />
        <Datepicker
          label="Purchased before"
          value={toPickerValue(filters.purchaseDateTo)}
          onDateChange={(iso) => update("purchaseDateTo", fromPickerValue(iso))}
        />
      </Grid>
    </Panel>
  );
}
