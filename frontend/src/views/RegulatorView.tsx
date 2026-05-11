import { useEffect } from "react";
import { useAstraea } from "@/context/AstraeaContext";
import { WalletState } from "@/components/ui/WalletState";
import { AggregateReportCard } from "@/components/domain/AggregateReportCard";
import { JSONCertificateButton } from "@/components/domain/JSONCertificateButton";
import { PrivacyModelCard } from "@/components/ui/PrivacyModelCard";
import { TxHashLink } from "@/components/ui/TxHashLink";
import { getAggregateReportHandles } from "@/lib/astraeaContract";
import { Button } from "@/components/ui/Button";
import { SEPOLIA_DEPLOYMENT } from "@/config/deployment";

export function RegulatorView() {
  const {
    walletStatus,
    contract,
    setAggregateHandles,
    txHashes,
    chainId,
    pushToast,
    aggregateReport,
    walletAddress,
  } = useAstraea();
  const walletMatchesRegulator =
    walletStatus === "connected" &&
    walletAddress.toLowerCase() === SEPOLIA_DEPLOYMENT.actors.regulator.toLowerCase();

  const fetchHandles = async () => {
    if (!contract || !walletMatchesRegulator) {
      pushToast("error", "Connected wallet is not the configured regulator.");
      return;
    }
    try {
      const handles = await getAggregateReportHandles(contract);
      setAggregateHandles(handles);
      pushToast("info", "Aggregate report handles loaded");
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Failed to fetch handles");
    }
  };

  useEffect(() => {
    if (contract && walletMatchesRegulator) fetchHandles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contract]);

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
          Regulator
        </h2>
        <p style={{ fontSize: "12px", color: "#A1A1AA", fontFamily: "Inter, sans-serif", margin: 0 }}>
          Aggregate metrics decrypted locally. Individual investor books remain mathematically sealed.
        </p>
      </div>

      {/* Wallet warning */}
      {walletStatus !== "connected" && <WalletState status={walletStatus} />}
      {walletStatus === "connected" && !walletMatchesRegulator && (
        <div
          style={{
            backgroundColor: "#2A1F0E",
            border: "1px solid #D4AF3730",
            padding: "12px 16px",
            color: "#D4AF37",
            fontSize: "12px",
            fontFamily: "Inter, sans-serif",
          }}
        >
          Connected wallet is not the configured regulator.
        </div>
      )}

      {/* Controls */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <Button variant="secondary" onClick={fetchHandles} disabled={!walletMatchesRegulator}>
          Fetch Aggregate Handles
        </Button>
        {aggregateReport && <JSONCertificateButton />}
      </div>

      {/* Aggregate report card */}
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
          Encrypted Aggregate Report
        </div>
        <AggregateReportCard />
      </div>

      {/* TX evidence */}
      {txHashes.length > 0 && (
        <div
          style={{
            backgroundColor: "#141416",
            border: "1px solid #27272A",
          }}
        >
          <div
            style={{
              padding: "12px 18px",
              borderBottom: "1px solid #27272A",
              fontSize: "10px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#52525B",
              fontFamily: "JetBrains Mono, monospace",
            }}
          >
            Transaction Evidence
          </div>
          <div style={{ padding: "12px 18px", display: "flex", flexDirection: "column", gap: "6px" }}>
            {txHashes.map((hash, i) => (
              <div key={hash} style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span style={{ fontSize: "10px", color: "#52525B", fontFamily: "JetBrains Mono, monospace" }}>
                  [{String(i + 1).padStart(2, "0")}]
                </span>
                <TxHashLink hash={hash} chainId={chainId} />
              </div>
            ))}
          </div>
        </div>
      )}

      <PrivacyModelCard note="The regulator may decrypt aggregate accepted exposure, accepted count, and rejected count. No individual investor results are accessible through this role." />
    </div>
  );
}
