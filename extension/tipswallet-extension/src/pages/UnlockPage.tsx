import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { BrandHeader } from "@/components/BrandHeader";
import { Button, Card, Input, SectionTitle } from "@/components/ui";
import { sendBackgroundMessage } from "@/hooks/useBackground";
import { useWalletStore } from "@/state/useWalletStore";

export function UnlockPage() {
  const setState = useWalletStore((s) => s.setState);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function unlock() {
    setError("");
    const result = await sendBackgroundMessage<any>("wallet:unlock", { password });
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setState({ unlocked: true });
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-mesh px-4 py-5">
      <Card className="mx-auto max-w-md p-5">
        <BrandHeader />
        <div className="mt-10 rounded-[28px] border border-white/10 bg-black/15 p-5">
          <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent/10">
            <LockKeyhole className="h-6 w-6 text-accent" />
          </div>
          <SectionTitle title="Unlock TipsWallet" subtitle="Access your secure TipsChain wallet and connected dApps." />
          <div className="mt-5 space-y-3">
            <Input type="password" placeholder="Wallet password" value={password} onChange={(e) => setPassword(e.target.value)} />
            {error ? <p className="text-sm text-rose-300">{error}</p> : null}
            <Button className="w-full" onClick={unlock} disabled={!password}>Unlock</Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
