import type { BrowserProvider, Contract, ContractRunner, JsonRpcSigner } from "ethers";

export type AstraeaAddresses = {
  AstraeaFund: string;
  chainId: number;
};

export type AstraeaPublicSummary = {
  issuer: string;
  regulator: string;
  fundName: string;
  policyVersion: string;
  maxInvestorSubscription: bigint;
  maxFundExposure: bigint;
  fundState: bigint;
  investorCount: bigint;
  unitLabel: string;
};

export type EncryptedInputPayload = {
  handle: string;
  inputProof: string;
};

export type InvestorResultHandles = {
  approvedHandle: string;
  reasonCodeHandle: string;
};

export type AggregateReportHandles = {
  acceptedExposureHandle: string;
  acceptedCountHandle: string;
  rejectedCountHandle: string;
};

export type DecryptedInvestorResult = {
  approved: boolean;
  reasonCode: bigint;
};

export type DecryptedAggregateReport = {
  acceptedExposure: bigint;
  acceptedCount: bigint;
  rejectedCount: bigint;
};

export type AstraeaRuntime = {
  provider: BrowserProvider;
  signer: JsonRpcSigner;
  contract: Contract;
};

export type RelayerLike = {
  createEncryptedInput(contractAddress: string, userAddress: string): {
    add64(value: bigint | number): void;
    encrypt(): Promise<{ handles: string[]; inputProof: string }>;
  };
  userDecrypt?: (...args: unknown[]) => Promise<Record<string, unknown>>;
};

export type EthersRunner = ContractRunner;
