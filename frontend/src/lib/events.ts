import type { Contract, EventLog, Log } from "ethers";
import type { PublicReceiptEvent } from "@/types/astraea";
import { DEFAULT_CHAIN_ID } from "@/config/networks";
import { SEPOLIA_DEPLOYMENT } from "@/config/deployment";

const FROM_BLOCK_DEFAULT =
  DEFAULT_CHAIN_ID === SEPOLIA_DEPLOYMENT.chainId ? SEPOLIA_DEPLOYMENT.deploymentBlock : 0;

function getInvestorFromLog(e: Log | EventLog): string | undefined {
  if ("args" in e && e.args) return String(e.args[0]);
  return undefined;
}

export async function fetchPublicEvents(contract: Contract, fromBlock = FROM_BLOCK_DEFAULT): Promise<PublicReceiptEvent[]> {
  const events: PublicReceiptEvent[] = [];

  const addEvents = async (
    type: PublicReceiptEvent["type"],
    filter: ReturnType<typeof contract.filters.FundCreated>
  ) => {
    try {
      const logs = await contract.queryFilter(filter, fromBlock);
      for (const e of logs) {
        const block = await e.getBlock();
        events.push({
          type,
          txHash: e.transactionHash,
          blockNumber: e.blockNumber,
          timestamp: block.timestamp,
          investorAddress:
            type === "InvestorSubmitted" || type === "ComplianceReceiptCreated"
              ? getInvestorFromLog(e)
              : undefined,
        });
      }
    } catch {
      // event may not have fired yet
    }
  };

  await addEvents("FundCreated", contract.filters.FundCreated());
  await addEvents("FundOpened", contract.filters.FundOpened());
  await addEvents("InvestorSubmitted", contract.filters.InvestorSubmitted());
  await addEvents("ComplianceReceiptCreated", contract.filters.ComplianceReceiptCreated());
  await addEvents("FundClosed", contract.filters.FundClosed());

  return events.sort((a, b) => a.blockNumber - b.blockNumber);
}
