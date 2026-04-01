/**
 * API Route: Token Balance
 * GET /api/wallet/token-balance?address=0x...&tokenAddress=0x...
 */

import walletService from "../../../services/walletService";

const ERC20_ABI = [
  "function balanceOf(address account) public view returns (uint256)",
  "function decimals() public view returns (uint8)",
];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { address, tokenAddress } = req.query;

    if (!address || !tokenAddress) {
      return res.status(400).json({ error: "Address and tokenAddress parameters required" });
    }

    const balance = await walletService.getTokenBalance(address, tokenAddress, ERC20_ABI);
    return res.status(200).json(balance);
  } catch (error) {
    console.error("Token balance error:", error);
    return res.status(500).json({
      error: error.message || "Failed to get token balance",
    });
  }
}
