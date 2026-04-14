import { HDNodeWallet, Mnemonic, Wallet, ethers } from "ethers";
import { v4 as uuid } from "uuid";
import { ERC20_ABI } from "@/lib/constants";
import type { VaultAccount, VaultData } from "@/types";

function deriveAccount(mnemonic: string, index: number): VaultAccount {
  const hd = HDNodeWallet.fromMnemonic(Mnemonic.fromPhrase(mnemonic), `m/44'/60'/0'/0/${index}`);
  return {
    id: uuid(),
    address: hd.address,
    privateKey: hd.privateKey,
    name: index === 0 ? "Main Account" : `Account ${index + 1}`
  };
}

export function createVault(): VaultData {
  const random = Wallet.createRandom();
  const mnemonic = random.mnemonic?.phrase;
  if (!mnemonic) throw new Error("Unable to generate mnemonic");
  const account = deriveAccount(mnemonic, 0);

  return {
    mnemonic,
    accounts: [account],
    activeAccountId: account.id,
    createdAt: new Date().toISOString()
  };
}

export function importVaultFromMnemonic(mnemonic: string): VaultData {
  if (!Mnemonic.isValidMnemonic(mnemonic.trim())) {
    throw new Error("Invalid recovery phrase");
  }
  const account = deriveAccount(mnemonic.trim(), 0);

  return {
    mnemonic: mnemonic.trim(),
    accounts: [account],
    activeAccountId: account.id,
    createdAt: new Date().toISOString()
  };
}

export function addAccount(vault: VaultData): VaultData {
  const account = deriveAccount(vault.mnemonic, vault.accounts.length);
  return {
    ...vault,
    accounts: [...vault.accounts, account],
    activeAccountId: account.id
  };
}

export function getActiveAccount(vault: VaultData) {
  return vault.accounts.find((account) => account.id === vault.activeAccountId) ?? vault.accounts[0];
}

export async function signPersonalMessage(args: {
  privateKey: string;
  message: string;
}) {
  const signer = new ethers.Wallet(args.privateKey);
  return signer.signMessage(args.message);
}

export async function sendEvmTransaction(args: {
  privateKey: string;
  rpcUrl: string;
  tx: {
    to?: string;
    value?: string;
    data?: string;
    gasLimit?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
  };
}) {
  const provider = new ethers.JsonRpcProvider(args.rpcUrl, undefined, { staticNetwork: true });
  const signer = new ethers.Wallet(args.privateKey, provider);

  return signer.sendTransaction({
    to: args.tx.to,
    data: args.tx.data,
    gasLimit: args.tx.gasLimit ? BigInt(args.tx.gasLimit) : undefined,
    value: args.tx.value ? BigInt(args.tx.value) : undefined,
    maxFeePerGas: args.tx.maxFeePerGas ? BigInt(args.tx.maxFeePerGas) : undefined,
    maxPriorityFeePerGas: args.tx.maxPriorityFeePerGas ? BigInt(args.tx.maxPriorityFeePerGas) : undefined
  });
}

export async function sendTokenTransaction(args: {
  privateKey: string;
  rpcUrl: string;
  tokenAddress: string;
  to: string;
  amount: string;
  decimals: number;
}) {
  const provider = new ethers.JsonRpcProvider(args.rpcUrl, undefined, { staticNetwork: true });
  const signer = new ethers.Wallet(args.privateKey, provider);
  const contract = new ethers.Contract(args.tokenAddress, ERC20_ABI, signer);
  return contract.transfer(args.to, ethers.parseUnits(args.amount, args.decimals));
}
