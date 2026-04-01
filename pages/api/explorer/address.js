/**
 * API Route: Explorer - Address Details
 * GET /api/explorer/address?address=0x...
 */

import explorerService from "../../../services/explorerService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address required" });
    }

    const data = await explorerService.getAddress(address);
    return res.status(200).json(data);
  } catch (error) {
    console.error("Address details error:", error);
    return res.status(500).json({
      error: error.message || "Failed to fetch address",
    });
  }
}
