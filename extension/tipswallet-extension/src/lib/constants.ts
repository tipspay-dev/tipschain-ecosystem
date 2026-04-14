
export const APP_NAME = "TipsWallet";
export const BRAND = {
  org: "Tipspay.org",
  chain: "tipschain.org",
  landing: "https://www.tipspay.org",
  walletLanding: "https://wallet.tipspay.org",
  dex: "https://dex.tipspay.org",
  docs: "https://tipspay.wiki",
  helpdesk: "https://tipspay.help",
  explorer: "https://scan.tipschain.online"
};

export const TIPSCHAIN = {
  chainId: "0x125ce95",
  chainIdDecimal: 19251925,
  chainName: "TipsChain",
  nativeCurrency: {
    name: "TipsChain Coin",
    symbol: "TPC",
    decimals: 18
  },
  rpcUrls: ["https://rpc.tipschain.org", "https://rpc2.tipschain.org"],
  blockExplorerUrls: ["https://scan.tipschain.online"]
};

export const TOKENS = [
  {
    symbol: "TPC",
    name: "TipsChain Coin",
    address: null,
    decimals: 18
  },
  {
    symbol: "USDTC",
    name: "USDTips",
    address: "0x1F8a034434a50EB4e291B36EBE91f10bBfba1127",
    decimals: 18
  },
  {
    symbol: "USDT",
    name: "Tether USD",
    address: "0x9D41ed4Fc218Dd877365Be5C36c6Bb5Ec40eDa99",
    decimals: 18
  },
  {
    symbol: "WTPC",
    name: "Wrapped TPC",
    address: "0xd2E9DFeB41428f0F6f719A74551AE20A431FA365",
    decimals: 18
  }
] as const;

export const TOKEN_ICON_BY_SYMBOL: Record<string, string> = {
  TPC: "src/assets/tpc-logo.png",
  USDTC: "src/assets/usdtc-logo.png",
  USDT: "src/assets/usdt-logo.png",
  WTPC: "src/assets/wtpc-logo.png"
};

export const ERC20_ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function symbol() view returns (string)",
  "function name() view returns (string)",
  "function decimals() view returns (uint8)",
  "function transfer(address to, uint256 amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount) returns (bool)",
  "function allowance(address owner, address spender) view returns (uint256)",
  "function approve(address spender, uint256 amount) returns (bool)"
];

export const STORAGE_KEYS = {
  vault: "tipswallet:vault",
  session: "tipswallet:session",
  connections: "tipswallet:connections",
  approvals: "tipswallet:approvals",
  securitySettings: "tipswallet:security_settings",
  activityLog: "tipswallet:activity_log"
} as const;

export const DEX_AUTO_CONNECT_ORIGINS = [new URL(BRAND.dex).origin, new URL(BRAND.landing).origin];

export const SECURITY_DEFAULTS = {
  autoLockMinutes: 15,
  blockUnknownChains: true,
  requireSimulation: true,
  highRiskBlock: false,
  allowTrustedOriginsAutoConnect: true
} as const;

export const KNOWN_TRUSTED_ORIGINS = [
  new URL(BRAND.landing).origin,
  new URL(BRAND.walletLanding).origin,
  new URL(BRAND.dex).origin,
  BRAND.docs,
  BRAND.helpdesk
].map((entry) => new URL(entry).origin);

export const KNOWN_TOKEN_CONTRACTS = TOKENS.filter((token) => token.address).map((token) => token.address!.toLowerCase());

export const MAX_UINT256 = "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff";
