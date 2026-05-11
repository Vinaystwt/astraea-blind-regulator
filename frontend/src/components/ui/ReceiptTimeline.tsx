import type { PublicReceiptEvent } from "@/types/astraea";
import { useAstraea } from "@/context/AstraeaContext";
import { TxHashLink } from "./TxHashLink";
import { truncateAddress, formatTimestamp } from "@/lib/format";

const EVENT_LABELS: Record<string, string> = {
  FundCreated: "Fund Created",
  FundOpened: "Fund Opened",
  InvestorSubmitted: "Investor Submitted",
  ComplianceReceiptCreated: "Compliance Receipt Created",
  FundClosed: "Fund Closed",
};

interface ReceiptTimelineProps {
  events: PublicReceiptEvent[];
}

export function ReceiptTimeline({ events }: ReceiptTimelineProps) {
  const { chainId } = useAstraea();

  if (events.length === 0) {
    return (
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          color: "#52525B",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "12px",
          border: "1px solid #27272A",
          backgroundColor: "#141416",
        }}
      >
        No on-chain events found. Connect wallet and ensure contract is deployed.
      </div>
    );
  }

  return (
    <div style={{ position: "relative" }}>
      {/* Vertical line */}
      <div
        style={{
          position: "absolute",
          left: "11px",
          top: "12px",
          bottom: "12px",
          width: "1px",
          borderLeft: "1px dashed #27272A",
        }}
      />

      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
        {events.map((ev, idx) => (
          <div key={`${ev.txHash}-${idx}`} className="fade-slide-in" style={{ display: "flex", gap: "20px", paddingBottom: "2px" }}>
            {/* Dot */}
            <div style={{ flexShrink: 0, paddingTop: "14px" }}>
              <div
                style={{
                  width: "7px",
                  height: "7px",
                  border: "1px solid #8C7D64",
                  backgroundColor: "#0A0A0B",
                  borderRadius: 0,
                  position: "relative",
                  zIndex: 1,
                }}
              />
            </div>

            {/* Receipt card */}
            <div
              style={{
                flex: 1,
                backgroundColor: "#141416",
                border: "1px solid #27272A",
                padding: "12px 16px",
                marginBottom: "6px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontFamily: "JetBrains Mono, monospace",
                      color: "#A1A1AA",
                      marginBottom: "4px",
                    }}
                  >
                    {EVENT_LABELS[ev.type] ?? ev.type}
                  </div>
                  {ev.investorAddress && (
                    <div
                      style={{
                        fontSize: "11px",
                        fontFamily: "JetBrains Mono, monospace",
                        color: "#52525B",
                      }}
                    >
                      investor: {truncateAddress(ev.investorAddress)}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: "right" }}>
                  <TxHashLink hash={ev.txHash} chainId={chainId} />
                  <div
                    style={{
                      fontSize: "10px",
                      fontFamily: "JetBrains Mono, monospace",
                      color: "#52525B",
                      marginTop: "3px",
                    }}
                  >
                    {ev.timestamp ? formatTimestamp(ev.timestamp) : `block ${ev.blockNumber}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
