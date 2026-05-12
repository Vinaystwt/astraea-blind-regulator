import { WifiOff, AlertTriangle, Loader } from "lucide-react";
import type { WalletStatus } from "@/types/astraea";
import { Button } from "./Button";
import { useAstraea } from "@/context/AstraeaContext";
import { DEFAULT_CHAIN_ID } from "@/config/networks";
import { getNetworkConfig } from "@/config/networks";

interface WalletStateProps {
  status: WalletStatus;
  onConnect?: () => void;
}

export function WalletState({ status, onConnect }: WalletStateProps) {
  const { connectWalletAction, switchNetworkAction, isLoading } = useAstraea();
  const network = getNetworkConfig(DEFAULT_CHAIN_ID);

  const connect = status === "wrong-network" ? switchNetworkAction : onConnect ?? connectWalletAction;

  if (status === "connected") return null;

  const messages: Record<WalletStatus, { icon: typeof WifiOff; title: string; body: string; action?: string }> = {
    "no-provider": {
      icon: WifiOff,
      title: "No wallet detected",
      body: "Install MetaMask or a compatible EIP-1193 wallet to interact with the contract.",
    },
    "not-connected": {
      icon: WifiOff,
      title: "Wallet not connected",
      body: "Connect your wallet to send transactions and read private state.",
      action: "Connect Wallet",
    },
    "wrong-network": {
      icon: AlertTriangle,
      title: `Wrong network`,
      body: `Switch to ${network.name} (chainId ${network.chainId}).`,
      action: "Switch to Sepolia",
    },
    "contract-missing": {
      icon: AlertTriangle,
      title: "Contract address not configured",
      body: "Set VITE_ASTRAEA_FUND_ADDRESS in frontend/.env and restart the dev server.",
    },
    "relayer-missing": {
      icon: AlertTriangle,
      title: "Zama relayer not configured",
      body: "Set VITE_ZAMA_RELAYER_URL in frontend/.env. Without it, real FHE encryption/decryption is unavailable; Demo Assist appears only when explicitly enabled.",
    },
    connected: {
      icon: WifiOff,
      title: "",
      body: "",
    },
  };

  const msg = messages[status];
  if (!msg) return null;
  const Icon = msg.icon;

  return (
    <div
      style={{
        backgroundColor: "#141416",
        border: "1px solid #27272A",
        padding: "16px 20px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        borderRadius: 0,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <Icon size={14} style={{ color: "#8C7D64" }} />
        <span
          style={{
            fontSize: "13px",
            fontFamily: "Inter, sans-serif",
            color: "#A1A1AA",
            fontWeight: 500,
          }}
        >
          {msg.title}
        </span>
      </div>
      <p style={{ fontSize: "12px", color: "#52525B", fontFamily: "Inter, sans-serif", margin: 0 }}>
        {msg.body}
      </p>
      {msg.action && (
        <div>
          <Button variant="secondary" loading={isLoading} onClick={connect}>
            <Loader size={11} />
            {msg.action}
          </Button>
        </div>
      )}
    </div>
  );
}
