import type { InvestorKey } from "@/types/astraea";
import { useAstraea } from "@/context/AstraeaContext";
import { WalletState } from "@/components/ui/WalletState";
import { InvestorSubmissionForm } from "@/components/domain/InvestorSubmissionForm";
import { DecryptionPanel } from "@/components/domain/DecryptionPanel";
import { PrivacyModelCard } from "@/components/ui/PrivacyModelCard";
import { DEMO_INVESTORS } from "@/config/demo";

interface InvestorViewProps {
  investorKey: InvestorKey;
}

export function InvestorView({ investorKey }: InvestorViewProps) {
  const { walletStatus } = useAstraea();
  const demo = DEMO_INVESTORS[investorKey];

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
          {demo.label}
        </h2>
        <p style={{ fontSize: "12px", color: "#52525B", fontFamily: "Inter, sans-serif", margin: 0 }}>
          Encrypt your subscription amount and submit it privately. Only you can decrypt your result.
        </p>
      </div>

      {/* Wallet warning */}
      {walletStatus !== "connected" && (
        <WalletState status={walletStatus} />
      )}

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "28px", alignItems: "start" }}>
        {/* Left: submission form */}
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
            Encrypted Subscription
          </div>
          <InvestorSubmissionForm investorKey={investorKey} />
        </div>

        {/* Right: decryption panel */}
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
            Private Result
          </div>
          <DecryptionPanel investorKey={investorKey} />
        </div>
      </div>

      <PrivacyModelCard note="Your amount and outcome are encrypted on-chain. The public feed shows an identical receipt regardless of approval or rejection. Only you hold the decryption rights." />
    </div>
  );
}
