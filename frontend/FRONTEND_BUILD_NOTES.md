# Frontend Build Notes

## Build Date

2026-05-09

## Architecture

### Contract Mode

When a wallet is connected and `VITE_ASTRAEA_FUND_ADDRESS` is set:

- `connectWallet()` instantiates an ethers `BrowserProvider` + `Contract` backed by the connected signer.
- `getPublicFundSummary()` reads fund name, policy version, limits, state, and investor count from the contract.
- `fetchPublicEvents()` queries `FundCreated`, `FundOpened`, `InvestorSubmitted`, `ComplianceReceiptCreated`, and `FundClosed` events.
- `openFund()` and `closeFund()` send issuer transactions.
- `submitSubscription()` sends the investor's encrypted payload.
- `getMyResultHandles()` returns `(ebool approvedHandle, euint8 reasonCodeHandle)` for the connected investor.
- `getAggregateReportHandles()` returns the three `euint64` handles for the regulator.

### Demo Assist

- `encryptAmount()` falls back to a deterministic hex string generated from `contractAddress + userAddress + amount`. This is labeled clearly as a simulated preview.
- `decryptMyResult()` falls back to the expected demo values from `config/demo.ts`.
- `decryptAggregateReport()` falls back to the expected demo aggregate.
- All Demo Assist values are labeled in the UI with `DemoModeBanner`.
- Simulated ciphertext is blocked from `submit()` and cannot reach the real contract.
- Demo Assist UI is hidden in product mode unless `VITE_ENABLE_DEMO_ASSIST=true` or `VITE_SHOW_INTERNAL_GUIDES=true`.

### Public Read Path

- Public Observer and Issuer summary use a read-only `JsonRpcProvider` from `VITE_SEPOLIA_RPC_URL`.
- Wallet connection is not required for Sepolia public receipts or public fund summary.
- Event queries start from Sepolia deployment block `10828295` for the current contract.

### Relayer/Decryption Pending Mode

If `VITE_ZAMA_RELAYER_URL` is set but the SDK call fails:

- The UI shows the encrypted handles.
- A `WalletState` or `DemoModeBanner` explains the requirement.
- No fake production decrypt is claimed.

## SDK Integration Status

| Function | Status |
|----------|--------|
| `encryptSubscriptionAmount` (sdk/src/encryption.ts) | Adapter in `lib/encryption.ts` — calls `@zama-fhe/relayer-sdk` dynamically if relayer URL is set |
| `decryptMyResult` (sdk/src/decryption.ts) | Adapter in `lib/decryption.ts` — calls relayer SDK if available, falls back to demo |
| `decryptAggregateReport` (sdk/src/decryption.ts) | Same pattern |
| `connectAstraea` (sdk/src/astraeaClient.ts) | Replicated in `lib/wallet.ts` using ethers v6 |
| `getPublicFundSummary` (sdk/src/astraeaClient.ts) | Replicated in `lib/astraeaContract.ts` |
| `submitSubscription` (sdk/src/astraeaClient.ts) | Replicated in `lib/astraeaContract.ts` |
| `getMyResultHandles` (sdk/src/astraeaClient.ts) | Replicated in `lib/astraeaContract.ts` |
| `getAggregateReportHandles` (sdk/src/astraeaClient.ts) | Replicated in `lib/astraeaContract.ts` |

The SDK is not bundled as a direct dependency because `@zama-fhe/relayer-sdk` requires a configured relayer endpoint that is not available in a bare development environment. The frontend imports it dynamically and handles failure gracefully.

## ABI Loading

ABI is loaded from `frontend/public/ABI.json` at runtime via a dynamic import in `config/contract.ts`.

The file was copied from `frontend-handoff/ABI.json` during the build phase:

```bash
cp frontend-handoff/ABI.json frontend/public/ABI.json
```

If the ABI is updated, repeat this copy step.

## Encryption — Honest Assessment

Real FHE encryption requires:

1. A running Zama relayer at `VITE_ZAMA_RELAYER_URL`.
2. `@zama-fhe/relayer-sdk` loaded and instantiated with the relayer URL.
3. The relayer to create an `EncryptedInput` for `(contractAddress, userAddress)`.

Without the relayer, the "ciphertext preview" shown in the UI is a visually plausible but deterministically generated hex string. It is **not** a real FHE ciphertext and cannot be submitted to the contract. This limitation is communicated to the user in the UI.

## Decryption — Honest Assessment

Real user decryption (for investor results) requires the Zama browser decryption environment. The handles returned by `getMyResultHandles()` are FHE ciphertext handles that can only be decrypted by the authorized wallet through the Zama gateway.

Without the relayer/browser decryption environment, product mode does not show expected values. Demo Assist expected values appear only when explicitly enabled.

## Privacy Compliance

The Public Observer view was designed to enforce absolute privacy:

- No green/red styling for submission events.
- No amount field in any public-facing component.
- No approval/rejection/reason in any public-facing component.
- No aggregate exposure/count in any public-facing component.
- `PublicReceiptCard` and `ReceiptTimeline` use identical neutral styling for all `InvestorSubmitted` and `ComplianceReceiptCreated` events.

## What Works in Local Demo (No Wallet)

- All six views render.
- Role switching via sidebar and home page works.
- Demo Assist Mode shows expected outcomes only when explicitly enabled.
- Ciphertext scramble animation on encrypt.
- Decryption wipe reveal animation.
- Regulator aggregate display.
- JSON certificate export (uses demo values if real report not available).
- Internal demo checklist and Demo Script route are hidden by default.
- Set `VITE_SHOW_INTERNAL_GUIDES=true` to expose internal recording tools.

## What Requires Wallet Connection

- Sending `openFund()`, `closeFund()`, `submit()` transactions.
- Fetching real encrypted handles.
- Investor decryption requires the connected wallet to match the selected Investor A/B/C address.
- Regulator aggregate decryption requires the configured regulator wallet.

## What Requires Zama Relayer

- Real FHE encryption of investor amounts before submission.
- Real decryption of investor results and regulator aggregate.

## What Requires Sepolia Deployment

- All contract interactions on a live testnet.
- Contract address set in `VITE_ASTRAEA_FUND_ADDRESS`.
- `VITE_CHAIN_ID=11155111`.

## Sepolia Engineering Closure

Verified deployment:

- `VITE_CHAIN_ID=11155111`
- `VITE_ASTRAEA_FUND_ADDRESS=0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9`
- `VITE_ZAMA_RELAYER_URL=https://relayer.testnet.zama.org`

Real encrypted submissions were verified on Sepolia:

- Investor A submitted `400000` and decrypted approved/reason `1`.
- Investor B submitted `600000` and decrypted rejected/reason `2`.
- Investor C submitted `400000` and decrypted rejected/reason `3`.
- Regulator decrypted aggregate `400000 / 1 / 2`.

Demo Assist remains separate from Contract Mode. Simulated ciphertext must never be submitted as a real contract input.

Final product-mode defaults:

```bash
VITE_SHOW_INTERNAL_GUIDES=false
VITE_ENABLE_DEMO_ASSIST=false
VITE_ENABLE_ISSUER_CONTROLS=false
```

## Known Limitations

1. `@zama-fhe/relayer-sdk` is a dynamic import not bundled in devDependencies. Install it separately when relayer is available.
2. Browser relayer/decryption support depends on the installed Zama SDK and wallet environment.
3. No wallet auto-reconnect across page refreshes (intentional simplicity).
4. The `noUnusedLocals` TypeScript rule may flag imports from views that are conditionally rendered. These are handled by suppressing unused warnings where appropriate.
