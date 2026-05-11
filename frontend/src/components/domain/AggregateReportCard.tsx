import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import type { DecryptedAggregateReport } from "@/types/astraea";
import { useAstraea } from "@/context/AstraeaContext";
import { DEMO_REGULATOR_AGGREGATE, FUND_METADATA } from "@/config/demo";
import { decryptAggregateReport, isRealDecryptionAvailable } from "@/lib/decryption";
import { Button } from "@/components/ui/Button";
import { CiphertextBox } from "@/components/ui/CiphertextBox";
import { DemoModeBanner } from "@/components/ui/DemoModeBanner";
import { formatAmount } from "@/lib/format";
import { isDemoAssistEnabled } from "@/config/contract";
import { SEPOLIA_DEPLOYMENT } from "@/config/deployment";

export function AggregateReportCard() {
  const { aggregateHandles, aggregateReport, aggregateIsReal, walletAddress, walletStatus, setAggregateReport, pushToast } =
    useAstraea();
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const demoAssist = isDemoAssistEnabled();

  const realDecryptAvailable = isRealDecryptionAvailable();

  const demoFallback: DecryptedAggregateReport = {
    acceptedExposure: BigInt(DEMO_REGULATOR_AGGREGATE.acceptedExposure),
    acceptedCount: BigInt(DEMO_REGULATOR_AGGREGATE.acceptedCount),
    rejectedCount: BigInt(DEMO_REGULATOR_AGGREGATE.rejectedCount),
  };
  const regulatorAddress = SEPOLIA_DEPLOYMENT.actors.regulator;
  const walletMatchesRegulator = walletAddress.toLowerCase() === regulatorAddress.toLowerCase();
  const canDecryptReal = walletStatus === "connected" && walletMatchesRegulator && !!aggregateHandles;

  const handleDecrypt = async () => {
    if (!canDecryptReal || !aggregateHandles) {
      pushToast("warning", "Connect the configured regulator wallet and fetch aggregate handles before decrypting.");
      return;
    }
    setIsDecrypting(true);
    try {
      const result = await decryptAggregateReport(aggregateHandles, demoFallback);
      if (!result.isReal && !demoAssist) {
        pushToast("error", "Real regulator decrypt is unavailable in this browser session.");
        return;
      }
      setAggregateReport(result.data, result.isReal);
      setRevealed(true);
      if (!result.isReal) {
        pushToast("info", "Demo Assist: showing expected aggregate. Zama relayer required for real decryption.");
      } else {
        pushToast("success", "Aggregate report decrypted from chain");
      }
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Decryption failed");
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleShowExpected = () => {
    setAggregateReport(demoFallback, false);
    setRevealed(true);
    pushToast("info", "Demo Assist expected aggregate — not wallet-authorized decrypt.");
  };

  const report = aggregateReport;
  const capacity = BigInt(FUND_METADATA.maxFundExposure);
  const remaining = report ? capacity - report.acceptedExposure : capacity;
  const usedPct = report ? Number((report.acceptedExposure * BigInt(100)) / capacity) : 0;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {!realDecryptAvailable && demoAssist && (
        <DemoModeBanner message="Aggregate metrics decrypted locally. Zama relayer required for real on-chain decryption. Demo values shown below for recording." />
      )}

      {walletStatus === "connected" && !walletMatchesRegulator && (
        <div
          style={{
            backgroundColor: "#2A1F0E",
            border: "1px solid #D4AF3730",
            padding: "10px 12px",
            color: "#D4AF37",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Connected wallet is not the configured regulator.
        </div>
      )}

      {/* Handles */}
      {aggregateHandles && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <CiphertextBox value={aggregateHandles.acceptedExposureHandle} label="Accepted Exposure Handle (euint64)" />
          <CiphertextBox value={aggregateHandles.acceptedCountHandle} label="Accepted Count Handle (euint64)" />
          <CiphertextBox value={aggregateHandles.rejectedCountHandle} label="Rejected Count Handle (euint64)" />
        </div>
      )}

      {/* Decrypt button */}
      <Button
        variant="gold"
        loading={isDecrypting}
        onClick={handleDecrypt}
        disabled={!canDecryptReal || isDecrypting}
      >
        <Unlock size={12} />
        {isDecrypting ? "Decrypting..." : "Decrypt Aggregate Compliance Report"}
      </Button>
      {demoAssist && (
        <Button variant="secondary" onClick={handleShowExpected}>
          Demo Assist: Show Expected Aggregate
        </Button>
      )}

      {/* Revealed report */}
      {(report || revealed) && report && (
        <div
          className="wipe-reveal"
          style={{
            backgroundColor: "#141416",
            border: "1px solid #D4AF3730",
            padding: "24px",
          }}
        >
          <div
            style={{
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#52525B",
              fontFamily: "JetBrains Mono, monospace",
              marginBottom: "16px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Lock size={10} />
            {aggregateIsReal ? "Wallet-authorized aggregate decrypt" : "Demo Assist expected aggregate"} — {FUND_METADATA.name}
          </div>

          {/* Metrics row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px", marginBottom: "20px" }}>
            <Metric label="Accepted Exposure" value={formatAmount(report.acceptedExposure)} unit="units" gold />
            <Metric label="Accepted Count" value={report.acceptedCount.toString()} />
            <Metric label="Rejected Count" value={report.rejectedCount.toString()} />
          </div>

          {/* Capacity bar */}
          <div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "6px",
                fontSize: "10px",
                color: "#52525B",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              <span>Fund Capacity Used</span>
              <span>{usedPct}% / {formatAmount(capacity)} max</span>
            </div>
            <div
              style={{
                height: "4px",
                backgroundColor: "#27272A",
                borderRadius: 0,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${usedPct}%`,
                  backgroundColor: "#D4AF37",
                  transition: "width 0.6s ease-out",
                }}
              />
            </div>
            <div
              style={{
                marginTop: "4px",
                fontSize: "10px",
                color: "#52525B",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              Remaining: {formatAmount(remaining)} units
            </div>
          </div>

          <div
            style={{
              marginTop: "16px",
              paddingTop: "12px",
              borderTop: "1px solid #27272A",
              fontSize: "11px",
              color: "#52525B",
              fontFamily: "Inter, sans-serif",
            }}
          >
            Aggregate metrics decrypted locally. Individual investor books remain mathematically sealed.
          </div>

          {!aggregateIsReal && (
            <div
              style={{
                marginTop: "8px",
                fontSize: "10px",
                color: "#8C7D64",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              Demo Assist expected aggregate — not wallet-authorized decrypt.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Metric({ label, value, unit, gold }: { label: string; value: string; unit?: string; gold?: boolean }) {
  return (
    <div
      style={{
        backgroundColor: "#1C1C1F",
        border: `1px solid ${gold ? "#D4AF3730" : "#27272A"}`,
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
          color: gold ? "#D4AF37" : "#EDEDED",
          lineHeight: 1.1,
        }}
      >
        {value}
      </div>
      {unit && (
        <div
          style={{
            fontSize: "9px",
            color: "#52525B",
            fontFamily: "JetBrains Mono, monospace",
            marginTop: "3px",
          }}
        >
          {unit}
        </div>
      )}
    </div>
  );
}
