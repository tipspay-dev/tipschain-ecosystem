/**
 * API Route: Verify Wallet Ownership
 * POST /api/wallet/verify
 */

import walletService from "../../../services/walletService";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address, signature, message } = req.body;

    if (!address || !signature || !message) {
      return res.status(400).json({
        error: "Address, signature, and message parameters required",
      });
    }

    const isValid = await walletService.verifyWalletOwnership(address, signature, message);

    return res.status(200).json({
      verified: isValid,
      address,
    });
  } catch (error) {
    console.error("Wallet verification error:", error);
    return res.status(500).json({
      error: error.message || "Failed to verify wallet",
    });
  }
}
