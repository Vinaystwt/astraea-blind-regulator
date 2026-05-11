import type { Role } from "@/types/astraea";
import { useAstraea } from "@/context/AstraeaContext";
import { getAppModeLabel, getContractAddress, showInternalGuides } from "@/config/contract";
import { getNetworkConfig } from "@/config/networks";
import { truncateAddress } from "@/lib/format";

const FEATURES = [
  { num: "01", label: "Encrypted Subscriptions" },
  { num: "02", label: "Public No-Leak Receipts" },
  { num: "03", label: "Selective Regulator Disclosure" },
];

const ROLE_ROUTES: { role: Role; label: string; description: string; group: string }[] = [
  { role: "issuer", label: "Issuer", description: "Manage fund & view policy", group: "Fund" },
  { role: "investor-a", label: "Investor A", description: "Private subscription flow", group: "Investors" },
  { role: "investor-b", label: "Investor B", description: "Private subscription flow", group: "Investors" },
  { role: "investor-c", label: "Investor C", description: "Private subscription flow", group: "Investors" },
  { role: "public", label: "Public Observer", description: "No-leak receipt feed", group: "Observers" },
  { role: "regulator", label: "Regulator", description: "Decrypt aggregate report", group: "Observers" },
  { role: "demo", label: "Demo Script", description: "Recording guide", group: "Tools" },
];

export function HomeView() {
  const { setRole, chainId, walletStatus } = useAstraea();
  const network = getNetworkConfig(chainId);
  const contractAddr = getContractAddress();
  const modeLabel = getAppModeLabel();
  const roleRoutes = showInternalGuides() ? ROLE_ROUTES : ROLE_ROUTES.filter((item) => item.role !== "demo");

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "48px", minHeight: "calc(100vh - 120px)", alignItems: "start" }}>
      {/* Left — brand + copy */}
      <div style={{ paddingTop: "20px" }}>
        {/* Hero */}
        <div style={{ marginBottom: "40px" }}>
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#52525B",
              fontFamily: "JetBrains Mono, monospace",
              marginBottom: "16px",
            }}
          >
            Zama FHEVM · Confidential RWA Policy Engine
          </div>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: "64px",
              fontWeight: 300,
              color: "#EDEDED",
              lineHeight: 1.05,
              letterSpacing: 0,
              margin: "0 0 8px",
            }}
          >
            Astraea
          </h1>
          <h2
            style={{
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontSize: "28px",
              fontWeight: 300,
              color: "#D4AF37",
              lineHeight: 1.2,
              margin: "0 0 20px",
              letterSpacing: "0.01em",
            }}
          >
            The Blind Regulator
          </h2>
          <p
            style={{
              fontSize: "16px",
              fontFamily: "Cormorant Garamond, Georgia, serif",
              color: "#A1A1AA",
              fontWeight: 300,
              fontStyle: "italic",
              marginBottom: "28px",
            }}
          >
            Audit without surveillance.
          </p>
          <p
            style={{
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
              color: "#A1A1AA",
              lineHeight: 1.7,
              maxWidth: "520px",
            }}
          >
            Astraea lets tokenized fund issuers prove subscription compliance onchain without
            exposing investor amounts or outcomes.
          </p>
        </div>

        {/* Technical subtitle */}
        <div
          style={{
            borderLeft: "2px solid #8C7D64",
            paddingLeft: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontFamily: "JetBrains Mono, monospace",
              color: "#8C7D64",
              lineHeight: 1.6,
            }}
          >
            Private investor facts.
            <br />
            Public compliance receipts.
          </div>
        </div>

        {/* Feature list */}
        <div style={{ marginBottom: "40px" }}>
          {FEATURES.map((f) => (
            <div
              key={f.num}
              style={{
                display: "flex",
                gap: "16px",
                alignItems: "center",
                paddingBottom: "12px",
                borderBottom: "1px solid #27272A",
                marginBottom: "12px",
              }}
            >
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "11px",
                  color: "#D4AF37",
                  minWidth: "28px",
                }}
              >
                [{f.num}]
              </span>
              <span
                style={{
                  fontFamily: "JetBrains Mono, monospace",
                  fontSize: "12px",
                  color: "#A1A1AA",
                }}
              >
                {f.label}
              </span>
            </div>
          ))}
        </div>

        {/* Architecture diagram text */}
        <div
          style={{
            backgroundColor: "#0A0A0B",
            border: "1px solid #27272A",
            padding: "16px 20px",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "11px",
            color: "#52525B",
            lineHeight: 1.9,
          }}
        >
          <div style={{ color: "#A1A1AA", marginBottom: "4px" }}>// FHE evaluation model</div>
          <div>
            encrypted_amount
          </div>
          <div style={{ paddingLeft: "16px", color: "#8C7D64" }}>
            → FHE.le(amount, maxInvestorSubscription)
          </div>
          <div style={{ paddingLeft: "16px", color: "#8C7D64" }}>
            → FHE.le(exposure + amount, maxFundExposure)
          </div>
          <div style={{ paddingLeft: "16px" }}>
            → encrypted_result → private investor view
          </div>
          <div style={{ paddingLeft: "16px" }}>
            → encrypted_aggregate → regulator-only report
          </div>
          <div style={{ paddingLeft: "16px" }}>
            → public no-leak receipt
          </div>
        </div>

        {/* Disclaimer */}
        <p
          style={{
            marginTop: "24px",
            fontSize: "11px",
            color: "#52525B",
            fontFamily: "Inter, sans-serif",
            lineHeight: 1.6,
          }}
        >
            Sepolia testnet demonstration. No real assets, no real KYC, not a licensed compliance product.
            Demonstrates confidential RWA subscription policy evaluation using encrypted policy rules and no token movement.
        </p>
      </div>

      {/* Right — role selector + status */}
      <div style={{ paddingTop: "20px", display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Role selector */}
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
            Select Role
          </div>
          <div style={{ padding: "8px 0" }}>
            {roleRoutes.map((item) => (
              <button
                key={item.role}
                onClick={() => setRole(item.role)}
                style={{
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 18px",
                  backgroundColor: "transparent",
                  border: "none",
                  borderLeft: "2px solid transparent",
                  cursor: "pointer",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  transition: "all 0.1s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.backgroundColor = "#1C1C1F";
                  el.style.borderLeftColor = "#8C7D64";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.backgroundColor = "transparent";
                  el.style.borderLeftColor = "transparent";
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "13px",
                      color: "#EDEDED",
                      fontFamily: "Inter, sans-serif",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </div>
                  <div
                    style={{
                      fontSize: "10px",
                      color: "#52525B",
                      fontFamily: "JetBrains Mono, monospace",
                      marginTop: "2px",
                    }}
                  >
                    {item.description}
                  </div>
                </div>
                <span style={{ fontSize: "16px", color: "#8B8B92" }}>-&gt;</span>
              </button>
            ))}
          </div>
        </div>

        {/* Status module */}
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
            Network Status
          </div>
          <div
            style={{
              padding: "14px 18px",
              display: "flex",
              flexDirection: "column",
              gap: "8px",
            }}
          >
            <StatusRow label="network" value={network.name} />
            <StatusRow label="chainId" value={String(chainId)} />
            <StatusRow
              label="contract"
              value={contractAddr ? truncateAddress(contractAddr, 6) : "not configured"}
            />
            <StatusRow
              label="wallet"
              value={walletStatus === "connected" ? "connected" : walletStatus}
            />
            <StatusRow label="mode" value={modeLabel} highlight={modeLabel === "Demo Assist"} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatusRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div style={{ display: "flex", gap: "12px", justifyContent: "space-between" }}>
      <span style={{ fontSize: "10px", color: "#52525B", fontFamily: "JetBrains Mono, monospace" }}>
        {label}
      </span>
      <span
        style={{
          fontSize: "10px",
          fontFamily: "JetBrains Mono, monospace",
          color: highlight ? "#D4AF37" : "#A1A1AA",
        }}
      >
        {value}
      </span>
    </div>
  );
}
