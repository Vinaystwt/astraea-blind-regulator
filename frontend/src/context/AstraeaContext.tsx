import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { Contract } from "ethers";
import type {
  AggregateReportHandles,
  AstraeaPublicSummary,
  DecryptedAggregateReport,
  DecryptedInvestorResult,
  InvestorKey,
  InvestorResultHandles,
  PublicReceiptEvent,
  Role,
  ToastMessage,
  WalletStatus,
} from "@/types/astraea";
import { DEFAULT_CHAIN_ID } from "@/config/networks";
import { isDemoMode } from "@/config/contract";
import {
  connectWallet,
  getConnectedWallet,
  getPassiveWalletState,
  hasProvider,
  switchToExpectedNetwork,
} from "@/lib/wallet";
import {
  getPublicFundSummary,
  getReadOnlyContract,
} from "@/lib/astraeaContract";
import { fetchPublicEvents } from "@/lib/events";
import { DEMO_INVESTORS } from "@/config/demo";

interface AstraeaState {
  role: Role;
  walletStatus: WalletStatus;
  walletAddress: string;
  chainId: number;
  contract: Contract | null;
  publicSummary: AstraeaPublicSummary | null;
  publicEvents: PublicReceiptEvent[];
  selectedInvestor: InvestorKey;
  investorHandles: InvestorResultHandles | null;
  investorResult: DecryptedInvestorResult | null;
  investorResultIsReal: boolean;
  aggregateHandles: AggregateReportHandles | null;
  aggregateReport: DecryptedAggregateReport | null;
  aggregateIsReal: boolean;
  demoMode: boolean;
  toasts: ToastMessage[];
  txHashes: string[];
  isLoading: boolean;
  demoChecklistOpen: boolean;
}

interface AstraeaActions {
  setRole: (role: Role) => void;
  connectWalletAction: () => Promise<void>;
  switchNetworkAction: () => Promise<void>;
  disconnectWalletAction: () => void;
  refreshPublicSummary: () => Promise<void>;
  refreshEvents: () => Promise<void>;
  setSelectedInvestor: (key: InvestorKey) => void;
  setInvestorHandles: (h: InvestorResultHandles) => void;
  setInvestorResult: (r: DecryptedInvestorResult, isReal: boolean) => void;
  setAggregateHandles: (h: AggregateReportHandles) => void;
  setAggregateReport: (r: DecryptedAggregateReport, isReal: boolean) => void;
  addTxHash: (hash: string) => void;
  pushToast: (type: ToastMessage["type"], message: string) => void;
  dismissToast: (id: string) => void;
  setDemoChecklistOpen: (open: boolean) => void;
}

type AstraeaContextType = AstraeaState & AstraeaActions;

const AstraeaContext = createContext<AstraeaContextType | null>(null);

export function AstraeaProvider({ children }: { children: React.ReactNode }) {
  const [role, setRole] = useState<Role>("home");
  const [walletStatus, setWalletStatus] = useState<WalletStatus>("no-provider");
  const [walletAddress, setWalletAddress] = useState("");
  const [chainId, setChainId] = useState(DEFAULT_CHAIN_ID);
  const [contract, setContract] = useState<Contract | null>(null);
  const [publicSummary, setPublicSummary] = useState<AstraeaPublicSummary | null>(null);
  const [publicEvents, setPublicEvents] = useState<PublicReceiptEvent[]>([]);
  const [selectedInvestor, setSelectedInvestor] = useState<InvestorKey>("A");
  const [investorHandles, setInvestorHandles] = useState<InvestorResultHandles | null>(null);
  const [investorResult, setInvestorResultState] = useState<DecryptedInvestorResult | null>(null);
  const [investorResultIsReal, setInvestorResultIsReal] = useState(false);
  const [aggregateHandles, setAggregateHandles] = useState<AggregateReportHandles | null>(null);
  const [aggregateReport, setAggregateReportState] = useState<DecryptedAggregateReport | null>(null);
  const [aggregateIsReal, setAggregateIsReal] = useState(false);
  const [demoMode] = useState(isDemoMode());
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [txHashes, setTxHashes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [demoChecklistOpen, setDemoChecklistOpen] = useState(false);
  const contractRef = useRef<Contract | null>(null);
  const readOnlyContractRef = useRef<Contract | null>(null);

  const pushToast = useCallback((type: ToastMessage["type"], message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const connectWalletAction = useCallback(async () => {
    setIsLoading(true);
    try {
      const conn = await connectWallet(DEFAULT_CHAIN_ID);
      setWalletAddress(conn.address);
      setChainId(conn.chainId);
      setContract(conn.contract);
      contractRef.current = conn.contract;
      if (conn.chainId === DEFAULT_CHAIN_ID && conn.contract) {
        setWalletStatus("connected");
        pushToast("success", `Wallet connected: ${conn.address.slice(0, 8)}...`);
      } else {
        setWalletStatus("wrong-network");
        pushToast("warning", `Wallet connected on chainId ${conn.chainId}. Switch to ${DEFAULT_CHAIN_ID}.`);
      }
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Wallet connection failed");
    } finally {
      setIsLoading(false);
    }
  }, [pushToast]);

  const switchNetworkAction = useCallback(async () => {
    setIsLoading(true);
    try {
      await switchToExpectedNetwork();
      const state = await getPassiveWalletState(DEFAULT_CHAIN_ID);
      setWalletStatus(state.status);
      setWalletAddress(state.address);
      setChainId(state.chainId);
      if (state.status === "connected") {
        const conn = await getConnectedWallet(DEFAULT_CHAIN_ID);
        if (!conn) return;
        setContract(conn.contract);
        contractRef.current = conn.contract;
      }
      pushToast("success", `Switched to chainId ${DEFAULT_CHAIN_ID}`);
    } catch (err) {
      pushToast("error", err instanceof Error ? err.message : "Network switch failed");
    } finally {
      setIsLoading(false);
    }
  }, [pushToast]);

  const disconnectWalletAction = useCallback(() => {
    setWalletStatus(hasProvider() ? "not-connected" : "no-provider");
    setWalletAddress("");
    setContract(null);
    contractRef.current = null;
    setInvestorHandles(null);
    setInvestorResultState(null);
    setAggregateHandles(null);
    setAggregateReportState(null);
    pushToast("info", "Disconnected from this app session. To fully disconnect, remove site access in your wallet extension.");
  }, [pushToast]);

  const getReadContract = useCallback(async () => {
    if (contractRef.current) return contractRef.current;
    if (readOnlyContractRef.current) return readOnlyContractRef.current;
    readOnlyContractRef.current = await getReadOnlyContract();
    return readOnlyContractRef.current;
  }, []);

  const refreshPublicSummary = useCallback(async () => {
    const c = await getReadContract();
    if (!c) return;
    try {
      const summary = await getPublicFundSummary(c);
      setPublicSummary(summary);
    } catch (err) {
      pushToast("error", "Failed to load fund summary");
      console.error(err);
    }
  }, [getReadContract, pushToast]);

  const refreshEvents = useCallback(async () => {
    const c = await getReadContract();
    if (!c) return;
    try {
      const events = await fetchPublicEvents(c);
      setPublicEvents(events);
    } catch (err) {
      pushToast("error", "Failed to load on-chain events");
      console.error(err);
    }
  }, [getReadContract, pushToast]);

  const setInvestorResult = useCallback((r: DecryptedInvestorResult, isReal: boolean) => {
    setInvestorResultState(r);
    setInvestorResultIsReal(isReal);
  }, []);

  const setAggregateReport = useCallback((r: DecryptedAggregateReport, isReal: boolean) => {
    setAggregateReportState(r);
    setAggregateIsReal(isReal);
  }, []);

  const addTxHash = useCallback((hash: string) => {
    setTxHashes((prev) => (prev.includes(hash) ? prev : [...prev, hash]));
  }, []);

  // Initialize read-only contract and passive wallet status on mount
  useEffect(() => {
    getReadOnlyContract()
      .then((c) => {
        readOnlyContractRef.current = c;
        return Promise.all([refreshPublicSummary(), refreshEvents()]);
      })
      .catch(() => {});

    getPassiveWalletState(DEFAULT_CHAIN_ID).then((state) => {
      setWalletStatus(state.status);
      setWalletAddress(state.address);
      setChainId(state.chainId);
      if (state.status === "connected") {
        getConnectedWallet(DEFAULT_CHAIN_ID)
          .then((conn) => {
            setContract(conn?.contract ?? null);
            contractRef.current = conn?.contract ?? null;
          })
          .catch(() => {});
      }
    });
  }, [refreshEvents, refreshPublicSummary]);

  useEffect(() => {
    if (!hasProvider() || !window.ethereum) return undefined;
    const ethereum = window.ethereum as typeof window.ethereum & {
      on?: (event: string, listener: (...args: unknown[]) => void) => void;
      removeListener?: (event: string, listener: (...args: unknown[]) => void) => void;
    };

    const handleAccountsChanged = async () => {
      const state = await getPassiveWalletState(DEFAULT_CHAIN_ID);
      setWalletStatus(state.status);
      setWalletAddress(state.address);
      setChainId(state.chainId);
      setContract(null);
      contractRef.current = null;
      if (state.status === "connected") {
        const conn = await getConnectedWallet(DEFAULT_CHAIN_ID);
        if (!conn) return;
        setContract(conn.contract);
        contractRef.current = conn.contract;
      }
    };

    const handleChainChanged = () => {
      handleAccountsChanged().catch(() => {});
    };

    ethereum.on?.("accountsChanged", handleAccountsChanged);
    ethereum.on?.("chainChanged", handleChainChanged);
    return () => {
      ethereum.removeListener?.("accountsChanged", handleAccountsChanged);
      ethereum.removeListener?.("chainChanged", handleChainChanged);
    };
  }, []);

  // Auto-refresh summary when contract becomes available
  useEffect(() => {
    if (contract) {
      refreshPublicSummary();
      refreshEvents();
    }
  }, [contract, refreshPublicSummary, refreshEvents]);

  // Reset per-investor state on any role change — prevents stale handles/result when switching investor-a ↔ investor-b
  useEffect(() => {
    setInvestorHandles(null);
    setInvestorResultState(null);
    setInvestorResultIsReal(false);
  }, [role]);

  const ctx: AstraeaContextType = {
    role,
    walletStatus,
    walletAddress,
    chainId,
    contract,
    publicSummary,
    publicEvents,
    selectedInvestor,
    investorHandles,
    investorResult,
    investorResultIsReal,
    aggregateHandles,
    aggregateReport,
    aggregateIsReal,
    demoMode,
    toasts,
    txHashes,
    isLoading,
    demoChecklistOpen,
    setRole,
    connectWalletAction,
    switchNetworkAction,
    disconnectWalletAction,
    refreshPublicSummary,
    refreshEvents,
    setSelectedInvestor,
    setInvestorHandles,
    setInvestorResult,
    setAggregateHandles,
    setAggregateReport,
    addTxHash,
    pushToast,
    dismissToast,
    setDemoChecklistOpen,
  };

  // Suppress unused warning — DEMO_INVESTORS used by views, not context
  void DEMO_INVESTORS;

  return <AstraeaContext.Provider value={ctx}>{children}</AstraeaContext.Provider>;
}

export function useAstraea(): AstraeaContextType {
  const ctx = useContext(AstraeaContext);
  if (!ctx) throw new Error("useAstraea must be used within AstraeaProvider");
  return ctx;
}
