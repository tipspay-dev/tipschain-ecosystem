import { useState } from "react";
import { BookOpenText, Import, WalletMinimal } from "lucide-react";
import { sendBackgroundMessage } from "@/hooks/useBackground";
import { BRAND } from "@/lib/constants";
import { BrandHeader } from "@/components/BrandHeader";
import { Button, Card, Input, SectionTitle, Textarea } from "@/components/ui";
import { useWalletStore } from "@/state/useWalletStore";

export function OnboardingPage() {
  const setState = useWalletStore((s) => s.setState);
  const [mode, setMode] = useState<"create" | "import">("create");
  const [password, setPassword] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handleCreate() {
    setBusy(true);
    setError("");
    const result = await sendBackgroundMessage<any>("wallet:create", { password });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setState({ hasVault: true, unlocked: true, mnemonicBackup: result.mnemonic });
    window.location.reload();
  }

  async function handleImport() {
    setBusy(true);
    setError("");
    const result = await sendBackgroundMessage<any>("wallet:import", { mnemonic, password });
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setState({ hasVault: true, unlocked: true });
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-mesh px-4 py-5">
      <Card className="mx-auto max-w-md p-5">
        <BrandHeader />
        <div className="mt-8 space-y-6">
          <SectionTitle title="Launch your TipsChain wallet" subtitle="Built for TipsPay, TipsChain, swaps and daily Web3 use." />

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setMode("create")}
              className={`rounded-2xl border px-4 py-4 text-left ${mode === "create" ? "border-accent/60 bg-accent/10" : "border-white/10 bg-white/5"}`}
            >
              <WalletMinimal className="mb-3 h-5 w-5 text-accent" />
              <p className="font-medium text-white">Create new wallet</p>
              <p className="mt-1 text-xs text-white/55">Fresh recovery phrase</p>
            </button>
            <button
              onClick={() => setMode("import")}
              className={`rounded-2xl border px-4 py-4 text-left ${mode === "import" ? "border-accent/60 bg-accent/10" : "border-white/10 bg-white/5"}`}
            >
              <Import className="mb-3 h-5 w-5 text-cyan-300" />
              <p className="font-medium text-white">Import wallet</p>
              <p className="mt-1 text-xs text-white/55">Use seed phrase</p>
            </button>
          </div>

          {mode === "import" ? (
            <div className="space-y-3">
              <Textarea rows={4} placeholder="Enter your 12 or 24 word recovery phrase" value={mnemonic} onChange={(e) => setMnemonic(e.target.value)} />
            </div>
          ) : null}

          <div className="space-y-3">
            <Input type="password" placeholder="Create a strong password" value={password} onChange={(e) => setPassword(e.target.value)} />
            <p className="text-xs text-white/45">This password unlocks your extension locally. It never leaves your device.</p>
          </div>

          {error ? <p className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">{error}</p> : null}

          <Button className="w-full" onClick={mode === "create" ? handleCreate : handleImport} disabled={!password || busy}>
            {busy ? "Preparing secure vault..." : mode === "create" ? "Create wallet" : "Import wallet"}
          </Button>

          <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-white/65">
            <div className="mb-2 flex items-center gap-2 text-white"><BookOpenText className="h-4 w-4 text-accent" /> Ecosystem links</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a className="rounded-xl bg-white/5 px-3 py-2 hover:bg-white/10" href={BRAND.walletLanding} target="_blank" rel="noreferrer">Wallet landing</a>
              <a className="rounded-xl bg-white/5 px-3 py-2 hover:bg-white/10" href={BRAND.dex} target="_blank" rel="noreferrer">DEX</a>
              <a className="rounded-xl bg-white/5 px-3 py-2 hover:bg-white/10" href={BRAND.docs} target="_blank" rel="noreferrer">Docs</a>
              <a className="rounded-xl bg-white/5 px-3 py-2 hover:bg-white/10" href={BRAND.helpdesk} target="_blank" rel="noreferrer">Helpdesk</a>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
