import { useEffect, useState } from "react";
import { mountApp } from "@/main";
import { ApprovalPage } from "@/pages/ApprovalPage";
import { DashboardPage } from "@/pages/DashboardPage";
import { OnboardingPage } from "@/pages/OnboardingPage";
import { UnlockPage } from "@/pages/UnlockPage";
import { sendBackgroundMessage } from "@/hooks/useBackground";
import { useWalletStore } from "@/state/useWalletStore";
import type { ApprovalRequest } from "@/types";

function PopupApp() {
  const { hasVault, unlocked, setState } = useWalletStore();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);

  async function hydrate() {
    const [state, pending] = await Promise.all([
      sendBackgroundMessage<any>("wallet:getState"),
      sendBackgroundMessage<any>("wallet:listPendingApprovals")
    ]);

    if (state.ok) {
      setState({
        hasVault: state.hasVault,
        unlocked: state.unlocked,
        vault: state.vault ?? null
      });
    }

    if (pending.ok) {
      setApprovals(pending.approvals ?? []);
    }
  }

  useEffect(() => {
    hydrate();
    const timer = window.setInterval(hydrate, 1200);
    return () => window.clearInterval(timer);
  }, [setState]);

  if (approvals.length > 0) {
    return <ApprovalPage request={approvals[0]} onResolved={hydrate} />;
  }

  if (!hasVault) return <OnboardingPage />;
  if (!unlocked) return <UnlockPage />;
  return <DashboardPage />;
}

mountApp(PopupApp);
