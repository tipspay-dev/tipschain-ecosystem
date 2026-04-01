/**
 * API Route: Explorer - Address Token Transfers
 * GET /api/explorer/address-tokens?address=0x...&limit=25
 */

import explorerService from "../../../services/explorerService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address, limit = 25 } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address required" });
    }

    const data = await explorerService.getAddressTokenTransfers(address, parseInt(limit));
    return res.status(200).json(data);
  } catch (error) {
    console.error("Address token transfers error:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch token transfers",
    });
  }
}
