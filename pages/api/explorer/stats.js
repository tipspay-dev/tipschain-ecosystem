/**
 * API Route: Explorer - Network Stats
 * GET /api/explorer/stats
 */

import explorerService from "../../../services/explorerService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const stats = await explorerService.getNetworkStats();
    return res.status(200).json(stats);
  } catch (error) {
    console.error("Stats error:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch stats",
    });
  }
}
