import type { EncryptedInputPayload } from "@/types/astraea";
import { getRelayerUrl, hasRelayer } from "@/config/contract";
import { generateFakeCiphertext } from "@/lib/format";

export interface EncryptionResult {
  payload: EncryptedInputPayload;
  isReal: boolean;
  ciphertextPreview: string;
}

export async function encryptAmount(
  contractAddress: string,
  userAddress: string,
  amount: number
): Promise<EncryptionResult> {
  if (hasRelayer()) {
    try {
      const relayerUrl = getRelayerUrl();
      // @zama-fhe/relayer-sdk is a peer dep not bundled here.
      // If the SDK is available globally or injected, use it.
      const zamaModule = await import(/* @vite-ignore */ "@zama-fhe/relayer-sdk").catch(() => null);
      if (zamaModule) {
        const { createInstance } = zamaModule;
        const instance = await createInstance({ relayerUrl });
        const input = instance.createEncryptedInput(contractAddress, userAddress);
        input.add64(BigInt(amount));
        const encrypted = await input.encrypt();
        const handle = encrypted.handles[0] as string;
        const inputProof = encrypted.inputProof as string;
        return {
          payload: { handle, inputProof },
          isReal: true,
          ciphertextPreview: handle,
        };
      }
    } catch (err) {
      console.warn("Relayer encryption failed, falling back to demo mode:", err);
    }
  }

  // Demo Assist Mode: generate a visually plausible but fake ciphertext preview.
  // This is clearly labeled in the UI; it is NOT submitted to the contract.
  const fakeCipher = generateFakeCiphertext(`${contractAddress}:${userAddress}:${amount}`);
  return {
    payload: { handle: fakeCipher, inputProof: "0x" + "00".repeat(32) },
    isReal: false,
    ciphertextPreview: fakeCipher,
  };
}

export function isRealEncryptionAvailable(): boolean {
  return hasRelayer();
}
