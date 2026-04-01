/**
 * API Route: Explorer - Latest Blocks
 * GET /api/explorer/blocks?limit=10
 */

import explorerService from "../../../services/explorerService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { limit = 10 } = req.query;
    const data = await explorerService.getLatestBlocks(parseInt(limit));
    return res.status(200).json(data);
  } catch (error) {
    console.error("Blocks error:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch blocks",
    });
  }
}
