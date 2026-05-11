import type { Contract, EventLog, Log } from "ethers";
import type { PublicReceiptEvent } from "@/types/astraea";
import { DEFAULT_CHAIN_ID } from "@/config/networks";
import { SEPOLIA_DEPLOYMENT } from "@/config/deployment";

const FROM_BLOCK_DEFAULT =
  DEFAULT_CHAIN_ID === SEPOLIA_DEPLOYMENT.chainId ? SEPOLIA_DEPLOYMENT.deploymentBlock : 0;
const LOG_BLOCK_SPAN = 9;

function getInvestorFromLog(e: Log | EventLog): string | undefined {
  if ("args" in e && e.args) return String(e.args[0]);
  return undefined;
}

function isAstraeaEvent(type: string): type is PublicReceiptEvent["type"] {
  return (
    type === "FundCreated" ||
    type === "FundOpened" ||
    type === "InvestorSubmitted" ||
    type === "ComplianceReceiptCreated" ||
    type === "FundClosed"
  );
}

export async function fetchPublicEvents(contract: Contract, fromBlock = FROM_BLOCK_DEFAULT): Promise<PublicReceiptEvent[]> {
  const runner = contract.runner;
  if (!runner || !("provider" in runner) || !runner.provider) return [];

  const provider = runner.provider;
  const latest = await provider.getBlockNumber();
  const events: PublicReceiptEvent[] = [];
  const blockTimestamp = new Map<number, number>();

  for (let start = fromBlock; start <= latest; start += LOG_BLOCK_SPAN + 1) {
    const end = Math.min(start + LOG_BLOCK_SPAN, latest);
    const logs = await provider.getLogs({
      address: await contract.getAddress(),
      fromBlock: start,
      toBlock: end,
    });

    for (const log of logs) {
      const parsed = contract.interface.parseLog(log);
      if (!parsed || !isAstraeaEvent(parsed.name)) continue;
      let timestamp = blockTimestamp.get(log.blockNumber);
      if (!timestamp) {
        const block = await provider.getBlock(log.blockNumber);
        timestamp = block?.timestamp ?? 0;
        blockTimestamp.set(log.blockNumber, timestamp);
      }
      events.push({
        type: parsed.name,
        txHash: log.transactionHash,
        blockNumber: log.blockNumber,
        timestamp,
        investorAddress:
          parsed.name === "InvestorSubmitted" || parsed.name === "ComplianceReceiptCreated"
            ? getInvestorFromLog({ ...log, args: parsed.args } as EventLog)
            : undefined,
      });
    }
  }

  return events.sort((a, b) => a.blockNumber - b.blockNumber);
}
