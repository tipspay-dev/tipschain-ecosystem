/**
 * Production Configuration
 * Server-side configuration for production deployment
 */

module.exports = {
  // API Configuration
  api: {
    port: process.env.PORT || 3000,
    host: process.env.HOST || "0.0.0.0",
    nodeEnv: process.env.NODE_ENV || "production",
  },

  // Security
  security: {
    corsOrigins: (process.env.CORS_ORIGINS || "").split(","),
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || "60000"),
    rateLimitMaxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || "100"),
    jwtSecret: process.env.JWT_SECRET,
    apiKeySecret: process.env.API_KEY_SECRET,
  },

  // Services
  services: {
    wallet: {
      enabled: true,
      domain: process.env.WALLET_DOMAIN,
    },
    dex: {
      enabled: true,
      domain: process.env.DEX_DOMAIN,
    },
    explorer: {
      enabled: true,
      domain: process.env.EXPLORER_DOMAIN,
    },
    relayer: {
      enabled: !!process.env.TRUSTED_FORWARDER_ADDRESS,
      address: process.env.TRUSTED_FORWARDER_ADDRESS,
    },
  },

  // Database
  database: {
    url: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 20,
    },
    ssl: process.env.DATABASE_SSL === "true",
  },

  // Cache
  cache: {
    redis: process.env.REDIS_URL,
    ttl: 3600, // 1 hour
  },

  // Blockchain
  blockchain: {
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
    chainId: parseInt(process.env.BLOCKCHAIN_CHAIN_ID || "1"),
    confirmations: 12,
    nativeToken: {
      name: "Tipscoin",
      symbol: "TIPS",
      decimals: 18,
    },
    gasToken: "TIPS",
  },

  // Logging
  logging: {
    level: process.env.LOG_LEVEL || "info",
    sentryDsn: process.env.SENTRY_DSN,
  },

  // Email/Notifications
  email: {
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.MAIL_FROM,
    },
  },

  // Storage
  storage: {
    web3Storage: process.env.WEB3_STORAGE_KEY,
    ipfs: process.env.IPFS_ENDPOINT,
  },
};
