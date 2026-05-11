import { useState } from "react";
import { Lock, Unlock } from "lucide-react";
import type { DecryptedInvestorResult, InvestorKey } from "@/types/astraea";
import { REASON_CODE_TEXT } from "@/types/astraea";
import { useAstraea } from "@/context/AstraeaContext";
import { DEMO_INVESTORS } from "@/config/demo";
import { decryptMyResult, isRealDecryptionAvailable } from "@/lib/decryption";
import { getMyResultHandles } from "@/lib/astraeaContract";
import { Button } from "@/components/ui/Button";
import { CiphertextBox } from "@/components/ui/CiphertextBox";
import { DemoModeBanner } from "@/components/ui/DemoModeBanner";
import { isDemoAssistEnabled } from "@/config/contract";

interface DecryptionPanelProps {
  investorKey: InvestorKey;
}

export function DecryptionPanel({ investorKey }: DecryptionPanelProps) {
  const {
    contract,
    walletAddress,
    walletStatus,
    investorHandles,
    investorResult,
    investorResultIsReal,
    setInvestorHandles,
    setInvestorResult,
    pushToast,
  } =
    useAstraea();
  const demo = DEMO_INVESTORS[investorKey];
  const demoAssist = isDemoAssistEnabled();
  const [isRevealing, setIsRevealing] = useState(false);
  const [isFetchingHandles, setIsFetchingHandles] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const realDecryptAvailable = isRealDecryptionAvailable();

  const demoFallback: DecryptedInvestorResult = {
    approved: demo.expectedOutcome === "APPROVED",
    reasonCode: BigInt(demo.expectedReason),
  };
  const walletMatchesInvestor = walletAddress.toLowerCase() === demo.address.toLowerCase();
  const canFetchHandles = walletStatus === "connected" && walletMatchesInvestor && !!contract;
  const canDecryptReal = canFetchHandles && !!investorHandles;

  const handleFetchHandles = async () => {
    if (!canFetchHandles || !contract) {
      pushToast("warning", `Connected wallet does not match ${demo.label}. Import/switch to the ${demo.label} wallet to decrypt this result.`);
      return;
    }
    setIsFetchingHandles(true);
    try {
      const handles = await getMyResultHandles(contract);
      setInvestorHandles(handles);
      pushToast("info", "Investor result handles loaded");
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Failed to fetch result handles");
    } finally {
      setIsFetchingHandles(false);
    }
  };

  const handleDecrypt = async () => {
    if (!investorHandles) {
      pushToast("warning", "No result handles. Submit subscription first.");
      return;
    }
    setIsRevealing(true);
    try {
      const result = await decryptMyResult(investorHandles, walletAddress, demoFallback);
      if (!result.isReal && !demoAssist) {
        pushToast("error", "Real wallet-authorized decrypt is unavailable in this browser session.");
        return;
      }
      setInvestorResult(result.data, result.isReal);
      setRevealed(true);
      if (!result.isReal) {
        pushToast("info", "Demo Assist: showing expected result. Zama relayer required for real decryption.");
      } else {
        pushToast("success", "Decryption successful — result from chain");
      }
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Decryption failed");
    } finally {
      setIsRevealing(false);
    }
  };

  const handleShowExpected = () => {
    setInvestorResult(demoFallback, false);
    setRevealed(true);
    pushToast("info", "Demo Assist: showing expected private result. No wallet-authorized decrypt occurred.");
  };

  const result = investorResult;
  const approved = result?.approved ?? false;
  const reasonCode = result ? Number(result.reasonCode) : null;
  const reasonText = reasonCode !== null ? REASON_CODE_TEXT[reasonCode] : null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {!realDecryptAvailable && demoAssist && (
        <DemoModeBanner message="Zama relayer not configured. Decryption will show Demo Assist expected values only. Real user decryption requires configured Zama relayer/browser environment." />
      )}

      {walletStatus === "connected" && !walletMatchesInvestor && (
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
          Connected wallet does not match {demo.label}. Import/switch to the {demo.label} wallet to decrypt this result.
        </div>
      )}

      {/* Handles */}
      {investorHandles ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <CiphertextBox value={investorHandles.approvedHandle} label="Approved Handle (ebool)" />
          <CiphertextBox value={investorHandles.reasonCodeHandle} label="Reason Code Handle (euint8)" />
        </div>
      ) : (
        <div
          style={{
            backgroundColor: "#1C1C1F",
            border: "1px solid #27272A",
            padding: "16px",
            textAlign: "center",
          }}
        >
          <Lock size={18} style={{ color: "#52525B", margin: "0 auto 8px" }} />
          <div style={{ fontSize: "12px", color: "#52525B", fontFamily: "Inter, sans-serif" }}>
            No result handles yet. Submit subscription first.
          </div>
        </div>
      )}

      {/* Decrypt button */}
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        <Button
          variant="secondary"
          loading={isFetchingHandles}
          onClick={handleFetchHandles}
          disabled={!canFetchHandles || isFetchingHandles}
        >
          Fetch My Handles
        </Button>
        <Button
          variant="gold"
          loading={isRevealing}
          onClick={handleDecrypt}
          disabled={!canDecryptReal || isRevealing}
        >
          <Unlock size={12} />
          {isRevealing ? "Decrypting..." : "Decrypt My Result"}
        </Button>
        {demoAssist && (
          <Button variant="secondary" onClick={handleShowExpected}>
            Demo Assist: Show Expected Result
          </Button>
        )}
      </div>

      {/* Result reveal */}
      {(result || (revealed && !result)) && (
        <div
          className="wipe-reveal"
          style={{
            backgroundColor: approved ? "#1A2E22" : "#3B1C1C",
            border: `1px solid ${approved ? "#6EE7B730" : "#FDA4AF30"}`,
            padding: "20px",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Gold wipe overlay (CSS animation handles it via wipe-reveal class) */}
          <div
            style={{
              fontSize: "11px",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "#52525B",
              fontFamily: "JetBrains Mono, monospace",
              marginBottom: "10px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Lock size={10} />
              {investorResultIsReal ? "Wallet-authorized decrypt" : demoAssist ? "Demo Assist Expected Result" : "Simulated Result"} — Investor {investorKey} Only
          </div>

          <div
            style={{
              fontSize: "28px",
              fontFamily: "Cormorant Garamond, Georgia, serif",
              fontWeight: 400,
              color: approved ? "#6EE7B7" : "#FDA4AF",
              marginBottom: "8px",
            }}
          >
            {approved ? "APPROVED" : "REJECTED"}
          </div>

          {reasonText && (
            <div style={{ fontSize: "12px", color: "#A1A1AA", fontFamily: "Inter, sans-serif" }}>
              {reasonText}
            </div>
          )}

          {reasonCode !== null && (
            <div
              style={{
                fontSize: "10px",
                color: "#52525B",
                fontFamily: "JetBrains Mono, monospace",
                marginTop: "6px",
              }}
            >
              reason_code: {reasonCode}
            </div>
          )}

          {!investorResultIsReal && demoAssist && (
            <div
              style={{
                marginTop: "12px",
                paddingTop: "10px",
                borderTop: "1px solid #ffffff10",
                fontSize: "10px",
                color: "#8C7D64",
                fontFamily: "JetBrains Mono, monospace",
              }}
            >
              Demo Assist expected value. Real user decryption requires configured Zama relayer.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
