"use client";

import { useState } from "react";
import Link from "next/link";
import type { GiftCertificate } from "@/types";
import { GiftCertificateDetailsTab } from "@/components/gift-certificate-details-tab";
import { GiftCertificateBalanceTab } from "@/components/gift-certificate-balance-tab";

interface GiftCertificateDetailProps {
  giftCertificate: GiftCertificate;
}

const TABS = [
  { id: "details", title: "Details" },
  { id: "balance", title: "Balance" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/**
 * Client view for a single gift certificate, split into Details and Balance
 * tabs.
 */
export function GiftCertificateDetail({
  giftCertificate,
}: GiftCertificateDetailProps) {
  const [activeTab, setActiveTab] = useState<TabId>("details");

  return (
    <main className="bg-slate-50 px-4 py-6 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-4">
          <Link
            href="/"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            ← Back to gift certificates
          </Link>
        </div>

        <header className="mb-4">
          <h1 className="text-2xl font-bold text-slate-900">
            {giftCertificate.code}
          </h1>
          <p className="mt-1 text-slate-500">Manage this gift certificate.</p>
        </header>

        <div
          role="tablist"
          className="mb-4 flex gap-1 border-b border-slate-200"
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-6">
          {activeTab === "details" ? (
            <GiftCertificateDetailsTab giftCertificate={giftCertificate} />
          ) : (
            <GiftCertificateBalanceTab giftCertificate={giftCertificate} />
          )}
        </div>
      </div>
    </main>
  );
}
