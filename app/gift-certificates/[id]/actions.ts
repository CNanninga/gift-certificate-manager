"use server";

import type { RefillActionState } from "./refill-state";

/**
 * Server action for the Refill form. Placeholder for now: it just echoes the
 * requested amount back after a simulated processing delay — nothing is saved.
 */
export async function refillGiftCertificate(
  _prevState: RefillActionState,
  formData: FormData,
): Promise<RefillActionState> {
  const amount = String(formData.get("amount") ?? "");

  // Simulated processing latency.
  await new Promise((resolve) =>
    setTimeout(resolve, 400 + Math.floor(Math.random() * 900)),
  );

  return {
    status: "success",
    message: `Refill request received — balance would be set to $${amount}. (placeholder; nothing was saved)`,
    key: Date.now(),
  };
}
