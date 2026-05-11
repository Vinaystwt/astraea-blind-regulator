import { BrowserProvider, Contract, type Eip1193Provider, type InterfaceAbi } from "ethers";
import type {
  AggregateReportHandles,
  AstraeaPublicSummary,
  AstraeaRuntime,
  EncryptedInputPayload,
  InvestorResultHandles
} from "./types";

export async function connectAstraea(
  ethereum: Eip1193Provider,
  contractAddress: string,
  abi: InterfaceAbi
): Promise<AstraeaRuntime> {
  const provider = new BrowserProvider(ethereum);
  const signer = await provider.getSigner();
  const contract = new Contract(contractAddress, abi, signer);
  return { provider, signer, contract };
}

export async function getPublicFundSummary(contract: Contract): Promise<AstraeaPublicSummary> {
  const summary = await contract.getPublicFundSummary();
  return {
    issuer: summary[0],
    regulator: summary[1],
    fundName: summary[2],
    policyVersion: summary[3],
    maxInvestorSubscription: summary[4],
    maxFundExposure: summary[5],
    fundState: summary[6],
    investorCount: summary[7],
    unitLabel: summary[8]
  };
}

export async function submitSubscription(contract: Contract, encrypted: EncryptedInputPayload) {
  const tx = await contract.submit(encrypted.handle, encrypted.inputProof);
  return tx.wait();
}

export async function getMyResultHandles(contract: Contract): Promise<InvestorResultHandles> {
  const [approvedHandle, reasonCodeHandle] = await contract.getMyResultHandles();
  return { approvedHandle, reasonCodeHandle };
}

export async function getAggregateReportHandles(contract: Contract): Promise<AggregateReportHandles> {
  const [acceptedExposureHandle, acceptedCountHandle, rejectedCountHandle] = await contract.getAggregateReportHandles();
  return { acceptedExposureHandle, acceptedCountHandle, rejectedCountHandle };
}

export async function getPublicReceipts(contract: Contract, fromBlock = 0, toBlock: number | string = "latest") {
  const submitted = await contract.queryFilter(contract.filters.InvestorSubmitted(), fromBlock, toBlock);
  const receipts = await contract.queryFilter(contract.filters.ComplianceReceiptCreated(), fromBlock, toBlock);
  return { submitted, receipts };
}
