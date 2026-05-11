import { Copy, ExternalLink, Shield, Wifi, WifiOff } from "lucide-react";
import { useState } from "react";
import { useAstraea } from "@/context/AstraeaContext";
import { DEFAULT_CHAIN_ID, formatAddressUrl, getNetworkConfig } from "@/config/networks";
import { getAppModeLabel, getContractAddress } from "@/config/contract";
import { truncateAddress } from "@/lib/format";
import { Button } from "@/components/ui/Button";

const ROLE_TITLES: Record<string, string> = {
  home: "Overview",
  issuer: "Issuer — Fund Management",
  "investor-a": "Investor A — Private Subscription",
  "investor-b": "Investor B — Private Subscription",
  "investor-c": "Investor C — Private Subscription",
  public: "Public Observer — No-Leak Feed",
  regulator: "Regulator — Aggregate Report",
  demo: "Demo Script — Recording Guide",
};

export function Header() {
  const { role, walletStatus, walletAddress, connectWalletAction, switchNetworkAction, disconnectWalletAction, pushToast, isLoading } =
    useAstraea();
  const [walletMenuOpen, setWalletMenuOpen] = useState(false);
  const network = getNetworkConfig(DEFAULT_CHAIN_ID);
  const title = ROLE_TITLES[role] ?? role;
  const contractAddr = getContractAddress();
  const modeLabel = getAppModeLabel();
  const addressUrl = formatAddressUrl(DEFAULT_CHAIN_ID, contractAddr);

  const copyContract = async () => {
    await navigator.clipboard.writeText(contractAddr);
    pushToast("success", "Contract address copied");
  };

  return (
    <header
      className="h-14 flex items-center justify-between px-6 border-b border-border-obsidian flex-shrink-0"
      style={{ borderColor: "#27272A", backgroundColor: "#141416" }}
    >
      {/* Page title */}
      <div className="flex items-center gap-3">
        <h1
          className="text-sm font-medium tracking-wide"
          style={{ color: "#EDEDED", fontFamily: "Inter, sans-serif" }}
        >
          {title}
        </h1>
        <span
          className="text-xs px-2 py-0.5 border"
          style={{
            color: modeLabel === "Demo Assist" ? "#D4AF37" : "#A1A1AA",
            borderColor: modeLabel === "Demo Assist" ? "#D4AF3750" : "#27272A",
            backgroundColor: "#1C1C1F",
            fontFamily: "JetBrains Mono, monospace",
          }}
        >
          {modeLabel}
        </span>
      </div>

      {/* Right cluster */}
      <div className="flex items-center gap-4">
        {/* Network badge */}
        <div className="flex items-center gap-1.5">
          {network.isLocal ? (
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          )}
          <span
            className="text-xs"
            style={{ color: "#A1A1AA", fontFamily: "JetBrains Mono, monospace" }}
          >
            {network.name}
          </span>
        </div>

        {/* Contract address */}
        {contractAddr && (
          <div className="flex items-center gap-1">
            <Shield size={11} style={{ color: "#52525B" }} />
            {addressUrl ? (
              <a
                href={addressUrl}
                target="_blank"
                rel="noopener noreferrer"
                title="View contract on Sepolia Etherscan"
                className="text-xs inline-flex items-center gap-1"
                style={{ color: "#A1A1AA", fontFamily: "JetBrains Mono, monospace", textDecoration: "none" }}
              >
                {truncateAddress(contractAddr, 4)}
                <ExternalLink size={10} />
              </a>
            ) : (
              <span
                className="text-xs"
                title="Local contract address"
                style={{ color: "#A1A1AA", fontFamily: "JetBrains Mono, monospace" }}
              >
                {truncateAddress(contractAddr, 4)}
              </span>
            )}
            <button
              type="button"
              onClick={copyContract}
              title="Copy contract address"
              className="inline-flex items-center border"
              style={{
                borderColor: "#27272A",
                backgroundColor: "transparent",
                color: "#A1A1AA",
                padding: "3px",
                cursor: "pointer",
              }}
            >
              <Copy size={10} />
            </button>
          </div>
        )}

        {/* Wallet */}
        {walletStatus === "connected" ? (
          <div style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setWalletMenuOpen((open) => !open)}
              className="flex items-center gap-1.5 px-2.5 py-1 border"
              style={{ borderColor: "#27272A", backgroundColor: "#1C1C1F", cursor: "pointer" }}
            >
              <Wifi size={11} style={{ color: "#D4AF37" }} />
              <span
                className="text-xs"
                style={{ color: "#EDEDED", fontFamily: "JetBrains Mono, monospace" }}
              >
                {truncateAddress(walletAddress, 4)}
              </span>
            </button>
            {walletMenuOpen && (
              <div
                style={{
                  position: "absolute",
                  right: 0,
                  top: "32px",
                  width: "260px",
                  backgroundColor: "#141416",
                  border: "1px solid #27272A",
                  padding: "10px",
                  zIndex: 60,
                  boxShadow: "0 10px 28px rgba(0,0,0,0.35)",
                }}
              >
                <div style={{ fontSize: "11px", color: "#A1A1AA", fontFamily: "JetBrains Mono, monospace", wordBreak: "break-all", marginBottom: "8px" }}>
                  {walletAddress}
                </div>
                <WalletMenuButton onClick={async () => { await navigator.clipboard.writeText(walletAddress); pushToast("success", "Wallet address copied"); }}>
                  Copy address
                </WalletMenuButton>
                {formatAddressUrl(DEFAULT_CHAIN_ID, walletAddress) && (
                  <a
                    href={formatAddressUrl(DEFAULT_CHAIN_ID, walletAddress)}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ display: "block", padding: "7px 8px", color: "#A1A1AA", fontSize: "12px", textDecoration: "none", fontFamily: "Inter, sans-serif" }}
                  >
                    View address on Sepolia Etherscan
                  </a>
                )}
                <WalletMenuButton onClick={connectWalletAction}>Reconnect / switch account</WalletMenuButton>
                <WalletMenuButton onClick={switchNetworkAction}>Switch to Sepolia</WalletMenuButton>
                <WalletMenuButton onClick={() => { setWalletMenuOpen(false); disconnectWalletAction(); }}>
                  Disconnect from app session
                </WalletMenuButton>
                <div style={{ color: "#8B8B92", fontSize: "11px", lineHeight: 1.5, marginTop: "8px", fontFamily: "Inter, sans-serif" }}>
                  Browser wallets may also require manual disconnect from the extension site settings.
                </div>
              </div>
            )}
          </div>
        ) : walletStatus === "wrong-network" ? (
          <Button variant="secondary" loading={isLoading} onClick={switchNetworkAction}>
            Switch to Sepolia
          </Button>
        ) : (
          <Button variant="secondary" loading={isLoading} onClick={connectWalletAction}>
            <WifiOff size={11} />
            Connect Wallet
          </Button>
        )}
      </div>
    </header>
  );
}

function WalletMenuButton({ children, onClick }: { children: string; onClick: () => void | Promise<void> }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: "100%",
        border: "none",
        borderTop: "1px solid #27272A",
        backgroundColor: "transparent",
        color: "#A1A1AA",
        cursor: "pointer",
        display: "block",
        fontFamily: "Inter, sans-serif",
        fontSize: "12px",
        padding: "7px 8px",
        textAlign: "left",
      }}
    >
      {children}
    </button>
  );
}
