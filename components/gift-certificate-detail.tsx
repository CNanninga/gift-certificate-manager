"use client";

import Link from "next/link";

interface GiftCertificateDetailProps {
  id: string;
}

/**
 * Client view for a single gift certificate. Placeholder for now; this is the
 * boundary where the BigDesign detail/management UI will live.
 */
export function GiftCertificateDetail({ id }: GiftCertificateDetailProps) {
  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-3xl px-6 py-12">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline dark:text-zinc-400 dark:hover:text-zinc-100"
        >
          ← Back to gift certificates
        </Link>

        <div className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-white p-12 text-center dark:border-zinc-700 dark:bg-zinc-950">
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
            Under construction
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            The detail and management view for{" "}
            <span className="font-mono text-zinc-900 dark:text-zinc-100">
              {id}
            </span>{" "}
            is coming soon.
          </p>
        </div>
      </main>
    </div>
  );
}
