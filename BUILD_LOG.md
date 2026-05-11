# Astraea Build Log

Date: 2026-05-06
Workspace: `/Users/vinaysharma/Astraea`

## Running Notes

- Started from an empty repository root.
- Activated Superpowers workflow by reading `using-superpowers`, `writing-plans`, `test-driven-development`, `executing-plans`, and `verification-before-completion`.
- Current hard stop conditions: missing Sepolia credentials/funded deployer may block live testnet deployment, but local build continues.
- Installed current FHEVM packages with declared peers: `@fhevm/solidity@0.11.1`, `@fhevm/hardhat-plugin@0.4.2`, `@zama-fhe/relayer-sdk@0.4.1`, Hardhat 2.
- Verified current Solidity API uses `FHE`, `externalEuintXX`, `FHE.fromExternal`, `FHE.le`, `FHE.select`, `FHE.allowThis`, and `FHE.allow`.
- `npm run compile` in `contracts/`: passed, 11 Solidity files compiled.
- `npm test` in `contracts/`: passed, 13 tests.
- `npm run typecheck` in `contracts/`: passed.
- `npm run export:frontend` in `contracts/`: passed and wrote `frontend-handoff/ABI.json`.
- `npm run node` plus `npm run seed:local` in `contracts/`: passed against localhost. Seeded demo at `0x5FbDB2315678afecb367f032d93F642f64180aa3`.
- `npm run deploy:local` in `contracts/`: passed against localhost. Deployed demo at `0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0`.
- `npm run typecheck` in `sdk/`: passed.
- Credential check: no `contracts/.env` file present.
- Git status check: not available because the workspace is not initialized as a git repository.

## Current Status

- Contracts, tests, scripts, SDK helpers, frontend handoff docs, project docs, and bounty-skill package are present.
- Sepolia deployment not attempted because no `.env` with Sepolia RPC, issuer wallet, and regulator address is present.

## Final Verification Snapshot

- `contracts`: compile passed, tests passed (`13 passing`), typecheck passed, frontend ABI export passed.
- `sdk`: typecheck passed.
- Local deployment/seed: passed with a running Hardhat localhost node.
- Sepolia: blocked on human-provided RPC URL, funded private key, and regulator address.

## 2026-05-06 Backend Hardening Pass

- Replaced ambiguous `maxSubscription` in `AstraeaFund` with `maxInvestorSubscription` and `maxFundExposure`.
- Updated private policy evaluation to require both encrypted amount within the per-investor maximum and encrypted `acceptedExposure + amount` within the total fund exposure maximum.
- Added encrypted multi-branch reason codes: `1 = approved`, `2 = per-investor max exceeded`, `3 = fund capacity exceeded`.
- Kept conditional aggregate updates encrypted and re-granted contract/regulator ACL after handle replacements.
- Updated tests for A/B/C demo: A approved, B rejected by per-investor cap, C rejected by fund capacity.
- Updated Sepolia scripts to prefer actor-specific keys: issuer plus investors A/B/C. The legacy deployer fallback remains issuer-only.
- Added `open:sepolia`.
- Updated SDK summary types, frontend handoff, docs, README, and exported ABI.
- Verification run:
  - `cd contracts && npm run compile`: passed.
  - `cd contracts && npm test`: passed, `13 passing`.
  - `cd contracts && npm run typecheck`: passed.
  - `cd contracts && npm run export:frontend`: passed.
  - `cd sdk && npm run typecheck`: passed.

## 2026-05-10 Phase 4 Engineering Closure Attempt

- Inspected repo state, contracts scripts, frontend notes, Sepolia runbook, and frontend handoff.
- Added `.gitignore` to exclude `.env`, local wallet/deployment files, build outputs, and dependency folders.
- Validated `contracts/.env` without printing sensitive values.
- Hard stop reached: Sepolia RPC and issuer wallet values are missing from `contracts/.env`.
- Created `contracts/.env.template.generated` with the required Phase 4 env shape and default `ZAMA_RELAYER_URL=https://relayer.testnet.zama.org`.
- Deployment, actor generation/funding, relayer verification, seeding, and decryption verification were not attempted because required Sepolia RPC/deployer inputs are missing.

## 2026-05-10 Phase 4 Engineering Closure

- Validated `contracts/.env` without printing sensitive values.
- Generated missing local actor wallets for Investor A, Investor B, Investor C, and regulator. Private keys are stored only in ignored local env state.
- Actor addresses:
  - Issuer: `0x94c188F8280cA706949CC030F69e42B5544514ac`
  - Investor A: `0xb4D1e1B488636EaF0e074ACF1B6b5C4F6Af223e6`
  - Investor B: `0xB1C45B18639f736Cdc5F22D2C75EB4f0474e3d7B`
  - Investor C: `0xc99033b39a2a4e375452e088C42EeAD320e9Acd6`
  - Regulator: `0xB6767dAA4aF50DA070FE2600E5f9C0d8146227fe`
- Funded actors from issuer:
  - Investor A: `0x2bd142964f6f6b754ffb65a720478c1eda5a0f3e4bbaf5e73a2d0982ff80bd27`
  - Investor B: `0xc374403bcd8ceddabf07e64f262ac4f3bd7eafbbdb5e2235e6f716ca8045d083`
  - Investor C: `0xeef6daf1355f258aa0956c79303ab2e0c1fc81c53369caa4231a45da92cdbac9`
  - Regulator: `0xb0768d7597f59e1af61dc581bdf1f42978a442d47c95ac423390348f78bc8cc7`
- Hardhat FHEVM plugin Sepolia initialization failed against the Alchemy endpoint due `anvil_nodeInfo` unsupported method handling. Sepolia operational scripts now use standalone `ethers` and `@zama-fhe/relayer-sdk`.
- Deployed AstraeaFund to Sepolia:
  - Address: `0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9`
  - Deploy tx: `0xcf2f17f4078c0d3b16a556c9e7b22173a1deef1cf0a9906a161bbbeb94c8a323`
  - Block: `10828295`
- Opened fund:
  - Open tx: `0xad6c39e3a2f1ec1ef0d4eaba8c6aea30687f8371b6f04006918c42446eb9a700`
  - Block: `10828297`
- Real encrypted Sepolia submissions succeeded through `https://relayer.testnet.zama.org`:
  - Investor A: `0xf2ed8d0897adb552e8f7dd4928e87c935ba553b19e318b6530cbcd37536beb26`
  - Investor B: `0x6caad0479f925cab61559a45528d23768ae125be42e3f1ff59fd622fab88ec4d`
  - Investor C: `0x5ea8434ceee4574585a484de8ee0d7f27a30f08d6333ee84f6308a3f900b3b66`
- Decryption verification succeeded:
  - A: approved true, reason 1
  - B: approved false, reason 2
  - C: approved false, reason 3
  - Regulator aggregate: acceptedExposure 400000, acceptedCount 1, rejectedCount 2
- Synced frontend local env and frontend handoff deployment metadata.
- Final verification:
  - `cd contracts && npm run compile`: passed.
  - `cd contracts && npm test`: passed, `13 passing`.
  - `cd contracts && npm run typecheck`: passed.
  - `cd contracts && npm run export:frontend`: passed.
  - `cd sdk && npm run typecheck`: passed.
  - `cd frontend && npm run typecheck`: passed.
  - `cd frontend && npm run build`: passed.
  - `cd contracts && npm run sync:frontend`: passed after ABI export.

## 2026-05-11 Phase 5 Final Engineering Polish

- Product mode now hides internal Demo Script and Recording Guide by default.
- Removed demo preset amounts and expected outcomes from global navigation and public role selectors.
- Demo Assist is opt-in through `VITE_ENABLE_DEMO_ASSIST=true` or `VITE_SHOW_INTERNAL_GUIDES=true`.
- Issuer open/close controls are opt-in through `VITE_ENABLE_ISSUER_CONTROLS=true` or internal guide mode.
- Added connected-wallet menu with copy, Etherscan link, reconnect/switch account, switch network, and app-session disconnect.
- Product-mode investor decrypt requires matching investor wallet and real handle decrypt.
- Product-mode regulator decrypt requires the configured regulator wallet and real aggregate decrypt before JSON certificate export.
- Added local-only actor import instruction helper that does not print private keys unless explicitly run with an unsafe local flag.
- Upgraded `bounty-skill/` into the Astraea Confidential Finance Patterns artifact and added validation.
- Added `docs/TRACK_READINESS.md`.
