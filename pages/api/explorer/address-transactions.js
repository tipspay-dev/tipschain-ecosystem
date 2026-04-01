/**
 * API Route: Explorer - Address Transactions
 * GET /api/explorer/address-transactions?address=0x...&limit=25&offset=0
 */

import explorerService from "../../../services/explorerService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address, limit = 25, offset = 0 } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address required" });
    }

    const data = await explorerService.getAddressTransactions(
      address,
      parseInt(limit),
      parseInt(offset)
    );
    return res.status(200).json(data);
  } catch (error) {
    console.error("Address transactions error:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch address transactions",
    });
  }
}
