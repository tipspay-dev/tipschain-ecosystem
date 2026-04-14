
import { SECURITY_DEFAULTS, STORAGE_KEYS } from "@/lib/constants";
import { type ActivityEntry, type ApprovalRequest, type EncryptedVault, type SecuritySettings, type SessionState, type SiteConnection } from "@/types";

export async function getEncryptedVault() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.vault);
  return (result[STORAGE_KEYS.vault] as EncryptedVault | undefined) ?? null;
}

export async function setEncryptedVault(vault: EncryptedVault) {
  await chrome.storage.local.set({ [STORAGE_KEYS.vault]: vault });
}

export async function getSession() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.session);
  return (
    (result[STORAGE_KEYS.session] as SessionState | undefined) ?? {
      unlocked: false
    }
  );
}

export async function setSession(session: SessionState) {
  await chrome.storage.local.set({ [STORAGE_KEYS.session]: session });
}

export async function getConnections() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.connections);
  return (result[STORAGE_KEYS.connections] as SiteConnection[] | undefined) ?? [];
}

export async function setConnections(connections: SiteConnection[]) {
  await chrome.storage.local.set({ [STORAGE_KEYS.connections]: connections });
}

export async function getApprovals() {
  const result = await chrome.storage.local.get(STORAGE_KEYS.approvals);
  return (result[STORAGE_KEYS.approvals] as ApprovalRequest[] | undefined) ?? [];
}

export async function setApprovals(approvals: ApprovalRequest[]) {
  await chrome.storage.local.set({ [STORAGE_KEYS.approvals]: approvals });
}

export async function getSecuritySettings(): Promise<SecuritySettings> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.securitySettings);
  return {
    ...SECURITY_DEFAULTS,
    ...((result[STORAGE_KEYS.securitySettings] as SecuritySettings | undefined) ?? {})
  };
}

export async function setSecuritySettings(settings: SecuritySettings) {
  await chrome.storage.local.set({ [STORAGE_KEYS.securitySettings]: settings });
}

export async function getActivityLog(): Promise<ActivityEntry[]> {
  const result = await chrome.storage.local.get(STORAGE_KEYS.activityLog);
  return (result[STORAGE_KEYS.activityLog] as ActivityEntry[] | undefined) ?? [];
}

export async function appendActivity(entry: ActivityEntry) {
  const current = await getActivityLog();
  await chrome.storage.local.set({
    [STORAGE_KEYS.activityLog]: [entry, ...current].slice(0, 100)
  });
}
