/**
 * API Route: Wallet Balance
 * GET /api/wallet/balance?address=0x...
 */

import walletService from "../../services/walletService";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ error: "Address parameter required" });
    }

    const balance = await walletService.getBalance(address);
    return res.status(200).json(balance);
  } catch (error) {
    console.error("Wallet balance error:", error);
    return res.status(500).json({
      error: error.message || "Failed to get wallet balance",
    });
  }
}
