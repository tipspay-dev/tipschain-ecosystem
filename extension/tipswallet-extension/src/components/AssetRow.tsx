import { ArrowUpRight } from "lucide-react";
import type { AssetBalance } from "@/types";
import { formatNumber } from "@/lib/utils";

export function AssetRow({ asset }: { asset: AssetBalance }) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-white/8 bg-black/10 px-4 py-3">
      <div>
        <p className="font-medium text-white">{asset.symbol}</p>
        <p className="text-xs text-white/50">{asset.name}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="font-medium text-white">{formatNumber(asset.formatted)}</p>
          <p className="text-xs text-white/40">{asset.address ? "Token" : "Native"}</p>
        </div>
        <a
          href="https://scan.tipschain.online"
          target="_blank"
          rel="noreferrer"
          className="rounded-xl border border-white/10 p-2 text-white/60 transition hover:text-white"
        >
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}
