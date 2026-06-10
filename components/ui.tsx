"use client";

import {
  forwardRef,
  useEffect,
  type ButtonHTMLAttributes,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
} from "react";

/* -------------------------------------------------------------------------- */
/* Button                                                                     */
/* -------------------------------------------------------------------------- */

type ButtonVariant = "primary" | "secondary" | "subtle" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  isLoading?: boolean;
}

const BUTTON_VARIANTS: Record<ButtonVariant, string> = {
  primary:
    "bg-blue-600 text-white hover:bg-blue-700 border border-transparent",
  secondary:
    "bg-white text-blue-700 hover:bg-blue-50 border border-blue-300",
  subtle:
    "bg-transparent text-slate-700 hover:bg-slate-100 border border-transparent",
  danger: "bg-red-600 text-white hover:bg-red-700 border border-transparent",
};

/** Themed button. Disabled and loading states share the same dimmed styling. */
export function Button({
  variant = "secondary",
  isLoading = false,
  disabled,
  children,
  className = "",
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${BUTTON_VARIANTS[variant]} ${className}`}
    >
      {isLoading && (
        <span
          aria-hidden
          className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent"
        />
      )}
      {children}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Input                                                                      */
/* -------------------------------------------------------------------------- */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

/** Labeled text/number input. */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, id, className = "", ...rest },
  ref,
) {
  const inputId = id ?? rest.name;
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-medium text-slate-700">{label}</span>}
      <input
        ref={ref}
        id={inputId}
        className={`rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${className}`}
        {...rest}
      />
    </label>
  );
});

/* -------------------------------------------------------------------------- */
/* Select                                                                     */
/* -------------------------------------------------------------------------- */

export interface SelectOption<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string>
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "onChange" | "value"> {
  label?: string;
  value: T;
  options: SelectOption<T>[];
  onValueChange: (value: T) => void;
}

/** Labeled native select with a typed change handler. */
export function Select<T extends string>({
  label,
  value,
  options,
  onValueChange,
  className = "",
  ...rest
}: SelectProps<T>) {
  return (
    <label className="flex flex-col gap-1 text-sm">
      {label && <span className="font-medium text-slate-700">{label}</span>}
      <select
        value={value}
        onChange={(event) => onValueChange(event.target.value as T)}
        className={`rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${className}`}
        {...rest}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

/* -------------------------------------------------------------------------- */
/* Badge                                                                      */
/* -------------------------------------------------------------------------- */

export type BadgeVariant = "success" | "warning" | "secondary" | "danger";

const BADGE_VARIANTS: Record<BadgeVariant, string> = {
  success: "bg-green-100 text-green-800",
  warning: "bg-amber-100 text-amber-800",
  secondary: "bg-slate-100 text-slate-700",
  danger: "bg-red-100 text-red-800",
};

/** Small status pill. */
export function Badge({
  label,
  variant = "secondary",
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${BADGE_VARIANTS[variant]}`}
    >
      {label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Panel                                                                      */
/* -------------------------------------------------------------------------- */

interface PanelProps {
  header?: ReactNode;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Card container with an optional header row and trailing action. */
export function Panel({ header, action, children, className = "" }: PanelProps) {
  return (
    <section
      className={`rounded-lg border border-slate-200 bg-white shadow-sm ${className}`}
    >
      {(header || action) && (
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          {header && (
            <h2 className="text-base font-semibold text-slate-900">{header}</h2>
          )}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Modal                                                                      */
/* -------------------------------------------------------------------------- */

interface ModalProps {
  isOpen: boolean;
  header: string;
  onClose: () => void;
  children: ReactNode;
  actions: ReactNode;
}

/** Centered confirmation dialog with a backdrop. */
export function Modal({
  isOpen,
  header,
  onClose,
  children,
  actions,
}: ModalProps) {
  useEffect(() => {
    if (!isOpen) {
      return;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={header}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-lg bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">{header}</h2>
        </div>
        <div className="px-5 py-4 text-sm text-slate-700">{children}</div>
        <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
          {actions}
        </div>
      </div>
    </div>
  );
}
