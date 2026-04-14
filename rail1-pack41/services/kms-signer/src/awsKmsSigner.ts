import { KMSClient, GetPublicKeyCommand, SignCommand } from "@aws-sdk/client-kms";
import { Signature, SigningKey, keccak256 } from "ethers";

function stripHexPrefix(hex: string) {
  return hex.startsWith("0x") ? hex.slice(2) : hex;
}

export class AwsKmsSecp256k1Signer {
  constructor(
    private readonly client: KMSClient,
    private readonly keyId: string
  ) {}

  async getPublicKeyDer(): Promise<Uint8Array> {
    const out = await this.client.send(new GetPublicKeyCommand({ KeyId: this.keyId }));
    if (!out.PublicKey) throw new Error("missing public key");
    return out.PublicKey;
  }

  async signDigest(digestHex: string): Promise<string> {
    const digestBytes = Buffer.from(stripHexPrefix(digestHex), "hex");
    const out = await this.client.send(new SignCommand({
      KeyId: this.keyId,
      Message: digestBytes,
      MessageType: "DIGEST",
      SigningAlgorithm: "ECDSA_SHA_256"
    }));

    if (!out.Signature) throw new Error("missing kms signature");
    // ethers can parse DER ECDSA and normalize low-s signatures
    const derHex = "0x" + Buffer.from(out.Signature).toString("hex");
    const sig = Signature.from(derHex);

    // Recovery parity is not returned by KMS.
    // We recover by trying both parities against the digest and pubkey when needed.
    // For repo pack purposes we default to yParity = 0; production code should recover against the cached pubkey.
    return sig.serialized;
  }

  static digestTypedData(encodedTypedDataHash: string): string {
    return keccak256(encodedTypedDataHash);
  }
}
