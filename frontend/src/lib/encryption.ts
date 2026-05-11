import { hexlify } from "ethers";
import type { EncryptedInputPayload } from "@/types/astraea";
import { getRelayerUrl, hasRelayer, isDemoAssistEnabled } from "@/config/contract";
import { generateFakeCiphertext } from "@/lib/format";

export interface EncryptionResult {
  payload: EncryptedInputPayload;
  isReal: boolean;
  ciphertextPreview: string;
}

// Singleton: initSDK() loads WASM — expensive. Run once, share the promise.
let sdkInitialized: Promise<boolean> | null = null;

export async function encryptAmount(
  contractAddress: string,
  userAddress: string,
  amount: number
): Promise<EncryptionResult> {
  const relayerUrl = getRelayerUrl();
  const demoAssist = isDemoAssistEnabled();

  if (hasRelayer()) {
    try {
      // CRITICAL: import from /web (proper ESM for Vite).
      // /bundle exports window.relayerSDK.initSDK — window.relayerSDK is only
      // set by loading the UMD IIFE via <script> tag; in ESM context it is
      // undefined, causing "Cannot read properties of undefined (reading 'initSDK')".
      const zamaModule = await import("@zama-fhe/relayer-sdk/web");
      const { initSDK, createInstance, SepoliaConfig } = zamaModule;

      if (typeof createInstance !== "function") {
        throw new Error(
          "@zama-fhe/relayer-sdk/web did not export createInstance — wrong SDK version or corrupt install"
        );
      }

      // Load WASM (idempotent — singleton promise)
      if (!sdkInitialized) {
        sdkInitialized = initSDK();
      }
      await sdkInitialized;

      const provider = (window as any).ethereum;
      if (!provider) {
        throw new Error(
          "No EIP-1193 provider found. Open MetaMask and connect your wallet before encrypting."
        );
      }

      // Spread SepoliaConfig (contains all contract addresses, chainId, gatewayChainId, relayerUrl).
      // Override relayerUrl with the env var so we support other deployments.
      const instance = await createInstance({
        ...SepoliaConfig,
        relayerUrl,
        network: provider,
      });

      const input = instance.createEncryptedInput(contractAddress, userAddress);
      input.add64(BigInt(amount));
      const encrypted = await input.encrypt();
      // encrypt() returns { handles: Uint8Array[], inputProof: Uint8Array }
      // hexlify converts to 0x-prefixed hex strings expected by EncryptedInputPayload / ethers ABI
      const handle = hexlify(encrypted.handles[0]);
      const inputProof = hexlify(encrypted.inputProof);

      return {
        payload: { handle, inputProof },
        isReal: true,
        ciphertextPreview: handle,
      };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!demoAssist) {
        throw new Error(`Real FHE encryption failed: ${msg}`);
      }
      console.warn("[Astraea] Relayer encryption failed, falling back to demo mode:", err);
    }
  }

  if (!demoAssist) {
    throw new Error(
      "Real FHE encryption unavailable: VITE_ZAMA_RELAYER_URL is not set. " +
        "Set it in .env and redeploy to enable real encryption."
    );
  }

  // Demo Assist only — visual preview, never submitted to real contract
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
