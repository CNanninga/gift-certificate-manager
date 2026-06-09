import { Suspense } from "react";
import { GiftCertificatesPage } from "@/components/gift-certificates-page";

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function Home({ searchParams }: HomeProps) {
  // GiftCertificatesPage reads dynamic search params, so it streams in behind a
  // Suspense boundary while the static shell is served immediately.
  return (
    <Suspense
      fallback={
        <p className="p-12 text-center text-slate-500">
          Loading gift certificates…
        </p>
      }
    >
      <GiftCertificatesPage searchParams={searchParams} />
    </Suspense>
  );
}
