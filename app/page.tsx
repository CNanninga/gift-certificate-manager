import { GiftCertificateExplorer } from "@/components/gift-certificate-explorer";
import { mockGiftCertificates } from "@/data/mock-gift-certificates";

export default function Home() {
  return (
    <div className="min-h-full bg-zinc-50 dark:bg-black">
      <main className="mx-auto w-full max-w-6xl px-6 py-12">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
            Gift Certificates
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
            View, sort, and filter gift certificates purchased on your store.
          </p>
        </header>

        <GiftCertificateExplorer giftCertificates={mockGiftCertificates} />
      </main>
    </div>
  );
}
