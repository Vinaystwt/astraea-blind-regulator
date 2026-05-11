# Frontend Handoff

Use `frontend-handoff/ABI.json` and a deployed address file. The first screen should be the dApp experience, not a marketing page.

Current Sepolia deployment:

- `AstraeaFund`: `0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9`
- `chainId`: `11155111`
- `ZAMA_RELAYER_URL`: `https://relayer.testnet.zama.org`

## Required Frontend Capabilities

- Role switcher: issuer, investor, regulator, public observer.
- Issuer: public policy card, open/close controls, receipt list.
- Investor: amount input, encrypt and submit, decrypt own result.
- Regulator: fetch aggregate handles and decrypt report.
- Public observer: no-leak receipt feed and fund metadata.
- Public observer reads should use the configured Sepolia RPC and must not require wallet connection.

## Contract Calls

- `openFund()`
- `closeFund()`
- `submit(externalEuint64 encryptedAmount, bytes inputProof)`
- `getMyResultHandles()`
- `getAggregateReportHandles()`
- `getPublicFundSummary()`
- `getInvestorCount()`
- `getInvestorAt(index)`

## Public Summary Fields

`getPublicFundSummary()` returns:

1. issuer
2. regulator
3. fundName
4. policyVersion
5. maxInvestorSubscription
6. maxFundExposure
7. fundState
8. investorCount
9. unitLabel

Any frontend policy preview must only claim enforcement for rules actually enforced by `AstraeaFund`: encrypted amount at or below `maxInvestorSubscription`, and encrypted accepted exposure plus encrypted amount at or below `maxFundExposure`.

## Demo Data

- Fund: Astraea APAC Growth Note I
- Policy: v1
- Max investor subscription: 500000 USDC simplified units
- Max fund exposure: 700000 USDC simplified units
- Investor A: 400000, private approved, reason 1
- Investor B: 600000, private rejected by per-investor max, reason 2
- Investor C: 400000, private rejected by fund capacity after A is accepted, reason 3

The public observer must not display private amount, approval/rejection, reason code, or aggregate report.

## Sepolia Frontend Env

```bash
VITE_CHAIN_ID=11155111
VITE_ASTRAEA_FUND_ADDRESS=0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9
VITE_SEPOLIA_RPC_URL=
VITE_ZAMA_RELAYER_URL=https://relayer.testnet.zama.org
VITE_SHOW_INTERNAL_GUIDES=false
VITE_ENABLE_DEMO_ASSIST=false
VITE_ENABLE_ISSUER_CONTROLS=false
```

Demo Assist may display labeled expected values only when `VITE_ENABLE_DEMO_ASSIST=true` or `VITE_SHOW_INTERNAL_GUIDES=true`. Contract Mode must use real encrypted input, real transaction submission, and real handle retrieval/decryption. Do not let fake ciphertext reach `submit()`.

The public UI should hide internal recording tools by default. Set `VITE_SHOW_INTERNAL_GUIDES=true` only for rehearsals that need the Demo Script route or floating Recording Guide.

Investor result decryption must require the connected wallet to match the selected Investor A/B/C demo address. Regulator aggregate decryption must require the configured regulator wallet. JSON certificates must include `mode`, `chainId`, `contractAddress`, `txHashes`, and the testnet/no-real-assets disclaimer.

Do not show demo preset amounts, expected outcomes, reason codes, or aggregate values outside the role-authorized investor/regulator product flows. Sidebar and home role selectors must use neutral investor labels.
