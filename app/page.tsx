import { Suspense } from "react";
import { after } from "next/server";
import { GiftCertificatesPage } from "@/components/gift-certificates-page";

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default function Home({ searchParams }: HomeProps) {
  // Test of `after`: schedule work to run once the response has finished. A
  // short delay makes the deferral observable in the server log (the event
  // lands a couple seconds after the response) while staying well within the
  // Workers post-response execution window.
  after(async () => {
    await new Promise((resolve) => setTimeout(resolve, 2_000));
    console.log("Delayed event");
  });

  // GiftCertificatesPage reads dynamic search params, so it streams in behind a
  // Suspense boundary while the static shell is served immediately.
  return (
    <Suspense
      fallback={
        <p style={{ padding: "48px", textAlign: "center" }}>
          Loading gift certificates…
        </p>
      }
    >
      <GiftCertificatesPage searchParams={searchParams} />
    </Suspense>
  );
}
