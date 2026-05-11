import { useAstraea } from "@/context/AstraeaContext";
import { Panel } from "@/components/ui/Panel";
import { PolicyCard } from "@/components/domain/PolicyCard";
import { WalletState } from "@/components/ui/WalletState";
import { ReceiptTimeline } from "@/components/ui/ReceiptTimeline";
import { PrivacyModelCard } from "@/components/ui/PrivacyModelCard";
import { Button } from "@/components/ui/Button";
import { openFund, closeFund } from "@/lib/astraeaContract";
import { FUND_STATE_LABEL } from "@/types/astraea";
import { issuerControlsEnabled } from "@/config/contract";

export function IssuerView() {
  const {
    walletStatus,
    contract,
    publicSummary,
    publicEvents,
    addTxHash,
    pushToast,
    refreshPublicSummary,
    refreshEvents,
  } = useAstraea();
  const fundState =
    publicSummary && Number(publicSummary.fundState) in FUND_STATE_LABEL
      ? FUND_STATE_LABEL[Number(publicSummary.fundState) as 0 | 1 | 2]
      : "Unavailable";
  const showIssuerControls = issuerControlsEnabled();

  const handleOpen = async () => {
    if (!contract) { pushToast("error", "Connect wallet first"); return; }
    try {
      const hash = await openFund(contract);
      addTxHash(hash);
      pushToast("success", `Fund opened: ${hash.slice(0, 10)}...`);
      await refreshPublicSummary();
      await refreshEvents();
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "openFund failed");
    }
  };

  const handleClose = async () => {
    if (!contract) { pushToast("error", "Connect wallet first"); return; }
    try {
      const hash = await closeFund(contract);
      addTxHash(hash);
      pushToast("success", `Fund closed: ${hash.slice(0, 10)}...`);
      await refreshPublicSummary();
      await refreshEvents();
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "closeFund failed");
    }
  };

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
          Issuer Dashboard
        </h2>
        <p style={{ fontSize: "12px", color: "#52525B", fontFamily: "Inter, sans-serif", margin: 0 }}>
          The policy is public. Investor facts are encrypted. Outcomes are only decrypted by authorized parties.
        </p>
      </div>

      {/* Wallet warning */}
      {walletStatus !== "connected" && <WalletState status={walletStatus} />}

      {/* Top metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
        <MetricBox label="Max Investor Sub" value={publicSummary ? Number(publicSummary.maxInvestorSubscription).toLocaleString() : "500,000"} unit="units" />
        <MetricBox label="Max Fund Exposure" value={publicSummary ? Number(publicSummary.maxFundExposure).toLocaleString() : "700,000"} unit="units" />
        <MetricBox label="Investor Count" value={publicSummary ? publicSummary.investorCount.toString() : "Loading"} />
        <MetricBox label="Fund State" value={fundState} />
      </div>

      {/* Main layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", alignItems: "start" }}>
        {/* Policy */}
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
            Active Policy
          </div>
          <PolicyCard summary={publicSummary} />
        </div>

        {/* Controls */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#52525B",
              fontFamily: "JetBrains Mono, monospace",
              marginBottom: "0px",
            }}
          >
            Lifecycle Controls
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <Button variant="secondary" onClick={refreshPublicSummary}>
              Refresh Summary
            </Button>
            {showIssuerControls ? (
              <>
                <Button variant="primary" onClick={handleOpen} disabled={walletStatus !== "connected"}>
                  Open Fund
                </Button>
                <Button variant="danger" onClick={handleClose} disabled={walletStatus !== "connected"}>
                  Close Fund
                </Button>
              </>
            ) : (
              <div
                style={{
                  border: "1px solid #27272A",
                  backgroundColor: "#141416",
                  color: "#A1A1AA",
                  fontFamily: "Inter, sans-serif",
                  fontSize: "13px",
                  padding: "8px 12px",
                }}
              >
                Issuer controls are disabled for this public demo. The Sepolia fund is already open.
              </div>
            )}
          </div>

          <PrivacyModelCard />

          <Panel title="Disclosure Rules" noPad>
            <div
              style={{
                padding: "16px",
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "11px",
                color: "#52525B",
                lineHeight: 1.9,
              }}
            >
              <div style={{ color: "#A1A1AA" }}>public  → fund metadata + receipts</div>
              <div>investor → own result only (encrypted handle)</div>
              <div>regulator → aggregate report only</div>
              <div style={{ color: "#3B3B3F" }}>issuer  → public policy (P0 scope)</div>
            </div>
          </Panel>
        </div>
      </div>

      {/* Receipt feed */}
      <div>
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#52525B",
            fontFamily: "JetBrains Mono, monospace",
            marginBottom: "12px",
          }}
        >
          Public Receipt Feed
        </div>
        <ReceiptTimeline events={publicEvents} />
      </div>
    </div>
  );
}

function MetricBox({ label, value, unit }: { label: string; value: string; unit?: string }) {
  return (
    <div
      style={{
        backgroundColor: "#1C1C1F",
        border: "1px solid #27272A",
        padding: "14px 16px",
      }}
    >
      <div
        style={{
          fontSize: "9px",
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "#52525B",
          fontFamily: "JetBrains Mono, monospace",
          marginBottom: "6px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "20px",
          fontFamily: "Cormorant Garamond, Georgia, serif",
          color: "#EDEDED",
        }}
      >
        {value}
      </div>
      {unit && (
        <div style={{ fontSize: "9px", color: "#52525B", fontFamily: "JetBrains Mono, monospace", marginTop: "2px" }}>
          {unit}
        </div>
      )}
    </div>
  );
}
