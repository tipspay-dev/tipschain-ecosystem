/**
 * API Route: Explorer - Block Details
 * GET /api/explorer/block?number=123 or hash=0x...
 */

import explorerService from "../../../services/explorerService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { number, hash } = req.query;
    const blockId = number || hash;

    if (!blockId) {
      return res.status(400).json({ error: "Block number or hash required" });
    }

    const block = await explorerService.getBlock(blockId);
    return res.status(200).json(block);
  } catch (error) {
    console.error("Block details error:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch block",
    });
  }
}
