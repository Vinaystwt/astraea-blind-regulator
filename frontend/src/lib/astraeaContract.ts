import { Contract, JsonRpcProvider, type InterfaceAbi } from "ethers";
import type {
  AggregateReportHandles,
  AstraeaPublicSummary,
  EncryptedInputPayload,
  InvestorResultHandles,
} from "@/types/astraea";
import { getContractAddress, loadABI } from "@/config/contract";

export async function getReadOnlyContract(): Promise<Contract | null> {
  const rpcUrl = import.meta.env.VITE_SEPOLIA_RPC_URL || import.meta.env.VITE_RPC_URL;
  if (!rpcUrl) return null;
  const abi = await loadABI();
  const provider = new JsonRpcProvider(rpcUrl);
  return new Contract(getContractAddress(), abi as InterfaceAbi, provider);
}

export async function getPublicFundSummary(contract: Contract): Promise<AstraeaPublicSummary> {
  const summary = await contract.getPublicFundSummary();
  return {
    issuer: String(summary[0]),
    regulator: String(summary[1]),
    fundName: String(summary[2]),
    policyVersion: String(summary[3]),
    maxInvestorSubscription: BigInt(summary[4]),
    maxFundExposure: BigInt(summary[5]),
    fundState: BigInt(summary[6]),
    investorCount: BigInt(summary[7]),
    unitLabel: String(summary[8]),
  };
}

export async function openFund(contract: Contract): Promise<string> {
  const tx = await contract.openFund();
  const receipt = await tx.wait();
  return receipt?.hash ?? tx.hash;
}

export async function closeFund(contract: Contract): Promise<string> {
  const tx = await contract.closeFund();
  const receipt = await tx.wait();
  return receipt?.hash ?? tx.hash;
}

export async function submitSubscription(
  contract: Contract,
  encrypted: EncryptedInputPayload
): Promise<string> {
  const tx = await contract.submit(encrypted.handle, encrypted.inputProof);
  const receipt = await tx.wait();
  return receipt?.hash ?? tx.hash;
}

export async function getMyResultHandles(contract: Contract): Promise<InvestorResultHandles> {
  const [approvedHandle, reasonCodeHandle] = await contract.getMyResultHandles();
  return {
    approvedHandle: String(approvedHandle),
    reasonCodeHandle: String(reasonCodeHandle),
  };
}

export async function getAggregateReportHandles(contract: Contract): Promise<AggregateReportHandles> {
  const [acceptedExposureHandle, acceptedCountHandle, rejectedCountHandle] =
    await contract.getAggregateReportHandles();
  return {
    acceptedExposureHandle: String(acceptedExposureHandle),
    acceptedCountHandle: String(acceptedCountHandle),
    rejectedCountHandle: String(rejectedCountHandle),
  };
}

export async function getInvestorCount(contract: Contract): Promise<number> {
  const count = await contract.getInvestorCount();
  return Number(count);
}

export async function hasInvestorSubmitted(contract: Contract, address: string): Promise<boolean> {
  return contract.hasInvestorSubmitted(address);
}
