import { Suspense } from "react";
import { GiftCertificatesPage } from "@/components/gift-certificates-page";
import { readSession } from "@/lib/session";

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function Home({ searchParams }: HomeProps) {
  // Reads the SameSite=None session cookie. Inside the BigCommerce iframe this
  // confirms the cross-site cookie is delivered on navigations to the app.
  const session = await readSession();

  return (
    <>
      <div
        style={{
          padding: "12px 24px",
          background: "#f5f5f5",
          borderBottom: "1px solid #e0e0e0",
          fontSize: "14px",
        }}
      >
        {session ? (
          <span>
            Signed in as <strong>{session.name}</strong> — store{" "}
            <strong>{session.storeHash}</strong>
          </span>
        ) : (
          <span>No active session.</span>
        )}
      </div>

      {/* GiftCertificatesPage reads dynamic search params, so it streams in
          behind a Suspense boundary. */}
      <Suspense
        fallback={
          <p style={{ padding: "48px", textAlign: "center" }}>
            Loading gift certificates…
          </p>
        }
      >
        <GiftCertificatesPage searchParams={searchParams} />
      </Suspense>
    </>
  );
}
