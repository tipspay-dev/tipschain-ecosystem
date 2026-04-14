import { useEffect, useMemo, useState } from "react";
import { ArrowUpRight, Copy, ExternalLink, Globe2, Lock, RefreshCcw, Repeat2, SendHorizonal, Settings, ShieldCheck, Sparkles, Wallet2 } from "lucide-react";
import { AssetRow } from "@/components/AssetRow";
import { BrandHeader } from "@/components/BrandHeader";
import { EmptyState } from "@/components/EmptyState";
import { Button, Card, Input, SectionTitle } from "@/components/ui";
import { sendBackgroundMessage } from "@/hooks/useBackground";
import { BRAND, SECURITY_DEFAULTS, TOKENS } from "@/lib/constants";
import { explorerTxUrl, formatNumber, shortAddress } from "@/lib/utils";
import { useWalletStore } from "@/state/useWalletStore";
import type { SiteConnection } from "@/types";

type TabKey = "assets" | "swap" | "send" | "connections" | "settings";

export function DashboardPage() {
  const store = useWalletStore();
  const [tab, setTab] = useState<TabKey>("assets");
  const [loading, setLoading] = useState(false);
  const [connections, setConnections] = useState<SiteConnection[]>([]);
  const [sendForm, setSendForm] = useState({ to: "", amount: "", symbol: "TPC" });
  const [swapForm, setSwapForm] = useState({ fromSymbol: "TPC", toSymbol: "USDTC", amount: "", slippageBps: 50 });
  const [txHash, setTxHash] = useState("");
  const [securityInfo, setSecurityInfo] = useState({ autoLockMinutes: SECURITY_DEFAULTS.autoLockMinutes, highRiskBlock: false });

  const activeAccount = useMemo(
    () => store.vault?.accounts.find((entry) => entry.id === store.vault?.activeAccountId) ?? store.vault?.accounts[0],
    [store.vault]
  );

  async function hydrate() {
    const state = await sendBackgroundMessage<any>("wallet:getState");
    if (state.ok) {
      store.setState({ hasVault: state.hasVault, unlocked: state.unlocked, vault: state.vault });
    }
    if (state.ok && state.unlocked) {
      const balances = await sendBackgroundMessage<any>("wallet:getBalances");
      if (balances.ok) store.setState({ balances: balances.balances });
      const sites = await sendBackgroundMessage<any>("wallet:getConnections");
      if (sites.ok) setConnections(sites.connections);
      const security = await sendBackgroundMessage<any>("wallet:getSecurityState");
      if (security.ok) setSecurityInfo(security.settings);
    }
  }

  useEffect(() => {
    hydrate();
  }, []);

  async function refreshBalances() {
    setLoading(true);
    const balances = await sendBackgroundMessage<any>("wallet:getBalances");
    if (balances.ok) store.setState({ balances: balances.balances });
    setLoading(false);
  }

  async function lockWallet() {
    await sendBackgroundMessage("wallet:lock");
    window.location.reload();
  }

  async function addDerivedAccount() {
    const password = window.prompt("Re-enter your password to derive another account");
    if (!password) return;
    const result = await sendBackgroundMessage<any>("wallet:addAccount", { password });
    if (result.ok) {
      store.setState({ vault: result.vault });
      await refreshBalances();
    } else {
      window.alert(result.error);
    }
  }

  async function sendAsset() {
    const action = sendForm.symbol === "TPC" ? "wallet:sendNative" : "wallet:sendToken";
    const payload = sendForm.symbol === "TPC" ? { to: sendForm.to, amount: sendForm.amount } : { to: sendForm.to, amount: sendForm.amount, symbol: sendForm.symbol };
    const result = await sendBackgroundMessage<any>(action, payload);
    if (!result.ok) {
      window.alert(result.error);
      return;
    }
    setTxHash(result.hash);
    setSendForm({ to: "", amount: "", symbol: sendForm.symbol });
    await refreshBalances();
  }

  async function openDex() {
    const result = await sendBackgroundMessage<any>("wallet:openDex", swapForm);
    if (!result.ok) {
      window.alert(result.error);
    }
  }

  const totalUsdProxy = store.balances
    .filter((asset) => asset.symbol === "USDTC" || asset.symbol === "USDT")
    .reduce((sum, asset) => sum + Number(asset.formatted || 0), 0);

  const balanceFor = (symbol: string) => store.balances.find((asset) => asset.symbol === symbol)?.formatted ?? "0";

  return (
    <div className="min-h-screen bg-mesh px-4 py-5">
      <Card className="mx-auto max-w-md overflow-hidden">
        <div className="border-b border-white/8 p-5">
          <BrandHeader />
          <div className="mt-6 rounded-[28px] border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/55">Active account</p>
                <p className="mt-1 text-base font-semibold text-white">{activeAccount?.name ?? "Main Account"}</p>
                <p className="mt-1 text-xs text-white/50">{shortAddress(activeAccount?.address, 5)}</p>
              </div>
              <button
                className="rounded-xl border border-white/10 bg-white/5 p-2 text-white/70"
                onClick={() => activeAccount?.address && navigator.clipboard.writeText(activeAccount.address)}
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-black/15 p-4">
                <p className="text-xs text-white/45">Stable balances</p>
                <p className="mt-2 text-2xl font-semibold text-white">${formatNumber(totalUsdProxy, 2)}</p>
                <p className="mt-1 text-xs text-white/50">USDTC + USDT tracked</p>
              </div>
              <div className="rounded-2xl bg-black/15 p-4">
                <p className="text-xs text-white/45">Network</p>
                <p className="mt-2 text-2xl font-semibold text-white">TipsChain</p>
                <p className="mt-1 text-xs text-emerald-300">Chain ID {19251925}</p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-4 gap-2">
              <Button variant="secondary" className="px-2 py-2 text-xs" onClick={() => setTab("send")}><SendHorizonal className="mr-1 h-4 w-4" />Send</Button>
              <Button variant="secondary" className="px-2 py-2 text-xs" onClick={() => setTab("swap")}><Repeat2 className="mr-1 h-4 w-4" />Swap</Button>
              <Button variant="secondary" className="px-2 py-2 text-xs" onClick={refreshBalances}><RefreshCcw className={`mr-1 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
              <Button variant="secondary" className="px-2 py-2 text-xs" onClick={addDerivedAccount}><Wallet2 className="mr-1 h-4 w-4" />Add</Button>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-5 gap-2 rounded-2xl border border-white/8 bg-black/10 p-1">
            {([
              ["assets", "Assets"],
              ["swap", "Swap"],
              ["send", "Send"],
              ["connections", "Sites"],
              ["settings", "More"]
            ] as [TabKey, string][]).map(([key, label]) => (
              <button
                key={key}
                className={`rounded-xl px-3 py-2 text-xs font-medium ${tab === key ? "bg-white text-slate-900" : "text-white/60 hover:bg-white/5"}`}
                onClick={() => setTab(key)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className="p-5">
          {tab === "assets" ? (
            <div className="space-y-4">
              <SectionTitle title="Portfolio" subtitle="Native and token balances on TipsChain." />
              <div className="space-y-3">
                {store.balances.map((asset) => (
                  <AssetRow key={asset.symbol} asset={asset} />
                ))}
              </div>
              {txHash ? (
                <a
                  className="flex items-center justify-between rounded-2xl border border-emerald-400/20 bg-emerald-400/5 px-4 py-3 text-sm text-emerald-100"
                  href={explorerTxUrl(txHash)}
                  target="_blank"
                  rel="noreferrer"
                >
                  <span>Last transaction</span>
                  <ExternalLink className="h-4 w-4" />
                </a>
              ) : null}
            </div>
          ) : null}

          {tab === "swap" ? (
            <div className="space-y-4">
              <SectionTitle title="TipsChain swap" subtitle="Launch the Tipspay DEX with auto-connect and your prefilled token pair." />
              <div className="rounded-[24px] border border-white/10 bg-black/10 p-4">
                <div className="mb-3 flex items-center gap-2 text-sm text-white">
                  <Sparkles className="h-4 w-4 text-accent" />
                  DEX auto-connect enabled for {new URL(BRAND.dex).host}
                </div>
                <div className="space-y-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="mb-2 text-xs text-white/45">From</p>
                    <div className="grid grid-cols-[1fr,100px] gap-3">
                      <Input value={swapForm.amount} placeholder="0.0" onChange={(e) => setSwapForm({ ...swapForm, amount: e.target.value })} />
                      <select
                        className="rounded-2xl border border-white/10 bg-black/20 px-3 text-sm text-white"
                        value={swapForm.fromSymbol}
                        onChange={(e) => setSwapForm({ ...swapForm, fromSymbol: e.target.value })}
                      >
                        {TOKENS.map((token) => <option key={token.symbol} value={token.symbol}>{token.symbol}</option>)}
                      </select>
                    </div>
                    <p className="mt-2 text-xs text-white/45">Balance: {formatNumber(balanceFor(swapForm.fromSymbol), 6)} {swapForm.fromSymbol}</p>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                    <p className="mb-2 text-xs text-white/45">To</p>
                    <div className="grid grid-cols-[1fr,100px] gap-3">
                      <Input disabled value="Execution on Tipspay DEX" />
                      <select
                        className="rounded-2xl border border-white/10 bg-black/20 px-3 text-sm text-white"
                        value={swapForm.toSymbol}
                        onChange={(e) => setSwapForm({ ...swapForm, toSymbol: e.target.value })}
                      >
                        {TOKENS.filter((token) => token.symbol !== swapForm.fromSymbol).map((token) => <option key={token.symbol} value={token.symbol}>{token.symbol}</option>)}
                      </select>
                    </div>
                    <p className="mt-2 text-xs text-white/45">Slippage: {(swapForm.slippageBps / 100).toFixed(2)}%</p>
                  </div>

                  <Button className="w-full" onClick={openDex}>
                    Open Tipspay DEX
                    <ArrowUpRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/5 p-4 text-sm text-cyan-50">
                This release includes a polished in-extension swap launcher and DEX auto-connect. Final on-chain quote routing still happens on the Tipspay DEX because router contracts and quote endpoints were not provided in this brief.
              </div>
            </div>
          ) : null}

          {tab === "send" ? (
            <div className="space-y-4">
              <SectionTitle title="Send assets" subtitle="Send native TPC or tracked ERC-20 assets." />
              <div className="space-y-3 rounded-[24px] border border-white/10 bg-black/10 p-4">
                <select
                  className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white"
                  value={sendForm.symbol}
                  onChange={(e) => setSendForm({ ...sendForm, symbol: e.target.value })}
                >
                  {TOKENS.map((token) => <option key={token.symbol} value={token.symbol}>{token.name} ({token.symbol})</option>)}
                </select>
                <Input placeholder="Recipient address" value={sendForm.to} onChange={(e) => setSendForm({ ...sendForm, to: e.target.value })} />
                <Input placeholder={`Amount in ${sendForm.symbol}`} value={sendForm.amount} onChange={(e) => setSendForm({ ...sendForm, amount: e.target.value })} />
                <Button className="w-full" onClick={sendAsset}>Send {sendForm.symbol}</Button>
              </div>
            </div>
          ) : null}

          {tab === "connections" ? (
            <div className="space-y-4">
              <SectionTitle title="Connected sites" subtitle="dApps that can see your selected address." />
              {connections.length ? (
                <div className="space-y-3">
                  {connections.map((site) => (
                    <div key={site.origin} className="rounded-2xl border border-white/10 bg-black/10 p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 text-white"><Globe2 className="h-4 w-4 text-accent" />{site.origin}</div>
                          <p className="mt-1 text-xs text-white/45">{site.trusted ? "Trusted auto-connect origin" : `${site.accountIds.length} account access granted`}</p>
                        </div>
                        <ShieldCheck className="h-4 w-4 text-emerald-300" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No connected dApps yet" copy="Once you connect TipsWallet to a dApp, it will appear here." />
              )}
            </div>
          ) : null}

          {tab === "settings" ? (
            <div className="space-y-4">
              <SectionTitle title="Tools and support" subtitle="Wallet shortcuts, docs and helpdesk." />
              <div className="space-y-3">
                <a className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white" href={BRAND.walletLanding} target="_blank" rel="noreferrer">Wallet landing <ExternalLink className="h-4 w-4" /></a>
                <a className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white" href={BRAND.docs} target="_blank" rel="noreferrer">Docs <ExternalLink className="h-4 w-4" /></a>
                <a className="flex items-center justify-between rounded-2xl border border-white/10 bg-black/10 px-4 py-3 text-sm text-white" href={BRAND.helpdesk} target="_blank" rel="noreferrer">Helpdesk <ExternalLink className="h-4 w-4" /></a>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Button variant="secondary" onClick={lockWallet}><Lock className="mr-2 h-4 w-4" />Lock</Button>
                <Button variant="secondary" onClick={addDerivedAccount}><Settings className="mr-2 h-4 w-4" />New account</Button>
              </div>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
