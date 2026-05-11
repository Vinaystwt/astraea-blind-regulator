# Astraea Confidential Finance Patterns

## Overview

Astraea Confidential Finance Patterns is a reusable Zama FHEVM skill for building confidential finance applications that prove policy evaluation occurred without exposing private user facts. It is derived from the deployed Astraea Sepolia reference implementation, where investor subscription amounts and outcomes stay encrypted while the chain emits neutral public compliance receipts.

Use this skill when an agent or developer needs to design a policy engine with:

- private encrypted input values,
- encrypted policy evaluation,
- public receipts that do not reveal outcomes,
- wallet-authorized user result decryption,
- regulator or auditor aggregate decryption,
- tests that treat privacy as a first-class feature.

This is a testnet engineering pattern, not legal advice and not a licensed compliance product.

## When To Use This Skill

Use this skill for confidential subscriptions, private credit eligibility, sealed voting, private claim eligibility, capped allocation workflows, private risk checks, and aggregate auditor reporting.

Do not use it for KYC, legal compliance claims, token custody, ERC20 settlement, marketplace logic, oracle-dependent rules, or anything that requires plaintext user data on a public chain.

## Core Pattern

```text
Encrypted Input
-> FHE Comparison
-> FHE.select / encrypted branching
-> Conditional Encrypted State Update
-> ACL-Gated Decryption
-> Public Receipt Without Leaks
```

The public contract state may describe the policy, lifecycle, and receipts. It must not reveal private values, approval/rejection, reason codes, or aggregate reports.

## Contract Pattern

Accept encrypted input using the current FHEVM external input and proof pattern:

```solidity
function submit(externalEuint64 encryptedAmount, bytes calldata inputProof) external {
    euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
}
```

Evaluate policy with encrypted operations:

```solidity
ebool underInvestorMax = FHE.le(amount, maxInvestorSubscription);
euint64 postExposure = FHE.add(acceptedExposure, amount);
ebool underFundMax = FHE.le(postExposure, maxFundExposure);
ebool approved = FHE.and(underInvestorMax, underFundMax);
```

Branch privately with `FHE.select`; never decrypt inside the contract to decide a branch:

```solidity
acceptedExposure = FHE.select(approved, postExposure, acceptedExposure);
acceptedCount = FHE.select(approved, FHE.add(acceptedCount, FHE.asEuint64(1)), acceptedCount);
rejectedCount = FHE.select(approved, rejectedCount, FHE.add(rejectedCount, FHE.asEuint64(1)));
```

Reason codes may be encrypted, but public events must not reveal them. A common pattern is:

- `1` approved,
- `2` rejected by per-user cap,
- `3` rejected by aggregate capacity.

## ACL Grants

Every encrypted operation can produce a new ciphertext handle. Re-grant ACL after handle replacement:

- `FHE.allowThis(handle)` for values the contract must compute on later,
- `FHE.allow(handle, investor)` only for that investor's own result,
- `FHE.allow(handle, regulator)` only for aggregate handles,
- never grant individual results to public observers,
- never grant aggregates to random users.

Missing `allowThis` after accumulator updates is a common source of silent follow-on failure.

## Event Privacy Pattern

Safe public events have neutral names and identical shape across approved and rejected paths:

```solidity
event InvestorSubmitted(address indexed investor, uint256 timestamp);
event ComplianceReceiptCreated(address indexed investor, uint256 timestamp);
```

Unsafe event fields include:

- amount,
- approved/rejected boolean,
- reason code,
- branch-specific event names,
- aggregate values,
- strings like `"APPROVED"` or `"REJECTED"`.

Safe public copy:

- "Encrypted subscription received — outcome sealed"
- "Compliance receipt stamped — no investor state disclosed"

Unsafe public copy:

- green/red receipt styling,
- "Investor approved",
- "Rejected because cap exceeded",
- "Amount: 400000".

## Frontend Pattern

Product mode must be stricter than recording/demo mode:

- never show expected outcomes in product mode,
- never show private values in observer views,
- never show demo preset amounts in global navigation,
- require wallet role matching before decrypt,
- label Demo Assist as simulated and keep it opt-in,
- block fake ciphertext from real `submit`,
- use read-only RPC for public event feeds,
- use signer wallets only for transactions and authorized decrypt flows.

Example product guard:

```ts
const demoAssistEnabled =
  import.meta.env.VITE_ENABLE_DEMO_ASSIST === "true" ||
  import.meta.env.VITE_SHOW_INTERNAL_GUIDES === "true";

if (!encryptedPayload.isReal) {
  disableSubmit("Simulated ciphertext cannot be submitted to the contract");
}
```

## Testing Pattern

Test privacy behavior directly:

- approval path with encrypted input,
- rejection by per-user cap,
- rejection by aggregate capacity,
- sequential accumulator updates,
- regulator decrypts aggregate only,
- investor cannot decrypt another investor's result,
- random address cannot decrypt anything private,
- public event schema is identical for approved and rejected paths,
- event args do not contain private amounts, result booleans, or reason codes.

Run local mock FHEVM tests and a Sepolia rehearsal when possible. Mock runtime tests prove contract logic; Sepolia rehearsal proves relayer encryption/decryption and wallet ACL flows.

## Astraea Reference Implementation

Sepolia testnet reference:

- `AstraeaFund`: `0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9`
- deployment block: `10828295`
- fund: `Astraea APAC Growth Note I`
- policy version: `v1`
- max investor subscription: `500000`
- max fund exposure: `700000`
- unit: `USDC simplified units`

Verified testnet results:

- Investor A: input `400000`, approved `true`, reason `1`
- Investor B: input `600000`, approved `false`, reason `2`
- Investor C: input `400000`, approved `false`, reason `3`
- Regulator aggregate: accepted exposure `400000`, accepted count `1`, rejected count `2`

These values are for a public Sepolia demonstration only. No real assets, no real KYC, and no licensed compliance product are involved.

## Anti-Patterns

Fail the design if it:

- emits public amount/result/reason events,
- uses branch-specific event names for private outcomes,
- uses green/red styling in public observer receipts,
- mixes expected demo values into product mode,
- lets fake ciphertext reach a real contract call,
- decrypts inside the contract for branching,
- grants decrypt rights broadly,
- shows aggregate values to non-regulators,
- claims legal compliance or real KYC.

## Agent Evaluation Task

Ask another AI coding agent to build a different confidential policy engine, such as private credit eligibility or confidential voting. The candidate passes only if it:

- uses current FHEVM APIs and encrypted input proofs,
- uses encrypted comparison and `FHE.select`,
- re-grants `allowThis` after handle mutations,
- avoids public result leaks,
- grants ACL minimally,
- tests unauthorized decrypt failures,
- keeps public receipts neutral and no-leak,
- clearly separates product mode from demo assist.

## Limitations

This skill does not replace official Zama documentation. FHEVM package APIs can change, so agents must verify imports, encrypted types, ACL functions, relayer SDK calls, and decryption flow against the installed package and current docs before writing production code.

This skill does not implement KYC, real compliance, token movement, custody, identity, or legal workflows. It is a confidential policy-engine pattern for testnet demonstrations and builder education.
