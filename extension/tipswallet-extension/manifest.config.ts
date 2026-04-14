import { defineManifest } from "@crxjs/vite-plugin";

export default defineManifest({
  manifest_version: 3,
  name: "TipsWallet",
  version: "1.3.0",
  description: "A hardened EVM wallet for TipsChain on Chrome and Edge.",
  minimum_chrome_version: "114",
  action: {
    default_title: "TipsWallet",
    default_popup: "src/popup.html"
  },
  options_page: "src/options.html",
  background: {
    service_worker: "src/background/index.ts",
    type: "module"
  },
  icons: {
    "16": "public/icon-16.png",
    "32": "public/icon-32.png",
    "48": "public/icon-48.png",
    "128": "public/icon-128.png"
  },
  permissions: ["storage", "notifications", "tabs"],
  host_permissions: [
    "<all_urls>",
    "https://rpc.tipschain.org/*",
    "https://rpc2.tipschain.org/*",
    "https://scan.tipschain.online/*",
    "https://www.tipspay.org/*",
    "https://wallet.tipspay.org/*",
    "https://dex.tipspay.org/*"
  ],
  web_accessible_resources: [
    {
      resources: ["src/inpage/index.js"],
      matches: ["<all_urls>"]
    }
  ],
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["src/content/index.ts"],
      run_at: "document_start"
    }
  ]
});
