/**
 * API Route: DEX Swap Quote
 * POST /api/dex/swap-quote
 */

import dexService from "../../../services/dexService";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { tokenInAddress, tokenOutAddress, amountIn } = req.body;

    if (!tokenInAddress || !tokenOutAddress || !amountIn) {
      return res.status(400).json({
        error: "tokenInAddress, tokenOutAddress, and amountIn required",
      });
    }

    const quote = await dexService.getSwapQuote(tokenInAddress, tokenOutAddress, amountIn);

    return res.status(200).json(quote);
  } catch (error) {
    console.error("Swap quote error:", error);
    return res.status(500).json({
      error: error.message || "Failed to get swap quote",
    });
  }
}
