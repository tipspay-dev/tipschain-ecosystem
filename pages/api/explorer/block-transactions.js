/**
 * API Route: Explorer - Block Transactions
 * GET /api/explorer/block-transactions?number=123&limit=25
 */

import explorerService from "../../../services/explorerService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { number, hash, limit = 25 } = req.query;
    const blockId = number || hash;

    if (!blockId) {
      return res.status(400).json({ error: "Block number or hash required" });
    }

    const data = await explorerService.getBlockTransactions(blockId, parseInt(limit));
    return res.status(200).json(data);
  } catch (error) {
    console.error("Block transactions error:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch block transactions",
    });
  }
}
