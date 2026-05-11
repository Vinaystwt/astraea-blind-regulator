import { useEffect, useState } from "react";
import type { InvestorKey } from "@/types/astraea";
import { useAstraea } from "@/context/AstraeaContext";
import { DEMO_INVESTORS } from "@/config/demo";
import { getContractAddress, hasContractAddress, isDemoAssistEnabled } from "@/config/contract";
import { encryptAmount, isRealEncryptionAvailable } from "@/lib/encryption";
import { submitSubscription, getMyResultHandles } from "@/lib/astraeaContract";
import { Button } from "@/components/ui/Button";
import { CiphertextBox } from "@/components/ui/CiphertextBox";
import { DemoModeBanner } from "@/components/ui/DemoModeBanner";
import { TxHashLink } from "@/components/ui/TxHashLink";
import { formatAmount } from "@/lib/format";
import { DEFAULT_CHAIN_ID } from "@/config/networks";

interface InvestorSubmissionFormProps {
  investorKey: InvestorKey;
}

export function InvestorSubmissionForm({ investorKey }: InvestorSubmissionFormProps) {
  const { contract, walletAddress, walletStatus, chainId, addTxHash, pushToast, refreshEvents, setInvestorHandles } =
    useAstraea();
  const demo = DEMO_INVESTORS[investorKey];
  const demoAssist = isDemoAssistEnabled();

  const [amount, setAmount] = useState(demo.amount.toString());
  const [ciphertext, setCiphertext] = useState("");
  const [isAnimating, setIsAnimating] = useState(false);
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [txHash, setTxHash] = useState("");
  const [encPayload, setEncPayload] = useState<{ handle: string; inputProof: string } | null>(null);
  const [isRealEncryption, setIsRealEncryption] = useState(false);
  const [demoSimulated, setDemoSimulated] = useState(false);

  const realEncAvailable = isRealEncryptionAvailable();

  // Guards for real contract submission
  const walletConnected = walletStatus === "connected";
  const contractConfigured = hasContractAddress();
  const correctChain = chainId === DEFAULT_CHAIN_ID;
  const walletMatchesInvestor = walletAddress.toLowerCase() === demo.address.toLowerCase();
  const canSubmitReal =
    walletConnected && contractConfigured && correctChain && walletMatchesInvestor && isRealEncryption && !!contract;

  useEffect(() => {
    setAmount(demo.amount.toString());
    setCiphertext("");
    setEncPayload(null);
    setIsRealEncryption(false);
    setDemoSimulated(false);
    setTxHash("");
  }, [demo.amount, investorKey]);

  const handleEncrypt = async () => {
    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      pushToast("error", "Enter a valid positive amount");
      return;
    }

    setIsEncrypting(true);
    setIsAnimating(true);
    setDemoSimulated(false);
    setEncPayload(null);
    setCiphertext("");
    try {
      const contractAddr = getContractAddress();
      const userAddr = walletAddress || demo.address;
      const result = await encryptAmount(contractAddr, userAddr, numAmount);
      setEncPayload(result.payload);
      setCiphertext(result.ciphertextPreview);
      setIsRealEncryption(result.isReal);
      if (!result.isReal) {
        pushToast("warning", "Demo Assist: ciphertext is simulated. Zama relayer not configured.");
      } else {
        pushToast("success", "Amount encrypted with Zama FHE");
      }
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Encryption failed");
    } finally {
      setIsEncrypting(false);
      setTimeout(() => setIsAnimating(false), 1200);
    }
  };

  // Real contract submission — requires real encryption only
  const handleSubmitReal = async () => {
    if (!encPayload || !isRealEncryption) {
      pushToast("error", "Real FHE encryption required before submitting to contract");
      return;
    }
    if (!contract) {
      pushToast("error", "Connect wallet first");
      return;
    }
    if (!correctChain) {
      pushToast("error", `Wrong network. Expected chainId ${DEFAULT_CHAIN_ID}, got ${chainId}`);
      return;
    }
    setIsSubmitting(true);
    try {
      const hash = await submitSubscription(contract, encPayload);
      setTxHash(hash);
      addTxHash(hash);
      pushToast("success", `Submitted: ${hash.slice(0, 10)}...`);
      await refreshEvents();
      const handles = await getMyResultHandles(contract);
      setInvestorHandles(handles);
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Transaction failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo Assist simulate — clearly labeled, never touches contract
  const handleSimulateDemo = () => {
    if (!encPayload) {
      pushToast("error", "Run Encrypt Amount first to generate a simulated payload");
      return;
    }
    setDemoSimulated(true);
    pushToast(
      "info",
      `Demo Assist: simulating submission for ${demo.label}. No contract call made. Expected outcome: ${demo.expectedOutcome}.`
    );
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {!realEncAvailable && (
        <DemoModeBanner message="Zama relayer not configured. Encryption produces a simulated preview only — cannot be submitted to a real contract. Set VITE_ZAMA_RELAYER_URL for real FHE." />
      )}

      {/* Investor context */}
      <div
        style={{
          backgroundColor: "#1C1C1F",
          border: "1px solid #27272A",
          padding: "12px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div>
          <div style={{ fontSize: "12px", color: "#EDEDED", fontFamily: "Inter, sans-serif", fontWeight: 500 }}>
            {demo.label}
          </div>
          <div style={{ fontSize: "11px", color: "#52525B", fontFamily: "JetBrains Mono, monospace", marginTop: "2px" }}>
            Suggested demo input: {formatAmount(demo.amount)}
          </div>
        </div>
        {demoAssist && (
          <div
            style={{
              fontSize: "10px",
              fontFamily: "JetBrains Mono, monospace",
              color: "#8C7D64",
              padding: "2px 8px",
              border: "1px solid #8C7D6430",
            }}
          >
            DEMO ASSIST
          </div>
        )}
      </div>

      {/* Amount input */}
      <div>
        <label
          style={{
            display: "block",
            fontSize: "10px",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            color: "#52525B",
            fontFamily: "JetBrains Mono, monospace",
            marginBottom: "6px",
          }}
        >
          Subscription Amount (USDC simplified units)
        </label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{
            width: "100%",
            backgroundColor: "#0A0A0B",
            border: "1px solid #27272A",
            color: "#EDEDED",
            fontFamily: "JetBrains Mono, monospace",
            fontSize: "14px",
            padding: "10px 14px",
            borderRadius: 0,
            outline: "none",
          }}
          placeholder="400000"
          onFocus={(e) => ((e.target as HTMLInputElement).style.borderColor = "#8C7D64")}
          onBlur={(e) => ((e.target as HTMLInputElement).style.borderColor = "#27272A")}
        />
      </div>

      {/* Encrypt button */}
      <Button variant="secondary" loading={isEncrypting} onClick={handleEncrypt} disabled={isSubmitting}>
        {isEncrypting ? "Encrypting..." : "Encrypt Amount"}
      </Button>

      {/* Ciphertext preview */}
      {ciphertext && (
        <div>
          <CiphertextBox
            value={ciphertext}
            label={isRealEncryption ? "FHE Ciphertext Handle (real)" : "Simulated Ciphertext Preview (Demo Assist — not real FHE)"}
            isAnimating={isAnimating}
          />
          {!isRealEncryption && (
            <p
              style={{
                fontSize: "10px",
                color: "#8C7D64",
                fontFamily: "JetBrains Mono, monospace",
                marginTop: "6px",
                padding: "6px 10px",
                border: "1px solid #8C7D6430",
                backgroundColor: "#8C7D6408",
              }}
            >
              Visual preview only. Not a real Zama FHE ciphertext. Cannot be submitted to contract.
            </p>
          )}
        </div>
      )}

      {/* Submit section */}
      {encPayload && (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {/* Real submit — only enabled when all guards pass */}
          <Button
            variant="gold"
            loading={isSubmitting}
            onClick={handleSubmitReal}
            disabled={!canSubmitReal || isEncrypting}
            title={
              !isRealEncryption
                ? "Disabled: simulated ciphertext cannot be submitted to contract"
                : !walletConnected
                ? "Disabled: connect wallet first"
                : !correctChain
                ? `Disabled: wrong network (need chainId ${DEFAULT_CHAIN_ID})`
                : !walletMatchesInvestor
                ? `Disabled: connected wallet must match ${demo.label}`
                : ""
            }
          >
            {isSubmitting ? "Submitting..." : "Submit to Contract (Real FHE)"}
          </Button>

          {/* Explain why real submit is disabled */}
          {!canSubmitReal && (
            <div
              style={{
                fontSize: "10px",
                fontFamily: "JetBrains Mono, monospace",
                color: "#52525B",
                padding: "6px 10px",
                border: "1px solid #27272A",
                backgroundColor: "#141416",
              }}
            >
              {!isRealEncryption && "Simulated ciphertext cannot reach real contract. "}
              {isRealEncryption && !walletConnected && "Connect wallet to submit. "}
              {isRealEncryption && walletConnected && !correctChain && `Switch to chainId ${DEFAULT_CHAIN_ID}. `}
              {isRealEncryption &&
                walletConnected &&
                correctChain &&
                !walletMatchesInvestor &&
                `Connected wallet does not match ${demo.label}. Import or switch to the ${demo.label} wallet. `}
              {isRealEncryption && walletConnected && correctChain && !contractConfigured && "Set VITE_ASTRAEA_FUND_ADDRESS. "}
            </div>
          )}

          {/* Demo Assist simulate path */}
          {!isRealEncryption && demoAssist && (
            <Button
              variant="secondary"
              onClick={handleSimulateDemo}
              disabled={isSubmitting}
            >
              Demo Assist: Simulate Submission (no contract call)
            </Button>
          )}
        </div>
      )}

      {/* Demo simulated confirmation */}
      {demoSimulated && (
        <div
          className="fade-slide-in"
          style={{
            backgroundColor: "#2A1F0E",
            border: "1px solid #D4AF3730",
            padding: "10px 14px",
          }}
        >
          <div style={{ fontSize: "10px", color: "#8C7D64", fontFamily: "JetBrains Mono, monospace", marginBottom: "4px" }}>
            Demo Assist — Simulated Submission (no contract call)
          </div>
          <div style={{ fontSize: "11px", color: "#D4AF37", fontFamily: "JetBrains Mono, monospace" }}>
            Expected outcome: {demo.expectedOutcome} (reason {demo.expectedReason})
          </div>
          <div style={{ fontSize: "10px", color: "#52525B", fontFamily: "JetBrains Mono, monospace", marginTop: "4px" }}>
            No transaction was sent. Use Decrypt My Result → Demo Assist to see expected private result.
          </div>
        </div>
      )}

      {/* Real tx confirmation */}
      {txHash && (
        <div
          className="fade-slide-in"
          style={{
            backgroundColor: "#1A2E2260",
            border: "1px solid #6EE7B720",
            padding: "10px 14px",
          }}
        >
          <div style={{ fontSize: "10px", color: "#52525B", fontFamily: "JetBrains Mono, monospace", marginBottom: "4px" }}>
            Transaction confirmed — real on-chain submission
          </div>
          <TxHashLink hash={txHash} chainId={DEFAULT_CHAIN_ID} />
        </div>
      )}
    </div>
  );
}
