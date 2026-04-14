export async function sendBackgroundMessage<T = any>(action: string, payload: Record<string, unknown> = {}) {
  return chrome.runtime.sendMessage({ action, ...payload }) as Promise<T>;
}
