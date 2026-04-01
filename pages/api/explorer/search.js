/**
 * API Route: Explorer - Search
 * GET /api/explorer/search?q=0x...
 */

import explorerService from "../../../services/explorerService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Search query required" });
    }

    const result = await explorerService.search(q);
    return res.status(200).json(result);
  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      error: error.message || "Search failed",
    });
  }
}
