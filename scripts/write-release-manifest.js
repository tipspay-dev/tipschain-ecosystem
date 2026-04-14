const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const root = path.resolve(__dirname, "..");
const distDir = path.join(root, "dist");
const packageJson = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const site = JSON.parse(fs.readFileSync(path.join(root, "config", "site.json"), "utf8"));
const manifestFileName = `release-manifest-v${packageJson.version}.json`;

const sha256 = (filePath) => {
  const hash = crypto.createHash("sha256");
  hash.update(fs.readFileSync(filePath));
  return hash.digest("hex");
};

const artifacts = fs.existsSync(distDir)
  ? fs.readdirSync(distDir, { withFileTypes: true })
      .filter((entry) => entry.isFile())
      .filter((entry) => entry.name !== manifestFileName)
      .map((entry) => {
        const filePath = path.join(distDir, entry.name);
        const stat = fs.statSync(filePath);
        return {
          name: entry.name,
          bytes: stat.size,
          sha256: sha256(filePath),
        };
      })
  : [];

const manifest = {
  release: {
    version: packageJson.version,
    generatedAt: new Date().toISOString(),
    product: "Tipspay Production Bundle 4.1",
  },
  targets: {
    walletUrl: site.walletUrl,
    dexUrl: site.dexUrl,
    chainId: site.chainId,
    rpcUrl: site.rpcUrl,
  },
  artifacts,
};

fs.writeFileSync(
  path.join(distDir, manifestFileName),
  JSON.stringify(manifest, null, 2),
);

console.log(`Release manifest written for v${packageJson.version}`);
