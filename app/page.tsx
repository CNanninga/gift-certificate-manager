import { GiftCertificateTable } from "@/features/gift-certificates/components/gift-certificate-table";
import { mockGiftCertificates } from "@/features/gift-certificates/data/mock-gift-certificates";

export default function Home() {
  const giftCertificates = mockGiftCertificates;

  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Gift Certificates
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            {giftCertificates.length} certificate
            {giftCertificates.length === 1 ? "" : "s"} purchased on your store.
          </p>
        </header>

        <GiftCertificateTable giftCertificates={giftCertificates} />
      </main>
    </div>
  );
}
