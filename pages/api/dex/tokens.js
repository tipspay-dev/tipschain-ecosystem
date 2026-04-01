/**
 * API Route: DEX Supported Tokens
 * GET /api/dex/tokens
 */

import dexService from "../../../services/dexService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const tokens = await dexService.getSupportedTokens();
    return res.status(200).json(tokens);
  } catch (error) {
    console.error("Tokens error:", error);
    return res.status(500).json({
      error: error.message || "Failed to get tokens",
    });
  }
}
