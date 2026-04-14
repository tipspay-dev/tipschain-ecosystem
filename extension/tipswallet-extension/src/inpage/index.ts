type JsonRpcRequest = {
  id: string;
  method: string;
  params?: unknown[];
};

class TipsWalletProvider {
  isTipsWallet = true;
  isMetaMask = false;
  selectedAddress: string | null = null;
  chainId = "0x125ce95";

  async request<T = unknown>(args: { method: string; params?: unknown[] }): Promise<T> {
    const id = crypto.randomUUID();
    const request: JsonRpcRequest = {
      id,
      method: args.method,
      params: args.params
    };

    window.postMessage(
      {
        target: "tipswallet-content",
        payload: request
      },
      "*"
    );

    return new Promise<T>((resolve, reject) => {
      const onMessage = (event: MessageEvent) => {
        if (event.source !== window || event.data?.target !== "tipswallet-inpage") return;
        if (event.data?.payload?.id !== id) return;

        window.removeEventListener("message", onMessage);

        const payload = event.data.payload;
        if (payload.error) {
          reject(new Error(payload.error.message));
          return;
        }

        if (args.method === "eth_requestAccounts" || args.method === "eth_accounts") {
          this.selectedAddress = payload.result?.[0] ?? null;
        }

        resolve(payload.result);
      };

      window.addEventListener("message", onMessage);
    });
  }

  enable() {
    return this.request({ method: "eth_requestAccounts" });
  }

  on() {
    return this;
  }

  removeListener() {
    return this;
  }
}

const provider = new TipsWalletProvider();
Reflect.set(window, "tipswallet", provider);
Reflect.set(window, "ethereum", provider);

window.dispatchEvent(new Event("ethereum#initialized"));
