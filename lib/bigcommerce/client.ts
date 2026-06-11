import { getStoreHash, getStoreToken } from "@/lib/bigcommerce/auth";

const API_ORIGIN = "https://api.bigcommerce.com";

/** Error thrown for non-2xx BigCommerce API responses; carries the status. */
export class BigCommerceApiError extends Error {
  constructor(
    readonly status: number,
    readonly path: string,
    message: string,
  ) {
    super(message);
    this.name = "BigCommerceApiError";
  }
}

/**
 * Thin wrapper for BigCommerce REST requests. Prefixes the store-scoped base
 * URL, attaches auth + JSON headers, and parses the JSON response. `path`
 * should start with a version segment, e.g. `/v2/gift_certificates`.
 *
 * Caching is intentionally not decided here: callers pass the appropriate
 * `init` (including Next's `cache` / `next: { revalidate, tags }` options) per
 * request type. `init` is spread first so caller options win, while the auth
 * and JSON headers are always applied.
 */
export async function bigCommerceRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const url = `${API_ORIGIN}/stores/${await getStoreHash()}${path}`;

  const response = await fetch(url, {
    ...init,
    headers: {
      "X-Auth-Token": await getStoreToken(),
      Accept: "application/json",
      "Content-Type": "application/json",
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new BigCommerceApiError(
      response.status,
      path,
      `BigCommerce API request to ${path} failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}
