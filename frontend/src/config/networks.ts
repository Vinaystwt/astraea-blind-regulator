import type { NetworkConfig } from "@/types/astraea";

export const NETWORKS: Record<number, NetworkConfig> = {
  31337: {
    chainId: 31337,
    name: "Local Hardhat",
    explorerTxUrl: "",
    isLocal: true,
  },
  11155111: {
    chainId: 11155111,
    name: "Sepolia",
    explorerTxUrl: "https://sepolia.etherscan.io/tx/",
    explorerAddressUrl: "https://sepolia.etherscan.io/address/",
    isLocal: false,
  },
};

export const DEFAULT_CHAIN_ID = parseInt(import.meta.env.VITE_CHAIN_ID ?? "31337", 10);

export function getNetworkConfig(chainId: number): NetworkConfig {
  return (
    NETWORKS[chainId] ?? {
      chainId,
      name: `Unknown (${chainId})`,
      explorerTxUrl: "",
      isLocal: false,
    }
  );
}

export function formatTxUrl(chainId: number, txHash: string): string {
  const config = getNetworkConfig(chainId);
  if (!config.explorerTxUrl) return "";
  return `${config.explorerTxUrl}${txHash}`;
}

export function formatAddressUrl(chainId: number, address: string): string {
  const config = getNetworkConfig(chainId);
  if (!config.explorerAddressUrl) return "";
  return `${config.explorerAddressUrl}${address}`;
}
