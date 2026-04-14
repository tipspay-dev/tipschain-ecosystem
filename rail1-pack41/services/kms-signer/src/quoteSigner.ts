import { KMSClient } from "@aws-sdk/client-kms";
import { TypedDataEncoder } from "ethers";
import { AwsKmsSecp256k1Signer } from "./awsKmsSigner.js";

const region = process.env.AWS_REGION!;
const keyId = process.env.AWS_KMS_KEY_ID!;
const chainId = Number(process.env.CHAIN_ID || "19251925");
const verifyingContract = process.env.ROUTER_ADDRESS!;

async function main() {
  const client = new KMSClient({ region });
  const signer = new AwsKmsSecp256k1Signer(client, keyId);

  const domain = {
    name: "TipsWalletRail1Router",
    version: "1",
    chainId,
    verifyingContract
  };

  const types = {
    Quote: [
      { name: "routeId", type: "bytes32" },
      { name: "inputAsset", type: "address" },
      { name: "outputAsset", type: "address" },
      { name: "inputAmount", type: "uint256" },
      { name: "outputAmount", type: "uint256" },
      { name: "validUntil", type: "uint256" }
    ]
  };

  const value = {
    routeId: "0x" + "11".repeat(32),
    inputAsset: "0x0000000000000000000000000000000000000001",
    outputAsset: "0x0000000000000000000000000000000000000002",
    inputAmount: 1_000_000n,
    outputAmount: 10_000_000_000_000_000n,
    validUntil: BigInt(Math.floor(Date.now() / 1000) + 60)
  };

  const digest = TypedDataEncoder.hash(domain, types, value);
  const signature = await signer.signDigest(digest);

  console.log(JSON.stringify({ digest, signature }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
