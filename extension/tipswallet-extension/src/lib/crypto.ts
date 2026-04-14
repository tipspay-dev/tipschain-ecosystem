import CryptoJS from "crypto-js";
import { type EncryptedVault, type VaultData } from "@/types";

export function encryptVault(vault: VaultData, password: string): EncryptedVault {
  const payload = JSON.stringify(vault);
  const cipherText = CryptoJS.AES.encrypt(payload, password).toString();
  const checksum = CryptoJS.SHA256(`${payload}:${password}`).toString();
  return {
    cipherText,
    checksum,
    createdAt: new Date().toISOString()
  };
}

export function decryptVault(encryptedVault: EncryptedVault, password: string): VaultData {
  const bytes = CryptoJS.AES.decrypt(encryptedVault.cipherText, password);
  const payload = bytes.toString(CryptoJS.enc.Utf8);
  if (!payload) {
    throw new Error("Invalid password");
  }
  const checksum = CryptoJS.SHA256(`${payload}:${password}`).toString();
  if (checksum !== encryptedVault.checksum) {
    throw new Error("Vault integrity check failed");
  }
  return JSON.parse(payload) as VaultData;
}
