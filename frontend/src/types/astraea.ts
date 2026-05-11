export type Role = "home" | "issuer" | "investor-a" | "investor-b" | "investor-c" | "public" | "regulator" | "demo";

export type FundState = 0 | 1 | 2; // Created | Open | Closed

export const FUND_STATE_LABEL: Record<FundState, string> = {
  0: "Created",
  1: "Open",
  2: "Closed",
};

export type InvestorKey = "A" | "B" | "C";

export interface InvestorDemoConfig {
  key: InvestorKey;
  label: string;
  address: string;
  amount: number;
  expectedOutcome: "APPROVED" | "REJECTED";
  expectedReason: number;
  expectedReasonText: string;
}

export interface AstraeaPublicSummary {
  issuer: string;
  regulator: string;
  fundName: string;
  policyVersion: string;
  maxInvestorSubscription: bigint;
  maxFundExposure: bigint;
  fundState: bigint;
  investorCount: bigint;
  unitLabel: string;
}

export interface EncryptedInputPayload {
  handle: string;
  inputProof: string;
}

export interface InvestorResultHandles {
  approvedHandle: string;
  reasonCodeHandle: string;
}

export interface AggregateReportHandles {
  acceptedExposureHandle: string;
  acceptedCountHandle: string;
  rejectedCountHandle: string;
}

export interface DecryptedInvestorResult {
  approved: boolean;
  reasonCode: bigint;
}

export interface DecryptedAggregateReport {
  acceptedExposure: bigint;
  acceptedCount: bigint;
  rejectedCount: bigint;
}

export interface PublicReceiptEvent {
  type: "FundCreated" | "FundOpened" | "InvestorSubmitted" | "ComplianceReceiptCreated" | "FundClosed";
  txHash: string;
  blockNumber: number;
  timestamp: number;
  investorAddress?: string;
  ciphertextHandle?: string;
}

export type WalletStatus =
  | "no-provider"
  | "not-connected"
  | "wrong-network"
  | "connected"
  | "contract-missing"
  | "relayer-missing";

export interface NetworkConfig {
  chainId: number;
  name: string;
  explorerTxUrl: string;
  explorerAddressUrl?: string;
  isLocal: boolean;
}

export interface ToastMessage {
  id: string;
  type: "info" | "success" | "error" | "warning";
  message: string;
}

export const REASON_CODE_TEXT: Record<number, string> = {
  1: "Approved — subscription accepted",
  2: "Rejected — per-investor subscription cap exceeded",
  3: "Rejected — fund capacity fully subscribed",
};
