import type { ReactNode } from "react";

interface FieldRowProps {
  label: string;
  children: ReactNode;
}

/**
 * A single label/value row used across the detail panels. String/number values
 * are rendered as plain text; richer values (e.g. a Select) are rendered as-is.
 */
export function FieldRow({ label, children }: FieldRowProps) {
  const value =
    typeof children === "string" || typeof children === "number" ? (
      <span className="text-slate-900">{children}</span>
    ) : (
      children
    );

  return (
    <div className="flex items-center justify-between gap-6 py-2 not-last:border-b not-last:border-slate-100">
      <span className="text-sm text-slate-500">{label}</span>
      <div className="text-right text-sm">{value}</div>
    </div>
  );
}
