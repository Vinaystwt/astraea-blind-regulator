import type {
  AggregateReportHandles,
  DecryptedAggregateReport,
  DecryptedInvestorResult,
  InvestorResultHandles,
} from "@/types/astraea";
import { hasRelayer, isDemoAssistEnabled } from "@/config/contract";

export interface DecryptionResult<T> {
  data: T;
  isReal: boolean;
}

async function getDecryptors(): Promise<{
  decryptBool: (handle: string) => Promise<boolean>;
  decryptUint8: (handle: string) => Promise<bigint>;
  decryptUint64: (handle: string) => Promise<bigint>;
} | null> {
  if (!hasRelayer()) return null;
  const demoAssist = isDemoAssistEnabled();
  try {
    const zamaModule = await import("@zama-fhe/relayer-sdk");
    if (!zamaModule || typeof zamaModule.createInstance !== "function") return null;
    const { createInstance } = zamaModule;
    const instance = await createInstance({ relayerUrl: import.meta.env.VITE_ZAMA_RELAYER_URL });
    return {
      decryptBool: (handle: string) => instance.reencrypt(handle) as Promise<boolean>,
      decryptUint8: (handle: string) => instance.reencrypt(handle) as Promise<bigint>,
      decryptUint64: (handle: string) => instance.reencrypt(handle) as Promise<bigint>,
    };
  } catch (err) {
    if (!demoAssist) {
      console.error("Real decryption initialization failed:", err);
    }
    return null;
  }
}

export async function decryptMyResult(
  handles: InvestorResultHandles,
  demoFallback?: DecryptedInvestorResult
): Promise<DecryptionResult<DecryptedInvestorResult>> {
  const decryptors = await getDecryptors();
  const demoAssist = isDemoAssistEnabled();

  if (decryptors) {
    try {
      const approved = await decryptors.decryptBool(handles.approvedHandle);
      const reasonCode = await decryptors.decryptUint8(handles.reasonCodeHandle);
      return { data: { approved, reasonCode }, isReal: true };
    } catch (err) {
      if (!demoAssist) {
        throw new Error(`Real decryption failed: ${err instanceof Error ? err.message : String(err)}`);
      }
      console.warn("Real decryption failed, falling back to demo mode:", err);
    }
  }

  if (demoFallback && demoAssist) {
    return { data: demoFallback, isReal: false };
  }

  if (!demoAssist) {
    throw new Error("Real FHE decryption unavailable. Zama relayer not configured or unreachable.");
  }

  return {
    data: { approved: false, reasonCode: BigInt(0) },
    isReal: false,
  };
}

export async function decryptAggregateReport(
  handles: AggregateReportHandles,
  demoFallback?: DecryptedAggregateReport
): Promise<DecryptionResult<DecryptedAggregateReport>> {
  const decryptors = await getDecryptors();
  const demoAssist = isDemoAssistEnabled();

  if (decryptors) {
    try {
      const acceptedExposure = await decryptors.decryptUint64(handles.acceptedExposureHandle);
      const acceptedCount = await decryptors.decryptUint64(handles.acceptedCountHandle);
      const rejectedCount = await decryptors.decryptUint64(handles.rejectedCountHandle);
      return { data: { acceptedExposure, acceptedCount, rejectedCount }, isReal: true };
    } catch (err) {
      if (!demoAssist) {
        throw new Error(`Real aggregate decryption failed: ${err instanceof Error ? err.message : String(err)}`);
      }
      console.warn("Real aggregate decryption failed, falling back to demo mode:", err);
    }
  }

  if (demoFallback && demoAssist) {
    return { data: demoFallback, isReal: false };
  }

  if (!demoAssist) {
    throw new Error("Real FHE aggregate decryption unavailable. Zama relayer not configured or unreachable.");
  }

  return {
    data: { acceptedExposure: BigInt(0), acceptedCount: BigInt(0), rejectedCount: BigInt(0) },
    isReal: false,
  };
}

export function isRealDecryptionAvailable(): boolean {
  return hasRelayer();
}
