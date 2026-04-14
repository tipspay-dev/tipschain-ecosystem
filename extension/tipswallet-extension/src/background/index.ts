
import { ethers } from "ethers";
import { v4 as uuid } from "uuid";
import { BRAND, DEX_AUTO_CONNECT_ORIGINS, ERC20_ABI, KNOWN_TOKEN_CONTRACTS, KNOWN_TRUSTED_ORIGINS, MAX_UINT256, SECURITY_DEFAULTS, TIPSCHAIN, TOKENS } from "@/lib/constants";
import { decryptVault, encryptVault } from "@/lib/crypto";
import { appendActivity, getApprovals, getConnections, getEncryptedVault, getSecuritySettings, getSession, setApprovals, setConnections, setEncryptedVault, setSecuritySettings, setSession } from "@/lib/storage";
import { addAccount, createVault, getActiveAccount, importVaultFromMnemonic, sendEvmTransaction, sendTokenTransaction, signPersonalMessage } from "@/lib/wallet";
import type { ActivityEntry, ApprovalRequest, ApprovalRequestType, AssetBalance, ProviderRpcRequest, ProviderRpcResponse, RiskFinding, RiskSeverity, SecuritySettings, SiteConnection, VaultData } from "@/types";

let unlockedVault: VaultData | null = null;
const approvalResolvers = new Map<string, (decision: { approved: boolean; result?: unknown; error?: string }) => void>();

async function rpcProvider() {
  return new ethers.JsonRpcProvider(TIPSCHAIN.rpcUrls[0], undefined, { staticNetwork: true });
}

function getTokenByAddress(address?: string | null) {
  if (!address) return null;
  return TOKENS.find((token) => token.address?.toLowerCase() === address.toLowerCase()) ?? null;
}

async function touchSession() {
  const settings = await getSecuritySettings();
  const autoLockAt = new Date(Date.now() + settings.autoLockMinutes * 60_000).toISOString();
  await setSession({ unlocked: Boolean(unlockedVault), lastUnlockedAt: new Date().toISOString(), autoLockAt });
}

async function enforceAutoLock() {
  const session = await getSession();
  if (session.unlocked && session.autoLockAt && Date.now() > new Date(session.autoLockAt).getTime()) {
    unlockedVault = null;
    await setSession({ unlocked: false });
  }
}

async function logActivity(entry: Omit<ActivityEntry, "id" | "createdAt">) {
  await appendActivity({
    id: uuid(),
    createdAt: new Date().toISOString(),
    ...entry
  });
}

async function loadBalances(address: string): Promise<AssetBalance[]> {
  const provider = await rpcProvider();
  const nativeRaw = await provider.getBalance(address);
  const native = {
    symbol: "TPC",
    name: "TipsChain Coin",
    formatted: ethers.formatEther(nativeRaw),
    raw: nativeRaw.toString(),
    address: null
  };

  const tokenBalances = await Promise.all(
    TOKENS.filter((token) => token.address).map(async (token) => {
      const contract = new ethers.Contract(token.address!, ERC20_ABI, provider);
      const [balance, decimals] = await Promise.all([contract.balanceOf(address), contract.decimals()]);
      return {
        symbol: token.symbol,
        name: token.name,
        formatted: ethers.formatUnits(balance, decimals),
        raw: balance.toString(),
        address: token.address
      } satisfies AssetBalance;
    })
  );

  return [native, ...tokenBalances];
}

async function ensureConnection(origin: string, accountId: string, trusted = false) {
  const connections = await getConnections();
  const existing = connections.find((entry) => entry.origin === origin);
  if (!existing) {
    const next: SiteConnection = {
      origin,
      accountIds: [accountId],
      createdAt: new Date().toISOString(),
      trusted
    };
    await setConnections([...connections, next]);
    return;
  }
  if (!existing.accountIds.includes(accountId)) {
    existing.accountIds.push(accountId);
  }
  if (trusted) existing.trusted = true;
  await setConnections([...connections]);
}

function riskLevelFromFindings(findings: RiskFinding[]): RiskSeverity {
  if (findings.some((entry) => entry.severity === "critical")) return "critical";
  if (findings.some((entry) => entry.severity === "high")) return "high";
  if (findings.some((entry) => entry.severity === "medium")) return "medium";
  return "low";
}

async function describeTransaction(
  tx: { from?: string; to?: string; value?: string; data?: string; gas?: string; gasLimit?: string; maxFeePerGas?: string; maxPriorityFeePerGas?: string },
  origin: string,
  accountAddress: string,
  settings: SecuritySettings
) {
  const provider = await rpcProvider();
  const simulation: ApprovalRequest["payload"]["simulation"] = {
    warnings: [],
    riskFindings: []
  };

  if (tx.value) simulation.nativeValueFormatted = ethers.formatEther(BigInt(tx.value));

  if (tx.to) {
    simulation.targetContract = tx.to;
    simulation.contractTrusted = KNOWN_TOKEN_CONTRACTS.includes(tx.to.toLowerCase()) || KNOWN_TRUSTED_ORIGINS.includes(origin);
    try {
      const code = await provider.getCode(tx.to);
      simulation.contractCodePresent = Boolean(code && code !== "0x");
      simulation.contractVerified = simulation.contractTrusted || !simulation.contractCodePresent;
      if (simulation.contractCodePresent && !simulation.contractTrusted) {
        simulation.riskFindings?.push({
          severity: "medium",
          title: "Unknown contract target",
          description: "This request targets a contract that is not on the built-in trusted list."
        });
      }
    } catch {
      simulation.warnings?.push("Could not fetch target contract bytecode.");
    }
  }

  if (tx.data && tx.to) {
    try {
      const iface = new ethers.Interface(ERC20_ABI);
      const parsed = iface.parseTransaction({ data: tx.data });
      const token = getTokenByAddress(tx.to);
      if (token && parsed?.name === "transfer") {
        const recipient = String(parsed.args[0]);
        const rawAmount = parsed.args[1] as bigint;
        simulation.action = "Token transfer";
        simulation.tokenTransfer = {
          tokenSymbol: token.symbol,
          tokenName: token.name,
          to: recipient,
          amountFormatted: ethers.formatUnits(rawAmount, token.decimals),
          contract: tx.to
        };
      }
      if (token && parsed?.name === "approve") {
        const spender = String(parsed.args[0]);
        const rawAmount = parsed.args[1] as bigint;
        const isUnlimitedApproval = rawAmount === BigInt(MAX_UINT256);
        simulation.action = "Token approval";
        simulation.tokenTransfer = {
          tokenSymbol: token.symbol,
          tokenName: token.name,
          spender,
          amountFormatted: isUnlimitedApproval ? "Unlimited" : ethers.formatUnits(rawAmount, token.decimals),
          isUnlimitedApproval,
          contract: tx.to
        };
        simulation.riskFindings?.push({
          severity: isUnlimitedApproval ? "high" : "medium",
          title: isUnlimitedApproval ? "Unlimited approval detected" : "Token approval detected",
          description: isUnlimitedApproval
            ? "The dApp is asking for unlimited token spending access. This can drain the token balance later."
            : "The dApp is asking permission to spend tokens from this wallet."
        });
      }
      if (token && parsed?.name === "transferFrom") {
        const from = String(parsed.args[0]);
        const recipient = String(parsed.args[1]);
        const rawAmount = parsed.args[2] as bigint;
        simulation.action = "Delegated token transfer";
        simulation.tokenTransfer = {
          tokenSymbol: token.symbol,
          tokenName: token.name,
          from,
          to: recipient,
          amountFormatted: ethers.formatUnits(rawAmount, token.decimals),
          contract: tx.to
        };
        simulation.riskFindings?.push({
          severity: "high",
          title: "Delegated transfer",
          description: "This call can move tokens on behalf of another address. Review carefully."
        });
      }
    } catch {
      simulation.warnings?.push("Could not decode contract calldata.");
    }
  }

  try {
    const estimate = await provider.estimateGas({
      from: accountAddress,
      to: tx.to,
      value: tx.value ? BigInt(tx.value) : undefined,
      data: tx.data
    });
    simulation.estimatedGas = estimate.toString();
  } catch {
    simulation.estimatedGas = tx.gas || tx.gasLimit || "Auto";
    simulation.riskFindings?.push({
      severity: settings.requireSimulation ? "high" : "medium",
      title: "Simulation incomplete",
      description: "The node could not simulate or estimate gas for this request."
    });
  }

  try {
    const fee = await provider.getFeeData();
    if (fee.maxFeePerGas) simulation.maxFeePerGas = ethers.formatUnits(fee.maxFeePerGas, "gwei");
    if (fee.maxPriorityFeePerGas) simulation.maxPriorityFeePerGas = ethers.formatUnits(fee.maxPriorityFeePerGas, "gwei");
  } catch {
    simulation.warnings?.push("Could not fetch fee data.");
  }

  if (!simulation.action) simulation.action = tx.data ? "Contract interaction" : "Native transfer";

  if (!KNOWN_TRUSTED_ORIGINS.includes(origin) && origin !== new URL(BRAND.dex).origin) {
    simulation.riskFindings?.push({
      severity: "medium",
      title: "Unrecognized website origin",
      description: "This domain is not part of the built-in Tipspay trusted list."
    });
  }

  if (!tx.to) {
    simulation.riskFindings?.push({
      severity: "critical",
      title: "Missing target address",
      description: "The request has no destination. Contract-creation requests are blocked in this release."
    });
  }

  simulation.riskLevel = riskLevelFromFindings(simulation.riskFindings ?? []);
  return simulation;
}

async function createApproval(
  type: ApprovalRequestType,
  request: ProviderRpcRequest,
  origin: string,
  accountAddress: string,
  payload: ApprovalRequest["payload"]
) {
  const approval: ApprovalRequest = {
    approvalId: uuid(),
    origin,
    requestId: request.id,
    type,
    method: request.method,
    createdAt: new Date().toISOString(),
    accountAddress,
    payload
  };

  const approvals = await getApprovals();
  await setApprovals([...approvals, approval]);
  await chrome.action.openPopup().catch(() => undefined);

  const response = await new Promise<{ approved: boolean; result?: unknown; error?: string }>((resolve) => {
    approvalResolvers.set(approval.approvalId, resolve);
  });

  const remaining = (await getApprovals()).filter((entry) => entry.approvalId !== approval.approvalId);
  await setApprovals(remaining);
  approvalResolvers.delete(approval.approvalId);

  if (!response.approved) throw new Error(response.error || "User rejected the request");
  return response.result;
}

async function isConnected(origin: string, accountId: string) {
  const connections = await getConnections();
  return connections.some((entry) => entry.origin === origin && entry.accountIds.includes(accountId));
}

async function handleProviderRequest(message: ProviderRpcRequest, sender: chrome.runtime.MessageSender): Promise<ProviderRpcResponse> {
  await enforceAutoLock();
  const origin = message.origin || new URL(sender.url ?? sender.origin ?? BRAND.landing).origin;

  if (!unlockedVault && message.method !== "wallet_getState") {
    const session = await getSession();
    if (!session.unlocked) return { id: message.id, error: { code: 4100, message: "TipsWallet is locked" } };
  }

  const vault = unlockedVault;
  const account = vault ? getActiveAccount(vault) : null;
  const settings = await getSecuritySettings();

  try {
    switch (message.method) {
      case "wallet_getState": {
        const encrypted = await getEncryptedVault();
        const session = await getSession();
        return {
          id: message.id,
          result: {
            hasVault: Boolean(encrypted),
            unlocked: Boolean(session.unlocked && unlockedVault),
            account: account?.address ?? null,
            chainId: TIPSCHAIN.chainId
          }
        };
      }
      case "eth_chainId":
        return { id: message.id, result: TIPSCHAIN.chainId };
      case "net_version":
        return { id: message.id, result: String(TIPSCHAIN.chainIdDecimal) };
      case "eth_requestAccounts": {
        if (!vault || !account) throw new Error("Wallet is locked");
        const trustedDex = settings.allowTrustedOriginsAutoConnect && DEX_AUTO_CONNECT_ORIGINS.includes(origin);
        const alreadyConnected = await isConnected(origin, account.id);

        if (!alreadyConnected && !trustedDex) {
          await createApproval("connect", message, origin, account.address, {
            simulation: {
              action: "Site connection",
              riskLevel: KNOWN_TRUSTED_ORIGINS.includes(origin) ? "low" : "medium",
              riskFindings: KNOWN_TRUSTED_ORIGINS.includes(origin)
                ? []
                : [{
                    severity: "medium",
                    title: "Unknown website",
                    description: "This site is not on the built-in trusted list."
                  }]
            }
          });
        }

        await ensureConnection(origin, account.id, trustedDex);
        await logActivity({ kind: "connect", title: "Site connected", detail: origin });
        await touchSession();
        return { id: message.id, result: [account.address] };
      }
      case "eth_accounts": {
        if (!vault || !account) throw new Error("Wallet is locked");
        const connected = await isConnected(origin, account.id);
        return { id: message.id, result: connected || DEX_AUTO_CONNECT_ORIGINS.includes(origin) ? [account.address] : [] };
      }
      case "wallet_switchEthereumChain":
      case "wallet_addEthereumChain":
        return { id: message.id, result: null };
      case "personal_sign": {
        if (!vault || !account) throw new Error("Wallet is locked");
        const [messageHex] = (message.params ?? []) as string[];
        const displayMessage = new TextDecoder().decode(ethers.getBytes(messageHex));
        const signature = await createApproval("sign", message, origin, account.address, {
          params: message.params,
          message: displayMessage,
          simulation: {
            action: "Message signature",
            riskLevel: KNOWN_TRUSTED_ORIGINS.includes(origin) ? "low" : "medium",
            riskFindings: KNOWN_TRUSTED_ORIGINS.includes(origin)
              ? []
              : [{
                  severity: "medium",
                  title: "Signature from unknown origin",
                  description: "Signing messages for unknown sites can be used for off-chain authorization."
                }]
          }
        });
        await logActivity({ kind: "sign", title: "Message signed", detail: origin });
        await touchSession();
        return { id: message.id, result: signature };
      }
      case "eth_sendTransaction": {
        if (!vault || !account) throw new Error("Wallet is locked");
        const tx = ((message.params ?? [])[0] ?? {}) as { from?: string; to?: string; value?: string; data?: string; gas?: string; gasLimit?: string; maxFeePerGas?: string; maxPriorityFeePerGas?: string };
        const simulation = await describeTransaction(tx, origin, account.address, settings);
        if (simulation.riskLevel === "critical" || (settings.highRiskBlock && simulation.riskLevel === "high")) {
          await logActivity({
            kind: "security",
            title: "Transaction blocked",
            detail: `${origin} • ${simulation.action || "transaction"}`,
            severity: simulation.riskLevel
          });
          throw new Error(`Blocked by security engine: ${simulation.riskLevel} risk`);
        }
        const hash = await createApproval("transaction", message, origin, account.address, {
          params: message.params,
          tx,
          simulation
        });
        await touchSession();
        return { id: message.id, result: hash };
      }
      default: {
        const provider = await rpcProvider();
        const result = await provider.send(message.method, message.params ?? []);
        await touchSession();
        return { id: message.id, result };
      }
    }
  } catch (error) {
    return {
      id: message.id,
      error: {
        code: 4001,
        message: error instanceof Error ? error.message : "Unknown provider error"
      }
    };
  }
}

chrome.runtime.onInstalled.addListener(async () => {
  chrome.sidePanel?.setPanelBehavior?.({ openPanelOnActionClick: false }).catch(() => undefined);
  await setSecuritySettings(await getSecuritySettings());
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const action = message?.action;

  (async () => {
    await enforceAutoLock();

    switch (action) {
      case "wallet:create": {
        const vault = createVault();
        const encrypted = encryptVault(vault, message.password);
        await setEncryptedVault(encrypted);
        unlockedVault = vault;
        await touchSession();
        await logActivity({ kind: "security", title: "Vault created", detail: getActiveAccount(vault)?.address || "new wallet" });
        sendResponse({ ok: true, address: getActiveAccount(vault)?.address, mnemonic: vault.mnemonic });
        return;
      }
      case "wallet:import": {
        const vault = importVaultFromMnemonic(message.mnemonic);
        const encrypted = encryptVault(vault, message.password);
        await setEncryptedVault(encrypted);
        unlockedVault = vault;
        await touchSession();
        await logActivity({ kind: "security", title: "Vault imported", detail: getActiveAccount(vault)?.address || "imported wallet" });
        sendResponse({ ok: true, address: getActiveAccount(vault)?.address });
        return;
      }
      case "wallet:unlock": {
        const encrypted = await getEncryptedVault();
        if (!encrypted) throw new Error("No wallet found");
        const vault = decryptVault(encrypted, message.password);
        unlockedVault = vault;
        await touchSession();
        sendResponse({ ok: true, address: getActiveAccount(vault)?.address });
        return;
      }
      case "wallet:lock": {
        unlockedVault = null;
        await setSession({ unlocked: false });
        sendResponse({ ok: true });
        return;
      }
      case "wallet:getState": {
        const encrypted = await getEncryptedVault();
        const session = await getSession();
        sendResponse({
          ok: true,
          hasVault: Boolean(encrypted),
          unlocked: Boolean(unlockedVault && session.unlocked),
          vault: unlockedVault,
          chain: TIPSCHAIN
        });
        return;
      }
      case "wallet:getSecurityState": {
        const settings = await getSecuritySettings();
        const session = await getSession();
        sendResponse({ ok: true, settings, session });
        return;
      }
      case "wallet:addAccount": {
        if (!unlockedVault) throw new Error("Unlock wallet first");
        unlockedVault = addAccount(unlockedVault);
        const encrypted = encryptVault(unlockedVault, message.password);
        await setEncryptedVault(encrypted);
        await touchSession();
        sendResponse({ ok: true, vault: unlockedVault });
        return;
      }
      case "wallet:getBalances": {
        if (!unlockedVault) throw new Error("Unlock wallet first");
        const account = getActiveAccount(unlockedVault);
        const balances = await loadBalances(account.address);
        await touchSession();
        sendResponse({ ok: true, balances });
        return;
      }
      case "wallet:sendNative": {
        if (!unlockedVault) throw new Error("Unlock wallet first");
        const account = getActiveAccount(unlockedVault);
        const response = await sendEvmTransaction({
          privateKey: account.privateKey,
          rpcUrl: TIPSCHAIN.rpcUrls[0],
          tx: {
            to: message.to,
            value: ethers.parseEther(message.amount).toString()
          }
        });
        await logActivity({ kind: "send", title: "Native transfer sent", detail: response.hash });
        await touchSession();
        sendResponse({ ok: true, hash: response.hash });
        return;
      }
      case "wallet:sendToken": {
        if (!unlockedVault) throw new Error("Unlock wallet first");
        const account = getActiveAccount(unlockedVault);
        const token = TOKENS.find((entry) => entry.symbol === message.symbol);
        if (!token?.address) throw new Error("Unsupported token");
        const response = await sendTokenTransaction({
          privateKey: account.privateKey,
          rpcUrl: TIPSCHAIN.rpcUrls[0],
          tokenAddress: token.address,
          to: message.to,
          amount: message.amount,
          decimals: token.decimals
        });
        await logActivity({ kind: "send", title: `${token.symbol} transfer sent`, detail: response.hash });
        await touchSession();
        sendResponse({ ok: true, hash: response.hash });
        return;
      }
      case "wallet:getConnections": {
        const connections = await getConnections();
        sendResponse({ ok: true, connections });
        return;
      }
      case "wallet:listPendingApprovals": {
        const approvals = await getApprovals();
        sendResponse({ ok: true, approvals });
        return;
      }
      case "wallet:resolveApproval": {
        const approvals = await getApprovals();
        const target = approvals.find((entry) => entry.approvalId === message.approvalId);
        if (!target) throw new Error("Approval request not found");

        if (message.approved) {
          if (target.type === "connect") {
            approvalResolvers.get(target.approvalId)?.({ approved: true, result: [target.accountAddress] });
          } else if (target.type === "sign") {
            if (!unlockedVault) throw new Error("Unlock wallet first");
            const account = getActiveAccount(unlockedVault);
            const signature = await signPersonalMessage({
              privateKey: account.privateKey,
              message: target.payload.message || ""
            });
            approvalResolvers.get(target.approvalId)?.({ approved: true, result: signature });
          } else if (target.type === "transaction") {
            if (!unlockedVault) throw new Error("Unlock wallet first");
            const simulation = target.payload.simulation;
            if (simulation?.riskLevel === "critical") {
              throw new Error("Critical-risk transaction cannot be approved");
            }
            const account = getActiveAccount(unlockedVault);
            const tx = target.payload.tx || {};
            const response = await sendEvmTransaction({
              privateKey: account.privateKey,
              rpcUrl: TIPSCHAIN.rpcUrls[0],
              tx: {
                to: tx.to,
                value: tx.value,
                data: tx.data,
                gasLimit: tx.gasLimit || tx.gas,
                maxFeePerGas: tx.maxFeePerGas,
                maxPriorityFeePerGas: tx.maxPriorityFeePerGas
              }
            });
            await logActivity({ kind: "send", title: simulation?.action || "Transaction approved", detail: response.hash, severity: simulation?.riskLevel });
            approvalResolvers.get(target.approvalId)?.({ approved: true, result: response.hash });
          }
        } else {
          approvalResolvers.get(target.approvalId)?.({ approved: false, error: "User rejected the request" });
        }

        const remaining = approvals.filter((entry) => entry.approvalId !== message.approvalId);
        await setApprovals(remaining);
        await touchSession();
        sendResponse({ ok: true });
        return;
      }
      case "wallet:openDex": {
        if (!unlockedVault) throw new Error("Unlock wallet first");
        const account = getActiveAccount(unlockedVault);
        const url = new URL(BRAND.dex);
        if (message.fromSymbol) url.searchParams.set("from", String(message.fromSymbol));
        if (message.toSymbol) url.searchParams.set("to", String(message.toSymbol));
        if (message.amount) url.searchParams.set("amount", String(message.amount));
        url.searchParams.set("chainId", String(TIPSCHAIN.chainIdDecimal));
        url.searchParams.set("wallet", "tipswallet");
        await ensureConnection(new URL(BRAND.dex).origin, account.id, true);
        await chrome.tabs.create({ url: url.toString() });
        await logActivity({ kind: "connect", title: "DEX launched", detail: url.toString() });
        await touchSession();
        sendResponse({ ok: true, url: url.toString(), origin: new URL(BRAND.dex).origin });
        return;
      }
      case "provider:request": {
        const response = await handleProviderRequest(message.payload, sender);
        sendResponse(response);
        return;
      }
      default:
        sendResponse({ ok: false, error: "Unknown action" });
    }
  })().catch((error) => {
    sendResponse({
      ok: false,
      error: error instanceof Error ? error.message : "Unexpected background error"
    });
  });

  return true;
});
