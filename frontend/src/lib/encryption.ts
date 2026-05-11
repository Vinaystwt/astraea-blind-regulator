import type { EncryptedInputPayload } from "@/types/astraea";
import { getRelayerUrl, hasRelayer, isDemoAssistEnabled } from "@/config/contract";
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
  const relayerUrl = getRelayerUrl();
  const demoAssist = isDemoAssistEnabled();

  if (hasRelayer()) {
    try {
      // Import the real SDK. Since we installed it, it should be available.
      // We still use dynamic import to avoid bundling issues if the user hasn't run npm install.
      const zamaModule = await import("@zama-fhe/relayer-sdk");
      if (zamaModule && typeof zamaModule.createInstance === "function") {
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
      if (!demoAssist) {
        throw new Error(`Real FHE encryption failed: ${err instanceof Error ? err.message : String(err)}. Zama relayer at ${relayerUrl} might be unreachable.`);
      }
      console.warn("Relayer encryption failed, falling back to demo mode:", err);
    }
  }

  if (!demoAssist) {
    throw new Error("Real FHE encryption unavailable. VITE_ZAMA_RELAYER_URL not configured or SDK failed to initialize.");
  }

  // Demo Assist Mode: generate a visually plausible but fake ciphertext preview.
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
