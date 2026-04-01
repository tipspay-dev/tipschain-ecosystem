/**
 * Relayer Configuration
 */

module.exports = {
  // Relayer account settings
  relayer: {
    address: process.env.RELAYER_ADDRESS,
    privateKey: process.env.RELAYER_PRIVATE_KEY,
    gasLimit: parseInt(process.env.RELAYER_GAS_LIMIT || "500000"),
    gasPrice: process.env.RELAYER_GAS_PRICE,
  },

  // Trusted Forwarder settings
  trustedForwarder: {
    address: process.env.TRUSTED_FORWARDER_ADDRESS,
    enabled: !!process.env.TRUSTED_FORWARDER_ADDRESS,
  },

  // Rate limiting
  rateLimit: {
    enabled: true,
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
    cooldownPeriod: 3600, // 1 hour
  },

  // Transaction settings
  transaction: {
    maxFeePerGas: "100", // Gwei
    maxPriorityFeePerGas: "2", // Gwei
    timeout: 300000, // 5 minutes
  },

  // Whitelisting
  whitelist: {
    enabled: process.env.WHITELIST_ENABLED === "true",
    addresses: (process.env.WHITELIST_ADDRESSES || "").split(",").filter(Boolean),
  },

  // Blacklist
  blacklist: {
    enabled: process.env.BLACKLIST_ENABLED === "true",
    addresses: (process.env.BLACKLIST_ADDRESSES || "").split(",").filter(Boolean),
  },
};
