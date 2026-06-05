/**
 * Renders the Yes/No indicator for whether a recipient maps to a registered
 * customer account. Visually distinct so administrators can scan the column.
 */
export function RegisteredCustomerBadge({ value }: { value: boolean }) {
  const label = value ? "Yes" : "No";

  const classes = value
    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-400 dark:ring-emerald-400/20"
    : "bg-zinc-100 text-zinc-600 ring-zinc-500/20 dark:bg-zinc-800 dark:text-zinc-400 dark:ring-zinc-400/20";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${classes}`}
    >
      {label}
    </span>
  );
}
