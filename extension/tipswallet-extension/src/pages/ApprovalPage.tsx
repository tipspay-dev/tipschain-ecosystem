
import { AlertTriangle, ArrowUpRight, CheckCheck, CircleDollarSign, PenSquare, ShieldAlert, ShieldCheck, Wallet2 } from "lucide-react";
import { useMemo, useState } from "react";
import { BrandHeader } from "@/components/BrandHeader";
import { Button, Card, SectionTitle } from "@/components/ui";
import { sendBackgroundMessage } from "@/hooks/useBackground";
import { formatNumber, shortAddress } from "@/lib/utils";
import type { ApprovalRequest, RiskSeverity } from "@/types";

const toneByRisk: Record<RiskSeverity, string> = {
  low: "border-emerald-400/20 bg-emerald-400/5 text-emerald-200",
  medium: "border-amber-400/20 bg-amber-400/5 text-amber-200",
  high: "border-orange-400/20 bg-orange-400/5 text-orange-200",
  critical: "border-rose-400/20 bg-rose-400/5 text-rose-200"
};

export function ApprovalPage({
  request,
  onResolved
}: {
  request: ApprovalRequest;
  onResolved: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const sim = request.payload.simulation;
  const riskLevel = sim?.riskLevel ?? "low";
  const riskFindings = sim?.riskFindings ?? [];
  const canApprove = riskLevel !== "critical";

  const title = useMemo(() => {
    if (request.type === "connect") return "Connection request";
    if (request.type === "sign") return "Signature request";
    return "Transaction approval";
  }, [request.type]);

  async function resolve(approved: boolean) {
    setBusy(true);
    await sendBackgroundMessage("wallet:resolveApproval", {
      approvalId: request.approvalId,
      approved
    });
    onResolved();
    setBusy(false);
  }

  return (
    <div className="min-h-screen bg-mesh px-4 py-5">
      <Card className="mx-auto max-w-md p-5">
        <BrandHeader />

        <div className={`mt-6 rounded-[28px] border p-4 ${toneByRisk[riskLevel]}`}>
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-black/20">
              {riskLevel === "high" || riskLevel === "critical" ? (
                <ShieldAlert className="h-5 w-5" />
              ) : request.type === "connect" ? (
                <Wallet2 className="h-5 w-5" />
              ) : request.type === "sign" ? (
                <PenSquare className="h-5 w-5" />
              ) : (
                <CircleDollarSign className="h-5 w-5" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="text-xs text-white/70">{request.origin}</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.24em]">Risk: {riskLevel}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          <SectionTitle
            title={request.type === "connect" ? "Review site access" : request.type === "sign" ? "Review signature" : "Review transaction"}
            subtitle="Approve only when you trust the website and understand the request."
          />

          <div className="rounded-2xl border border-white/10 bg-black/15 p-4 text-sm text-white/70">
            <div className="flex items-center justify-between">
              <span>Account</span>
              <span className="font-medium text-white">{shortAddress(request.accountAddress, 6)}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Method</span>
              <span className="font-medium text-white">{request.method}</span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Requested at</span>
              <span className="font-medium text-white">{new Date(request.createdAt).toLocaleTimeString()}</span>
            </div>
          </div>

          {request.type === "connect" ? (
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-white">
                <ShieldCheck className="h-4 w-4 text-accent" />
                Site permissions
              </div>
              <p className="text-sm text-white/65">This site will be able to view your selected wallet address and request future signatures and transactions.</p>
            </div>
          ) : null}

          {request.type === "sign" ? (
            <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
              <div className="mb-3 flex items-center gap-2 text-white">
                <PenSquare className="h-4 w-4 text-accent" />
                Message preview
              </div>
              <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words text-xs text-white/70">{request.payload.message || "No readable message body."}</pre>
            </div>
          ) : null}

          {request.type === "transaction" ? (
            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm">
                <div className="mb-3 flex items-center gap-2 text-white">
                  <ArrowUpRight className="h-4 w-4 text-accent" />
                  Transaction summary
                </div>
                <div className="space-y-2 text-white/70">
                  <div className="flex justify-between gap-4">
                    <span>Action</span>
                    <span className="text-right text-white">{sim?.action || "Contract interaction"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>To</span>
                    <span className="text-right text-white">{shortAddress(request.payload.tx?.to || "-", 6)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Value</span>
                    <span className="text-right text-white">{formatNumber(sim?.nativeValueFormatted || "0")} TPC</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Estimated gas</span>
                    <span className="text-right text-white">{sim?.estimatedGas || "Auto"}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span>Max fee</span>
                    <span className="text-right text-white">{sim?.maxFeePerGas || "Auto"} gwei</span>
                  </div>
                </div>
              </div>

              {sim?.tokenTransfer ? (
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4 text-sm text-white/70">
                  <div className="mb-3 flex items-center gap-2 text-white">
                    <CheckCheck className="h-4 w-4 text-accent" />
                    Decoded token action
                  </div>
                  <div className="space-y-2">
                    {sim.tokenTransfer.from ? <div className="flex justify-between gap-4"><span>From</span><span className="text-right text-white">{shortAddress(sim.tokenTransfer.from, 6)}</span></div> : null}
                    {sim.tokenTransfer.spender ? <div className="flex justify-between gap-4"><span>Spender</span><span className="text-right text-white">{shortAddress(sim.tokenTransfer.spender, 6)}</span></div> : null}
                    {sim.tokenTransfer.to ? <div className="flex justify-between gap-4"><span>Recipient</span><span className="text-right text-white">{shortAddress(sim.tokenTransfer.to, 6)}</span></div> : null}
                    <div className="flex justify-between gap-4">
                      <span>Token</span>
                      <span className="text-right text-white">{sim.tokenTransfer.tokenName} ({sim.tokenTransfer.tokenSymbol})</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span>Amount</span>
                      <span className="text-right text-white">
                        {sim.tokenTransfer.isUnlimitedApproval ? "Unlimited" : `${formatNumber(sim.tokenTransfer.amountFormatted || "0")} ${sim.tokenTransfer.tokenSymbol}`}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}

              {riskFindings.length > 0 ? (
                <div className="rounded-2xl border border-white/10 bg-black/10 p-4">
                  <div className="mb-3 flex items-center gap-2 text-white">
                    <AlertTriangle className="h-4 w-4 text-amber-300" />
                    Security analysis
                  </div>
                  <div className="space-y-2">
                    {riskFindings.map((finding, index) => (
                      <div key={`${finding.title}-${index}`} className={`rounded-2xl border p-3 ${toneByRisk[finding.severity]}`}>
                        <p className="text-sm font-semibold text-white">{finding.title}</p>
                        <p className="mt-1 text-xs text-white/80">{finding.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => resolve(false)} disabled={busy}>Reject</Button>
            <Button onClick={() => resolve(true)} disabled={busy || !canApprove}>
              {canApprove ? "Approve" : "Blocked"}
            </Button>
          </div>

          {!canApprove ? (
            <p className="text-center text-xs text-rose-300">This request is blocked because the risk engine marked it as critical.</p>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
