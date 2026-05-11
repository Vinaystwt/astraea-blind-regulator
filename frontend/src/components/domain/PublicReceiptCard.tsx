import type { PublicReceiptEvent } from "@/types/astraea";
import { TxHashLink } from "@/components/ui/TxHashLink";
import { truncateAddress, formatTimestamp } from "@/lib/format";
import { DEFAULT_CHAIN_ID } from "@/config/networks";

const EVENT_DESCRIPTIONS: Record<string, string> = {
  FundCreated: "Fund created with encrypted policy constraints",
  FundOpened: "Fund opened for subscriptions",
  InvestorSubmitted: "Encrypted subscription received — outcome sealed",
  ComplianceReceiptCreated: "Compliance receipt stamped — no investor state disclosed",
  FundClosed: "Fund closed",
};

interface PublicReceiptCardProps {
  event: PublicReceiptEvent;
}

export function PublicReceiptCard({ event }: PublicReceiptCardProps) {
  return (
    <div
      className="fade-slide-in"
      style={{
        backgroundColor: "#141416",
        border: "1px solid #27272A",
        padding: "14px 18px",
        borderRadius: 0,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: "11px",
              fontFamily: "JetBrains Mono, monospace",
              color: "#A1A1AA",
              marginBottom: "4px",
            }}
          >
            {event.type}
          </div>
          <div
            style={{
              fontSize: "11px",
              color: "#52525B",
              fontFamily: "Inter, sans-serif",
              lineHeight: 1.5,
            }}
          >
            {EVENT_DESCRIPTIONS[event.type] ?? event.type}
          </div>
          {event.investorAddress && (
            <div
              style={{
                fontSize: "10px",
                fontFamily: "JetBrains Mono, monospace",
                color: "#52525B",
                marginTop: "4px",
              }}
            >
              investor: {truncateAddress(event.investorAddress)}
            </div>
          )}
        </div>

        <div style={{ textAlign: "right", flexShrink: 0, marginLeft: "16px" }}>
          <TxHashLink hash={event.txHash} chainId={DEFAULT_CHAIN_ID} />
          <div
            style={{
              fontSize: "10px",
              fontFamily: "JetBrains Mono, monospace",
              color: "#52525B",
              marginTop: "3px",
            }}
          >
            {event.timestamp ? formatTimestamp(event.timestamp) : `block ${event.blockNumber}`}
          </div>
        </div>
      </div>
    </div>
  );
}
