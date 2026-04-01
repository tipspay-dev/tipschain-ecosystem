/**
 * API Route: DEX Gassless Swap
 * POST /api/dex/gassless-swap
 */

import dexService from "../../../services/dexService";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { userAddress, swapData } = req.body;

    if (!userAddress || !swapData) {
      return res.status(400).json({ error: "userAddress and swapData required" });
    }

    const result = await dexService.executeGasslessSwap(userAddress, swapData);

    return res.status(200).json(result);
  } catch (error) {
    console.error("Gassless swap error:", error);
    return res.status(500).json({
      error: error.message || "Failed to execute gassless swap",
    });
  }
}
