/**
 * API Route: DEX Token Price
 * GET /api/dex/price?tokenAddress=0x...&baseToken=0x...
 */

import dexService from "../../../services/dexService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { tokenAddress, baseToken } = req.query;

    if (!tokenAddress) {
      return res.status(400).json({ error: "tokenAddress parameter required" });
    }

    const price = await dexService.getTokenPrice(tokenAddress, baseToken);
    return res.status(200).json(price);
  } catch (error) {
    console.error("DEX price error:", error);
    return res.status(500).json({
      error: error.message || "Failed to get token price",
    });
  }
}
