import { BrowserProvider, Contract, type InterfaceAbi, type Eip1193Provider } from "ethers";
import type { WalletStatus } from "@/types/astraea";
import { getContractAddress, loadABI } from "@/config/contract";
import { DEFAULT_CHAIN_ID } from "@/config/networks";

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
  }
}

export interface WalletConnection {
  provider: BrowserProvider;
  address: string;
  chainId: number;
  contract: Contract | null;
}

export function hasProvider(): boolean {
  return typeof window !== "undefined" && typeof window.ethereum !== "undefined";
}

export async function connectWallet(expectedChainId?: number): Promise<WalletConnection> {
  if (!hasProvider() || !window.ethereum) throw new Error("No wallet provider found. Install MetaMask.");

  const provider = new BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  let contract: Contract | null = null;
  if (!expectedChainId || chainId === expectedChainId) {
    const contractAddress = getContractAddress();
    const abi = await loadABI();
    contract = new Contract(contractAddress, abi as InterfaceAbi, signer);
  }

  return { provider, address, chainId, contract };
}

export async function getConnectedWallet(expectedChainId?: number): Promise<WalletConnection | null> {
  if (!hasProvider() || !window.ethereum) return null;

  const provider = new BrowserProvider(window.ethereum);
  const accounts = await provider.send("eth_accounts", []);
  if (!accounts || accounts.length === 0) return null;

  const signer = await provider.getSigner();
  const address = await signer.getAddress();
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  let contract: Contract | null = null;
  if (!expectedChainId || chainId === expectedChainId) {
    const contractAddress = getContractAddress();
    const abi = await loadABI();
    contract = new Contract(contractAddress, abi as InterfaceAbi, signer);
  }

  return { provider, address, chainId, contract };
}

export interface PassiveWalletState {
  status: WalletStatus;
  address: string;
  chainId: number;
}

export async function getPassiveWalletState(expectedChainId?: number): Promise<PassiveWalletState> {
  if (!hasProvider() || !window.ethereum) {
    return { status: "no-provider", address: "", chainId: expectedChainId ?? DEFAULT_CHAIN_ID };
  }

  try {
    const provider = new BrowserProvider(window.ethereum);
    const accounts = await provider.send("eth_accounts", []);
    const network = await provider.getNetwork();
    const chainId = Number(network.chainId);
    if (!accounts || accounts.length === 0) {
      return { status: "not-connected", address: "", chainId };
    }

    if (expectedChainId && chainId !== expectedChainId) {
      return { status: "wrong-network", address: String(accounts[0]), chainId };
    }

    const addr = getContractAddress();
    if (!addr) return { status: "contract-missing", address: String(accounts[0]), chainId };

    return { status: "connected", address: String(accounts[0]), chainId };
  } catch {
    return { status: "not-connected", address: "", chainId: expectedChainId ?? DEFAULT_CHAIN_ID };
  }
}

export async function getWalletStatus(expectedChainId?: number): Promise<WalletStatus> {
  const state = await getPassiveWalletState(expectedChainId);
  return state.status;
}

export async function switchToExpectedNetwork(): Promise<void> {
  if (!hasProvider() || !window.ethereum) throw new Error("No wallet provider found. Install MetaMask.");
  const chainIdHex = `0x${DEFAULT_CHAIN_ID.toString(16)}`;
  await window.ethereum.request?.({
    method: "wallet_switchEthereumChain",
    params: [{ chainId: chainIdHex }],
  });
}
