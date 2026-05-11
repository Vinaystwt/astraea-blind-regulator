import type { DecryptedAggregateReport } from "@/types/astraea";
import { getContractAddress } from "@/config/contract";
import { DEFAULT_CHAIN_ID } from "@/config/networks";
import { FUND_METADATA } from "@/config/demo";
import { SEPOLIA_DEPLOYMENT } from "@/config/deployment";

export interface CertificatePayload {
  project: string;
  fundName: string;
  policyVersion: string;
  contractAddress: string;
  chainId: number;
  mode: "real" | "demo-assist";
  acceptedExposure: string;
  acceptedCount: string;
  rejectedCount: string;
  generatedAt: string;
  txHashes: string[];
  regulatorAddress: string;
  disclaimer: string;
}

export function buildCertificate(
  report: DecryptedAggregateReport,
  txHashes: string[],
  isReal: boolean
): CertificatePayload {
  return {
    project: "Astraea — The Blind Regulator",
    fundName: FUND_METADATA.name,
    policyVersion: FUND_METADATA.policyVersion,
    contractAddress: getContractAddress(),
    chainId: DEFAULT_CHAIN_ID,
    mode: isReal ? "real" : "demo-assist",
    acceptedExposure: report.acceptedExposure.toString(),
    acceptedCount: report.acceptedCount.toString(),
    rejectedCount: report.rejectedCount.toString(),
    generatedAt: new Date().toISOString(),
    txHashes,
    regulatorAddress: SEPOLIA_DEPLOYMENT.actors.regulator,
    disclaimer: "Sepolia testnet demonstration. No real assets, no real KYC, not a licensed compliance product.",
  };
}

export function downloadCertificate(payload: CertificatePayload): void {
  const json = JSON.stringify(payload, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `astraea-certificate-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
