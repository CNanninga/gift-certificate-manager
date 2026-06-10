import type { NextApiRequest, NextApiResponse } from "next";

/**
 * Response shape for the refill API route. Replaces the App Router server
 * action's `RefillActionState`; the Balance tab posts to this route via fetch
 * (Pages Router has no server actions).
 */
export interface RefillResponse {
  status: "success";
  message: string;
}

/**
 * Refill API route. Placeholder for now: it echoes the requested amount back
 * after a simulated processing delay — nothing is saved. The `[id]` route param
 * identifies the gift certificate (unused while this is a placeholder).
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<RefillResponse | { error: string }>,
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    res.status(405).json({ error: "Method Not Allowed" });
    return;
  }

  const amount = String(req.body?.amount ?? "");

  // Simulated processing latency.
  await new Promise((resolve) =>
    setTimeout(resolve, 400 + Math.floor(Math.random() * 900)),
  );

  res.status(200).json({
    status: "success",
    message: `Refill request received — balance would be set to $${amount}. (placeholder; nothing was saved)`,
  });
}
