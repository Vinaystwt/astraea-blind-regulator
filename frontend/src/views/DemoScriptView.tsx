import { useAstraea } from "@/context/AstraeaContext";
import { DEMO_CHECKLIST, DEMO_INVESTORS, FUND_METADATA, PRIVACY_REMINDER } from "@/config/demo";
import type { Role } from "@/types/astraea";

const STEP_ROUTES: Record<number, Role> = {
  1: "home",
  2: "issuer",
  3: "investor-a",
  4: "investor-b",
  5: "investor-c",
  6: "public",
  7: "investor-a",
  8: "regulator",
  9: "regulator",
};

export function DemoScriptView() {
  const { setRole } = useAstraea();

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
          Demo Script
        </h2>
        <p style={{ fontSize: "12px", color: "#52525B", fontFamily: "Inter, sans-serif", margin: 0 }}>
          Recording guide for the 2-minute OpenBuild and 3-minute Builder videos.
        </p>
      </div>

      {/* Privacy reminder — most important */}
      <div
        style={{
          backgroundColor: "#2A1F0E",
          border: "1px solid #D4AF3730",
          padding: "14px 18px",
        }}
      >
        <div
          style={{
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#D4AF37",
            fontFamily: "JetBrains Mono, monospace",
            marginBottom: "6px",
          }}
        >
          ⚠ Privacy Rule — Critical
        </div>
        <p
          style={{
            fontSize: "12px",
            color: "#D4AF37",
            fontFamily: "Inter, sans-serif",
            margin: 0,
          }}
        >
          {PRIVACY_REMINDER}
        </p>
      </div>

      {/* Ordered checklist */}
      <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
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
          Demo Flow
        </div>
        {DEMO_CHECKLIST.map((item) => (
          <div
            key={item.step}
            style={{
              display: "flex",
              gap: "16px",
              padding: "14px 0",
              borderBottom: "1px solid #27272A",
            }}
          >
            <div
              style={{
                fontFamily: "JetBrains Mono, monospace",
                fontSize: "13px",
                color: "#D4AF37",
                minWidth: "24px",
                paddingTop: "1px",
              }}
            >
              {item.step}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  fontSize: "13px",
                  fontFamily: "Inter, sans-serif",
                  color: "#EDEDED",
                  fontWeight: 500,
                  marginBottom: "4px",
                }}
              >
                {item.label}
              </div>
              <div
                style={{
                  fontSize: "11px",
                  fontFamily: "JetBrains Mono, monospace",
                  color: "#8C7D64",
                }}
              >
                {item.cue}
              </div>
            </div>
            {STEP_ROUTES[item.step] && (
              <button
                onClick={() => setRole(STEP_ROUTES[item.step])}
                style={{
                  padding: "4px 12px",
                  backgroundColor: "transparent",
                  border: "1px solid #27272A",
                  color: "#52525B",
                  fontSize: "10px",
                  fontFamily: "JetBrains Mono, monospace",
                  cursor: "pointer",
                  alignSelf: "flex-start",
                  marginTop: "2px",
                  whiteSpace: "nowrap",
                  borderRadius: 0,
                  transition: "all 0.1s",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = "#8C7D64";
                  el.style.color = "#A1A1AA";
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement;
                  el.style.borderColor = "#27272A";
                  el.style.color = "#52525B";
                }}
              >
                → Go
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Expected results table */}
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
          Expected Results (Private — not shown to public)
        </div>

        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "12px",
          }}
        >
          <thead>
            <tr style={{ borderBottom: "1px solid #27272A" }}>
              {["Investor", "Amount", "Expected Outcome", "Reason", "Reason Text"].map((h) => (
                <th
                  key={h}
                  style={{
                    padding: "10px 14px",
                    textAlign: "left",
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "#52525B",
                    fontWeight: 400,
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(["A", "B", "C"] as const).map((key) => {
              const inv = DEMO_INVESTORS[key];
              return (
                <tr key={key} style={{ borderBottom: "1px solid #1C1C1F" }}>
                  <td style={{ padding: "10px 14px", color: "#EDEDED" }}>{inv.label}</td>
                  <td style={{ padding: "10px 14px", color: "#A1A1AA" }}>
                    {inv.amount.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 14px" }}>
                    <span
                      style={{
                        color: inv.expectedOutcome === "APPROVED" ? "#6EE7B7" : "#FDA4AF",
                        backgroundColor: inv.expectedOutcome === "APPROVED" ? "#1A2E22" : "#3B1C1C",
                        padding: "2px 8px",
                        border: `1px solid ${inv.expectedOutcome === "APPROVED" ? "#6EE7B730" : "#FDA4AF30"}`,
                        fontSize: "10px",
                      }}
                    >
                      {inv.expectedOutcome}
                    </span>
                  </td>
                  <td style={{ padding: "10px 14px", color: "#52525B" }}>{inv.expectedReason}</td>
                  <td style={{ padding: "10px 14px", color: "#A1A1AA" }}>{inv.expectedReasonText}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Aggregate */}
      <div
        style={{
          backgroundColor: "#141416",
          border: "1px solid #27272A",
          padding: "16px 20px",
        }}
      >
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
          Regulator Aggregate (after A, B, C)
        </div>
        <div style={{ display: "flex", gap: "40px", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>
          <KV k="accepted_exposure" v="400,000 units" />
          <KV k="accepted_count" v="1" />
          <KV k="rejected_count" v="2" />
        </div>
      </div>

      {/* Fund params */}
      <div
        style={{
          backgroundColor: "#141416",
          border: "1px solid #27272A",
          padding: "16px 20px",
        }}
      >
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
          Fund Parameters
        </div>
        <div style={{ display: "flex", gap: "40px", flexWrap: "wrap", fontFamily: "JetBrains Mono, monospace", fontSize: "12px" }}>
          <KV k="fund" v={FUND_METADATA.name} />
          <KV k="policy" v={FUND_METADATA.policyVersion} />
          <KV k="max_investor_sub" v={FUND_METADATA.maxInvestorSubscription.toLocaleString()} />
          <KV k="max_fund_exposure" v={FUND_METADATA.maxFundExposure.toLocaleString()} />
        </div>
      </div>

      {/* Narration notes */}
      <div
        style={{
          backgroundColor: "#0A0A0B",
          border: "1px solid #27272A",
          padding: "16px 20px",
        }}
      >
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
          Narration Notes
        </div>
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: 0,
            fontFamily: "Inter, sans-serif",
            fontSize: "12px",
            color: "#A1A1AA",
            lineHeight: 1.8,
          }}
        >
          <li>— Open with: "Astraea evaluates subscription rules inside encrypted computation."</li>
          <li>— On public feed: "Three investors submitted. Three identical receipts. Zero outcomes disclosed."</li>
          <li>— On decrypt: "Each investor can decrypt only their own result. No one else can."</li>
          <li>— On regulator: "The regulator sees only aggregates — exposure, accepted, rejected."</li>
          <li>— Close with: "The telescope moved. The ledger was stamped. No one saw through the lens."</li>
        </ul>
      </div>
    </div>
  );
}

function KV({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div style={{ fontSize: "10px", color: "#52525B", marginBottom: "3px" }}>{k}</div>
      <div style={{ fontSize: "13px", color: "#EDEDED" }}>{v}</div>
    </div>
  );
}
