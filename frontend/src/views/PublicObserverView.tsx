import { useEffect } from "react";
import { useAstraea } from "@/context/AstraeaContext";
import { PolicyCard } from "@/components/domain/PolicyCard";
import { PublicReceiptCard } from "@/components/domain/PublicReceiptCard";
import { PrivacyModelCard } from "@/components/ui/PrivacyModelCard";
import { Button } from "@/components/ui/Button";

export function PublicObserverView() {
  const { publicSummary, publicEvents, refreshEvents, refreshPublicSummary } = useAstraea();

  useEffect(() => {
    refreshPublicSummary();
    refreshEvents();
  }, [refreshPublicSummary, refreshEvents]);

  const submissionEvents = publicEvents.filter(
    (e) => e.type === "InvestorSubmitted" || e.type === "ComplianceReceiptCreated"
  );
  const lifecycleEvents = publicEvents.filter(
    (e) => e.type === "FundCreated" || e.type === "FundOpened" || e.type === "FundClosed"
  );
  const allEvents = publicEvents;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Title */}
      <div>
        <h2
          style={{
            fontFamily: "Cormorant Garamond, Georgia, serif",
            fontSize: "36px",
            fontWeight: 300,
            color: "#EDEDED",
            margin: "0 0 6px",
          }}
        >
          Public Observer
        </h2>
        <p style={{ fontSize: "12px", color: "#A1A1AA", fontFamily: "Inter, sans-serif", margin: 0 }}>
          This feed cryptographically proves policy evaluation occurred without leaking investor state or outcome.
        </p>
      </div>

      {/* Privacy banner — conspicuous */}
      <div
        style={{
          backgroundColor: "#0A0A0B",
          border: "1px solid #27272A",
          padding: "16px 20px",
        }}
      >
        <div
          style={{
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
            color: "#52525B",
            lineHeight: 1.8,
          }}
        >
          <div>
            <span style={{ color: "#8C7D64" }}>NO</span> amount disclosed
          </div>
          <div>
            <span style={{ color: "#8C7D64" }}>NO</span> approval/rejection disclosed
          </div>
          <div>
            <span style={{ color: "#8C7D64" }}>NO</span> reason code disclosed
          </div>
          <div>
            <span style={{ color: "#8C7D64" }}>NO</span> aggregate report disclosed
          </div>
          <div style={{ marginTop: "8px", color: "#A1A1AA" }}>
            <span style={{ color: "#D4AF37" }}>YES</span> fund metadata public
          </div>
          <div>
            <span style={{ color: "#D4AF37" }}>YES</span> compliance receipts public (no-leak)
          </div>
          <div>
            <span style={{ color: "#D4AF37" }}>YES</span> transaction evidence public
          </div>
        </div>
      </div>

      {/* Two columns */}
      <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "24px", alignItems: "start" }}>
        {/* Policy — read only public fields */}
        <div>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#52525B",
              fontFamily: "JetBrains Mono, monospace",
              marginBottom: "10px",
            }}
          >
            Fund Metadata
          </div>
          <PolicyCard summary={publicSummary} />

          <div style={{ marginTop: "16px" }}>
            <Button variant="ghost" onClick={() => { refreshPublicSummary(); refreshEvents(); }}>
              Refresh Feed
            </Button>
          </div>
        </div>

        {/* Receipt timeline */}
        <div>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#52525B",
              fontFamily: "JetBrains Mono, monospace",
              marginBottom: "10px",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <span>Compliance Receipt Feed</span>
            <span style={{ color: "#52525B" }}>
              {allEvents.length} event{allEvents.length !== 1 ? "s" : ""}
            </span>
          </div>

          {allEvents.length === 0 ? (
            <div
              style={{
                backgroundColor: "#141416",
                border: "1px solid #27272A",
                padding: "40px",
                textAlign: "center",
                color: "#52525B",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
              }}
            >
              No events loaded from configured contract. Check RPC URL, deployment block, and contract address.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {allEvents.map((ev, i) => (
                <PublicReceiptCard key={`${ev.txHash}-${i}`} event={ev} />
              ))}
            </div>
          )}
        </div>
      </div>

      <PrivacyModelCard note="The public can verify that the telescope moved and the ledger was stamped. Only authorized roles may look through the lens." />

      {/* Submission count */}
      {submissionEvents.length > 0 && (
        <div
          style={{
            backgroundColor: "#141416",
            border: "1px solid #27272A",
            padding: "12px 20px",
            display: "flex",
            gap: "24px",
          }}
        >
          <Stat label="Submission receipts" value={String(submissionEvents.length)} />
          <Stat label="Lifecycle events" value={String(lifecycleEvents.length)} />
          <Stat label="Total events" value={String(allEvents.length)} />
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div style={{ fontSize: "9px", color: "#52525B", fontFamily: "JetBrains Mono, monospace", marginBottom: "3px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
        {label}
      </div>
      <div style={{ fontSize: "16px", fontFamily: "Cormorant Garamond, Georgia, serif", color: "#EDEDED" }}>
        {value}
      </div>
    </div>
  );
}
