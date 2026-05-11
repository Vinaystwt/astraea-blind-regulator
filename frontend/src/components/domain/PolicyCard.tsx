import type { AstraeaPublicSummary } from "@/types/astraea";
import { formatAmount, formatFundState } from "@/lib/format";
import { FUND_METADATA } from "@/config/demo";

interface PolicyCardProps {
  summary?: AstraeaPublicSummary | null;
}

export function PolicyCard({ summary }: PolicyCardProps) {
  const name = summary?.fundName ?? FUND_METADATA.name;
  const version = summary?.policyVersion ?? FUND_METADATA.policyVersion;
  const maxInv = summary
    ? formatAmount(summary.maxInvestorSubscription)
    : formatAmount(FUND_METADATA.maxInvestorSubscription);
  const maxFund = summary
    ? formatAmount(summary.maxFundExposure)
    : formatAmount(FUND_METADATA.maxFundExposure);
  const unit = summary?.unitLabel ?? FUND_METADATA.unitLabel;
  const state = summary ? formatFundState(summary.fundState) : "—";
  const issuer = summary?.issuer;
  const regulator = summary?.regulator;

  return (
    <div
      style={{
        backgroundColor: "#141416",
        border: "1px solid #27272A",
        borderRadius: 0,
      }}
    >
      {/* Header bar */}
      <div
        style={{
          padding: "14px 20px",
          borderBottom: "1px solid #27272A",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "10px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#52525B",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          Policy — Public
        </span>
        <span
          style={{
            fontSize: "10px",
            fontFamily: "JetBrains Mono, monospace",
            color: "#8C7D64",
            padding: "2px 8px",
            border: "1px solid #8C7D6430",
          }}
        >
          {version}
        </span>
      </div>

      {/* Code-like policy block */}
      <div
        style={{
          padding: "20px",
          fontFamily: "JetBrains Mono, monospace",
          fontSize: "12px",
          lineHeight: 2,
          color: "#A1A1AA",
          backgroundColor: "#0A0A0B",
          borderBottom: "1px solid #27272A",
        }}
      >
        <div>
          <span style={{ color: "#52525B" }}>fund</span>
          {"  "}
          <span style={{ color: "#D4AF37" }}>{name}</span>
        </div>
        <div>
          <span style={{ color: "#52525B" }}>policy</span>
          {"         "}
          <span style={{ color: "#EDEDED" }}>{version}</span>
        </div>
        <div>
          <span style={{ color: "#52525B" }}>state</span>
          {"          "}
          <span style={{ color: state === "Open" ? "#6EE7B7" : "#A1A1AA" }}>{state}</span>
        </div>
        <div style={{ borderTop: "1px solid #27272A", marginTop: "8px", paddingTop: "8px" }}>
          <span style={{ color: "#52525B" }}>max_investor_sub</span>
          {"  "}
          <span style={{ color: "#EDEDED" }}>{maxInv}</span>
          <span style={{ color: "#52525B" }}> {unit}</span>
        </div>
        <div>
          <span style={{ color: "#52525B" }}>max_fund_exposure</span>
          <span style={{ color: "#52525B" }}> </span>
          <span style={{ color: "#EDEDED" }}>{maxFund}</span>
          <span style={{ color: "#52525B" }}> {unit}</span>
        </div>
        <div style={{ borderTop: "1px solid #27272A", marginTop: "8px", paddingTop: "8px" }}>
          <span style={{ color: "#52525B" }}>rule[0]</span>
          {"         "}
          <span style={{ color: "#A1A1AA" }}>encrypted_amount ≤ max_investor_sub</span>
        </div>
        <div>
          <span style={{ color: "#52525B" }}>rule[1]</span>
          {"         "}
          <span style={{ color: "#A1A1AA" }}>accepted_exposure + amount ≤ max_fund_exposure</span>
        </div>
        <div style={{ borderTop: "1px solid #27272A", marginTop: "8px", paddingTop: "8px" }}>
          <span style={{ color: "#52525B" }}>// public policy / private facts</span>
        </div>
        <div>
          <span style={{ color: "#52525B" }}>// investor amounts: </span>
          <span style={{ color: "#8C7D64" }}>ENCRYPTED</span>
        </div>
        <div>
          <span style={{ color: "#52525B" }}>// approval results: </span>
          <span style={{ color: "#8C7D64" }}>ENCRYPTED</span>
        </div>
        <div>
          <span style={{ color: "#52525B" }}>// aggregate report: </span>
          <span style={{ color: "#8C7D64" }}>REGULATOR ONLY</span>
        </div>
      </div>

      {/* Metadata footer */}
      <div style={{ padding: "12px 20px", display: "flex", flexDirection: "column", gap: "4px" }}>
        {issuer && (
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ fontSize: "10px", color: "#52525B", fontFamily: "JetBrains Mono, monospace", width: "60px" }}>issuer</span>
            <span style={{ fontSize: "10px", color: "#A1A1AA", fontFamily: "JetBrains Mono, monospace" }}>{issuer}</span>
          </div>
        )}
        {regulator && (
          <div style={{ display: "flex", gap: "8px" }}>
            <span style={{ fontSize: "10px", color: "#52525B", fontFamily: "JetBrains Mono, monospace", width: "60px" }}>regulator</span>
            <span style={{ fontSize: "10px", color: "#A1A1AA", fontFamily: "JetBrains Mono, monospace" }}>{regulator}</span>
          </div>
        )}
      </div>
    </div>
  );
}
