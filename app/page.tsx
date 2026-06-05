import { GiftCertificateExplorer } from "@/components/gift-certificate-explorer";
import { mockGiftCertificates } from "@/data/mock-gift-certificates";
import {
  filterGiftCertificates,
  searchParamsToFilters,
  searchParamsToSort,
  sortGiftCertificates,
} from "@/lib/gift-certificate-filters";

interface HomeProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

/** Normalizes Next's searchParams object into a URLSearchParams instance. */
function toURLSearchParams(
  raw: Record<string, string | string[] | undefined>,
): URLSearchParams {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(raw)) {
    if (typeof value === "string") {
      params.set(key, value);
    } else if (Array.isArray(value) && value.length > 0) {
      params.set(key, value[0]);
    }
  }
  return params;
}

export default async function Home({ searchParams }: HomeProps) {
  // Filtering and sorting run here on the server, driven entirely by the URL.
  // When this swaps to a real data source, the same params feed the query.
  const params = toURLSearchParams(await searchParams);
  const filters = searchParamsToFilters(params);
  const sort = searchParamsToSort(params);

  const allGiftCertificates = mockGiftCertificates;
  const visibleGiftCertificates = sortGiftCertificates(
    filterGiftCertificates(allGiftCertificates, filters),
    sort,
  );

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

        <GiftCertificateExplorer
          giftCertificates={visibleGiftCertificates}
          totalCount={allGiftCertificates.length}
          filters={filters}
          sort={sort}
        />
      </main>
    </div>
  );
}
