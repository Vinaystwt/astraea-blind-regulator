import type { InterfaceAbi } from "ethers";
import { DEFAULT_CHAIN_ID } from "@/config/networks";
import { SEPOLIA_DEPLOYMENT } from "@/config/deployment";

// ABI loaded from frontend-handoff/ABI.json (copied at build time via config)
// We import it directly from the handoff directory via a relative path alias,
// or fall back to the inline copy placed here during the build phase.
let _abi: InterfaceAbi | null = null;

export async function loadABI(): Promise<InterfaceAbi> {
  if (_abi) return _abi;
  try {
    const mod = await import("../../public/ABI.json");
    _abi = mod.default as InterfaceAbi;
    return _abi;
  } catch {
    // ABI.json not found in public/; the build step should copy it.
    throw new Error("ABI not found. Run: cp frontend-handoff/ABI.json frontend/public/ABI.json");
  }
}

export function getContractAddress(): string {
  const env = import.meta.env.VITE_ASTRAEA_FUND_ADDRESS;
  if (env && env.trim()) return env.trim();
  if (DEFAULT_CHAIN_ID === SEPOLIA_DEPLOYMENT.chainId) return SEPOLIA_DEPLOYMENT.address;
  // Fall back to the known local deploy address
  return "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0";
}

export function hasContractAddress(): boolean {
  const addr = getContractAddress();
  return addr.length > 0 && addr.startsWith("0x");
}

export function getRelayerUrl(): string {
  return import.meta.env.VITE_ZAMA_RELAYER_URL ?? "";
}

export function hasRelayer(): boolean {
  return getRelayerUrl().length > 0;
}

export function isDemoMode(): boolean {
  return isDemoAssistEnabled();
}

export function isDemoAssistEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_DEMO_ASSIST === "true" || showInternalGuides();
}

export function showInternalGuides(): boolean {
  return import.meta.env.VITE_SHOW_INTERNAL_GUIDES === "true";
}

export function issuerControlsEnabled(): boolean {
  return import.meta.env.VITE_ENABLE_ISSUER_CONTROLS === "true" || showInternalGuides();
}

export function getAppModeLabel(): string {
  if (hasContractAddress() && DEFAULT_CHAIN_ID === 11155111) return "Sepolia Contract Mode";
  if (hasContractAddress() && DEFAULT_CHAIN_ID === 31337) return "Local Contract Mode";
  return "Demo Assist";
}
