import { BrowserProvider } from "ethers";
import type {
  AggregateReportHandles,
  DecryptedAggregateReport,
  DecryptedInvestorResult,
  InvestorResultHandles,
} from "@/types/astraea";
import { hasRelayer, isDemoAssistEnabled, getRelayerUrl } from "@/config/contract";
import { getContractAddress } from "@/config/contract";

export interface DecryptionResult<T> {
  data: T;
  isReal: boolean;
}

// Shared WASM init singleton — same as encryption.ts
let sdkInitialized: Promise<boolean> | null = null;

async function getZamaInstance(): Promise<any | null> {
  if (!hasRelayer()) return null;
  try {
    // Must use /web (ESM) — /bundle reads window.relayerSDK (UMD-only) and crashes in Vite.
    const zamaModule = await import("@zama-fhe/relayer-sdk/web");
    const { initSDK, createInstance, SepoliaConfig } = zamaModule;
    if (typeof createInstance !== "function") return null;

    if (!sdkInitialized) {
      sdkInitialized = initSDK();
    }
    await sdkInitialized;

    const provider = (window as any).ethereum;
    if (!provider) return null;

    const instance = await createInstance({
      ...SepoliaConfig,
      relayerUrl: getRelayerUrl(),
      network: provider,
    });
    return instance;
  } catch (err) {
    console.warn("[Astraea] getZamaInstance failed:", err);
    return null;
  }
}

/**
 * Decrypt an investor's private result using Zama user-decrypt (EIP-712 wallet signature).
 *
 * Flow:
 *   1. Generate an ephemeral keypair (publicKey/privateKey hex, no 0x prefix).
 *   2. Build an EIP-712 message that authorises the KMS to re-encrypt the handles
 *      for our ephemeral public key.
 *   3. Ask the connected wallet to sign (MetaMask popup).
 *   4. Call instance.userDecrypt — relayer verifies the sig, returns plaintext values
 *      re-encrypted under our ephemeral key, which the SDK decrypts locally.
 *   5. Extract approved (bool) and reasonCode (uint8) from the ClearValues map.
 */
export async function decryptMyResult(
  handles: InvestorResultHandles,
  walletAddress: string,
  demoFallback?: DecryptedInvestorResult
): Promise<DecryptionResult<DecryptedInvestorResult>> {
  const instance = await getZamaInstance();

  if (instance) {
    try {
      const contractAddress = getContractAddress();

      // Step 1: Ephemeral keypair (BytesHexNo0x — no 0x prefix, as SDK expects)
      const keypair = instance.generateKeypair();
      const { publicKey, privateKey } = keypair;

      // Step 2: Build EIP-712 (1-day validity window)
      const startTimestamp = Math.floor(Date.now() / 1000);
      const durationDays = 1;
      const eip712 = instance.createEIP712(
        publicKey,
        [contractAddress],
        startTimestamp,
        durationDays
      );

      // Step 3: Wallet signing — triggers MetaMask signature popup
      const ethProvider = new BrowserProvider((window as any).ethereum);
      const signer = await ethProvider.getSigner();
      // ethers v6 signTypedData excludes EIP712Domain from the types object
      const { EIP712Domain: _unused, ...typesForSigning } = eip712.types;
      const signature = await signer.signTypedData(
        eip712.domain,
        typesForSigning,
        eip712.message
      );

      // Step 4: user-decrypt — returns ClearValues: Record<`0x${string}`, bigint|boolean|string>
      const result = await instance.userDecrypt(
        [
          { handle: handles.approvedHandle, contractAddress },
          { handle: handles.reasonCodeHandle, contractAddress },
        ],
        privateKey,
        publicKey,
        signature,
        [contractAddress],
        walletAddress,
        startTimestamp,
        durationDays
      );

      // Step 5: extract by handle key
      const approved = result[handles.approvedHandle as `0x${string}`] as boolean;
      const reasonCode = result[handles.reasonCodeHandle as `0x${string}`] as bigint;

      return { data: { approved, reasonCode }, isReal: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!isDemoAssistEnabled()) {
        throw new Error(`User decrypt failed: ${msg}`);
      }
      console.warn("[Astraea] Real investor decryption failed:", err);
    }
  }

  if (!isDemoAssistEnabled()) {
    throw new Error(
      "Real FHE decryption unavailable: VITE_ZAMA_RELAYER_URL not configured, " +
        "SDK init failed, or wallet not connected."
    );
  }

  if (demoFallback) return { data: demoFallback, isReal: false };
  return { data: { approved: false, reasonCode: BigInt(0) }, isReal: false };
}

/**
 * Decrypt the regulator's aggregate report.
 * Uses publicDecrypt if the contract has ACL-authorized the handles as publicly decryptable,
 * otherwise falls back to demo mode.
 */
export async function decryptAggregateReport(
  handles: AggregateReportHandles,
  demoFallback?: DecryptedAggregateReport
): Promise<DecryptionResult<DecryptedAggregateReport>> {
  const instance = await getZamaInstance();

  if (instance) {
    try {
      // publicDecrypt works only if the contract owner authorised these handles via ACL.
      const result = await instance.publicDecrypt([
        handles.acceptedExposureHandle,
        handles.acceptedCountHandle,
        handles.rejectedCountHandle,
      ]);

      const acceptedExposure = result[
        handles.acceptedExposureHandle as `0x${string}`
      ] as bigint;
      const acceptedCount = result[
        handles.acceptedCountHandle as `0x${string}`
      ] as bigint;
      const rejectedCount = result[
        handles.rejectedCountHandle as `0x${string}`
      ] as bigint;

      return { data: { acceptedExposure, acceptedCount, rejectedCount }, isReal: true };
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!isDemoAssistEnabled()) {
        throw new Error(`Aggregate decrypt failed: ${msg}`);
      }
      console.warn("[Astraea] Real aggregate decryption failed:", err);
    }
  }

  if (!isDemoAssistEnabled()) {
    throw new Error(
      "Real FHE aggregate decryption unavailable: VITE_ZAMA_RELAYER_URL not configured or SDK failed."
    );
  }

  if (demoFallback) return { data: demoFallback, isReal: false };
  return {
    data: { acceptedExposure: BigInt(0), acceptedCount: BigInt(0), rejectedCount: BigInt(0) },
    isReal: false,
  };
}

export function isRealDecryptionAvailable(): boolean {
  return hasRelayer();
}
