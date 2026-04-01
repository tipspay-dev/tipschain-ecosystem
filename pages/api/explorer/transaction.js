/**
 * API Route: Explorer - Transaction Details
 * GET /api/explorer/transaction?hash=0x...
 */

import explorerService from "../../../services/explorerService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { hash } = req.query;

    if (!hash) {
      return res.status(400).json({ error: "Transaction hash required" });
    }

    const tx = await explorerService.getTransaction(hash);
    return res.status(200).json(tx);
  } catch (error) {
    console.error("Transaction details error:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch transaction",
    });
  }
}
