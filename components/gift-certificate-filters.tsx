import type {
  GiftCertificateFilters,
  RegisteredFilter,
} from "@/lib/gift-certificate-filters";

interface GiftCertificateFiltersPanelProps {
  filters: GiftCertificateFilters;
  onChange: (filters: GiftCertificateFilters) => void;
  onReset: () => void;
  canReset: boolean;
}

const fieldLabelClasses =
  "block text-xs font-medium text-zinc-600 dark:text-zinc-400";

const inputClasses =
  "mt-1 block w-full rounded-md border border-zinc-300 bg-white px-3 py-1.5 text-sm text-zinc-900 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500 dark:focus:ring-zinc-100/10";

/** Parses a numeric input, treating blank/invalid values as "no bound". */
function parseBound(value: string): number | null {
  if (value.trim() === "") {
    return null;
  }
  const parsed = Number.parseFloat(value);
  return Number.isNaN(parsed) ? null : parsed;
}

/**
 * Controlled filter form covering every column. Text columns match by
 * substring, the registered-customer column is a tri-state select, and
 * balance and purchase date are expressed as inclusive ranges.
 */
export function GiftCertificateFiltersPanel({
  filters,
  onChange,
  onReset,
  canReset,
}: GiftCertificateFiltersPanelProps) {
  // Apply a single field change without disturbing the others.
  function update<K extends keyof GiftCertificateFilters>(
    key: K,
    value: GiftCertificateFilters[K],
  ) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <section
      aria-label="Filter gift certificates"
      className="mb-6 rounded-xl border border-zinc-200 bg-white p-4 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Filters
        </h2>
        <button
          type="button"
          onClick={onReset}
          disabled={!canReset}
          className="text-xs font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline disabled:cursor-not-allowed disabled:text-zinc-300 disabled:no-underline dark:text-zinc-400 dark:hover:text-zinc-100 dark:disabled:text-zinc-700"
        >
          Clear all
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="filter-code" className={fieldLabelClasses}>
            Certificate #
          </label>
          <input
            id="filter-code"
            type="text"
            value={filters.code}
            onChange={(e) => update("code", e.target.value)}
            placeholder="e.g. GC-4F9A"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="filter-recipient-name" className={fieldLabelClasses}>
            Recipient
          </label>
          <input
            id="filter-recipient-name"
            type="text"
            value={filters.recipientName}
            onChange={(e) => update("recipientName", e.target.value)}
            placeholder="Name contains…"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="filter-recipient-email" className={fieldLabelClasses}>
            Recipient Email
          </label>
          <input
            id="filter-recipient-email"
            type="text"
            value={filters.recipientEmail}
            onChange={(e) => update("recipientEmail", e.target.value)}
            placeholder="Email contains…"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="filter-registered" className={fieldLabelClasses}>
            Registered Customer
          </label>
          <select
            id="filter-registered"
            value={filters.registered}
            onChange={(e) =>
              update("registered", e.target.value as RegisteredFilter)
            }
            className={inputClasses}
          >
            <option value="all">Any</option>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </select>
        </div>

        <div>
          <span className={fieldLabelClasses}>Balance range</span>
          <div className="mt-1 flex items-center gap-2">
            <input
              aria-label="Minimum balance"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={filters.balanceMin ?? ""}
              onChange={(e) => update("balanceMin", parseBound(e.target.value))}
              placeholder="Min"
              className={inputClasses}
            />
            <span className="text-zinc-400">–</span>
            <input
              aria-label="Maximum balance"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              value={filters.balanceMax ?? ""}
              onChange={(e) => update("balanceMax", parseBound(e.target.value))}
              placeholder="Max"
              className={inputClasses}
            />
          </div>
        </div>

        <div>
          <span className={fieldLabelClasses}>Purchase date range</span>
          <div className="mt-1 flex items-center gap-2">
            <input
              aria-label="Purchased on or after"
              type="date"
              value={filters.purchaseDateFrom}
              onChange={(e) => update("purchaseDateFrom", e.target.value)}
              className={inputClasses}
            />
            <span className="text-zinc-400">–</span>
            <input
              aria-label="Purchased on or before"
              type="date"
              value={filters.purchaseDateTo}
              onChange={(e) => update("purchaseDateTo", e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
