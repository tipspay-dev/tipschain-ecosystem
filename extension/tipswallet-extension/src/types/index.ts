
export type VaultAccount = {
  id: string;
  address: string;
  privateKey: string;
  name: string;
};

export type VaultData = {
  mnemonic: string;
  accounts: VaultAccount[];
  activeAccountId: string;
  createdAt: string;
};

export type EncryptedVault = {
  cipherText: string;
  checksum: string;
  createdAt: string;
};

export type SessionState = {
  unlocked: boolean;
  lastUnlockedAt?: string;
  autoLockAt?: string;
};

export type SiteConnection = {
  origin: string;
  accountIds: string[];
  createdAt: string;
  trusted?: boolean;
};

export type PendingRequest = {
  id: string;
  origin: string;
  method: string;
  params?: unknown[];
};

export type AssetBalance = {
  symbol: string;
  name: string;
  formatted: string;
  raw: string;
  address: string | null;
};

export type ProviderRpcRequest = {
  id: string;
  method: string;
  params?: unknown[];
  origin?: string;
};

export type ProviderRpcResponse = {
  id: string;
  result?: unknown;
  error?: { message: string; code?: number };
};

export type ApprovalRequestType = "connect" | "sign" | "transaction";
export type RiskSeverity = "low" | "medium" | "high" | "critical";

export type RiskFinding = {
  severity: RiskSeverity;
  title: string;
  description: string;
};

export type SecuritySettings = {
  autoLockMinutes: number;
  blockUnknownChains: boolean;
  requireSimulation: boolean;
  highRiskBlock: boolean;
  allowTrustedOriginsAutoConnect: boolean;
};

export type ApprovalRequest = {
  approvalId: string;
  origin: string;
  requestId: string;
  type: ApprovalRequestType;
  method: string;
  createdAt: string;
  accountAddress: string;
  payload: {
    params?: unknown[];
    message?: string;
    tx?: {
      from?: string;
      to?: string;
      value?: string;
      data?: string;
      gas?: string;
      gasLimit?: string;
      maxFeePerGas?: string;
      maxPriorityFeePerGas?: string;
    };
    simulation?: {
      nativeValueFormatted?: string;
      estimatedGas?: string;
      maxFeePerGas?: string;
      maxPriorityFeePerGas?: string;
      action?: string;
      targetContract?: string;
      contractTrusted?: boolean;
      contractVerified?: boolean;
      contractCodePresent?: boolean;
      tokenTransfer?: {
        tokenSymbol?: string;
        tokenName?: string;
        from?: string;
        to?: string;
        spender?: string;
        amountFormatted?: string;
        isUnlimitedApproval?: boolean;
        contract?: string;
      };
      riskLevel?: RiskSeverity;
      riskFindings?: RiskFinding[];
      warnings?: string[];
    };
  };
};

export type ApprovalDecision = {
  approved: boolean;
  result?: unknown;
  error?: string;
};

export type SwapIntent = {
  fromSymbol: string;
  toSymbol: string;
  amount: string;
  slippageBps: number;
};

export type DexLaunchPayload = {
  url: string;
  origin: string;
};

export type ActivityEntry = {
  id: string;
  kind: "sign" | "send" | "connect" | "security";
  createdAt: string;
  title: string;
  detail: string;
  severity?: RiskSeverity;
};
