import { create } from "zustand";
import type { AssetBalance, VaultData } from "@/types";

type WalletState = {
  hasVault: boolean;
  unlocked: boolean;
  vault: VaultData | null;
  balances: AssetBalance[];
  mnemonicBackup: string | null;
  setState: (next: Partial<WalletState>) => void;
};

export const useWalletStore = create<WalletState>((set) => ({
  hasVault: false,
  unlocked: false,
  vault: null,
  balances: [],
  mnemonicBackup: null,
  setState: (next) => set(next)
}));
