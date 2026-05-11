import type { InvestorDemoConfig, InvestorKey } from "@/types/astraea";
import { SEPOLIA_DEPLOYMENT } from "@/config/deployment";

export const FUND_METADATA = {
  name: "Astraea APAC Growth Note I",
  policyVersion: "v1",
  maxInvestorSubscription: 500_000,
  maxFundExposure: 700_000,
  unitLabel: "USDC simplified units",
} as const;

export const DEMO_INVESTORS: Record<InvestorKey, InvestorDemoConfig> = {
  A: {
    key: "A",
    label: "Investor A",
    address: SEPOLIA_DEPLOYMENT.actors.investorA,
    amount: 400_000,
    expectedOutcome: "APPROVED",
    expectedReason: 1,
    expectedReasonText: "Approved — subscription accepted",
  },
  B: {
    key: "B",
    label: "Investor B",
    address: SEPOLIA_DEPLOYMENT.actors.investorB,
    amount: 600_000,
    expectedOutcome: "REJECTED",
    expectedReason: 2,
    expectedReasonText: "Rejected — per-investor subscription cap exceeded",
  },
  C: {
    key: "C",
    label: "Investor C",
    address: SEPOLIA_DEPLOYMENT.actors.investorC,
    amount: 400_000,
    expectedOutcome: "REJECTED",
    expectedReason: 3,
    expectedReasonText: "Rejected — fund capacity fully subscribed",
  },
};

export const DEMO_REGULATOR_AGGREGATE = {
  acceptedExposure: 400_000,
  acceptedCount: 1,
  rejectedCount: 2,
} as const;

export const DEMO_CHECKLIST = [
  { step: 1, label: "Home", cue: 'Explain "Audit without surveillance"' },
  { step: 2, label: "Issuer", cue: "Show public policy — max 500k / 700k" },
  { step: 3, label: "Investor A", cue: "Submit 400,000 — expected APPROVED" },
  { step: 4, label: "Investor B", cue: "Submit 600,000 — expected REJECTED (cap)" },
  { step: 5, label: "Investor C", cue: "Submit 400,000 — expected REJECTED (capacity)" },
  { step: 6, label: "Public Observer", cue: "Show identical neutral receipts — no outcome visible" },
  { step: 7, label: "Investor Decrypt", cue: "Decrypt A, B, C results privately" },
  { step: 8, label: "Regulator Decrypt", cue: "Decrypt aggregate: exposure 400k, accepted 1, rejected 2" },
  { step: 9, label: "Certificate", cue: "Export JSON compliance certificate" },
] as const;

export const PRIVACY_REMINDER =
  "Do NOT show public approved/rejected events. They do not exist. The public feed is aggressively neutral by design.";
