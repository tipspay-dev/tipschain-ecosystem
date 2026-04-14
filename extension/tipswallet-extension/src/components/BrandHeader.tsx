
import walletLogo from "@/assets/tipswallet-logo.png";

export function BrandHeader() {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-glow">
          <img src={walletLogo} alt="TipsWallet" className="h-full w-full object-cover" />
        </div>
        <div>
          <p className="text-base font-semibold text-white">TipsWallet</p>
          <p className="text-xs text-white/50">Secure wallet for TipsChain</p>
        </div>
      </div>
      <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] text-emerald-200">
        Release
      </div>
    </div>
  );
}
