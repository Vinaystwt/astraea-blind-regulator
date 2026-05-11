# Sepolia Runbook

## Required Environment

```bash
cd contracts
cp .env.example .env
```

Fill:

- `SEPOLIA_RPC_URL`
- issuer wallet value
- Investor A wallet value
- Investor B wallet value
- Investor C wallet value
- `REGULATOR_ADDRESS`
- regulator wallet value for seed/decrypt rehearsals
- Optional Etherscan verification token
- `ZAMA_RELAYER_URL` if required by the current frontend relayer environment

The issuer and investor wallets need Sepolia ETH. The legacy deployer fallback remains issuer-only, but actor-specific keys are preferred.

Current verified relayer URL:

```bash
ZAMA_RELAYER_URL=https://relayer.testnet.zama.org
```

## Deploy

```bash
npm run compile
npm run deploy:sepolia
npm run open:sepolia
```

Deployment writes `frontend-handoff/deployed-addresses.sepolia.json`.

Current deployed contract:

```text
0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9
```

## Seed

```bash
ASTRAEA_FUND_ADDRESS=0x... npm run seed:sepolia
```

The seed submits A/B/C from separate investor wallets: A approved, B rejected by per-investor cap, C rejected by fund capacity.

## Verified Sepolia Run

- Deployment tx: `0xcf2f17f4078c0d3b16a556c9e7b22173a1deef1cf0a9906a161bbbeb94c8a323`
- Open tx: `0xad6c39e3a2f1ec1ef0d4eaba8c6aea30687f8371b6f04006918c42446eb9a700`
- Investor A submit tx: `0xf2ed8d0897adb552e8f7dd4928e87c935ba553b19e318b6530cbcd37536beb26`
- Investor B submit tx: `0x6caad0479f925cab61559a45528d23768ae125be42e3f1ff59fd622fab88ec4d`
- Investor C submit tx: `0x5ea8434ceee4574585a484de8ee0d7f27a30f08d6333ee84f6308a3f900b3b66`
- Regulator decrypt verified aggregate: acceptedExposure `400000`, acceptedCount `1`, rejectedCount `2`

## Not Completed Automatically

Private keys remain local only. Do not paste or commit them.

## Browser Wallet Import

Actor private keys are stored locally in ignored files such as `contracts/sepolia-actors.local.json` and `contracts/.env`.

To rehearse wallet-authorized decrypts, import Investor A, Investor B, Investor C, and Regulator into MetaMask or Brave locally. Never paste keys into chat or commit them.

Address-only helper:

```bash
cd contracts
npm run actors:import-help
```

The helper hides private keys by default. It has an explicit unsafe local flag for personal use only.

## Frontend Product Env

```bash
VITE_CHAIN_ID=11155111
VITE_ASTRAEA_FUND_ADDRESS=0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9
VITE_ZAMA_RELAYER_URL=https://relayer.testnet.zama.org
VITE_SHOW_INTERNAL_GUIDES=false
VITE_ENABLE_DEMO_ASSIST=false
VITE_ENABLE_ISSUER_CONTROLS=false
```

Set `VITE_SEPOLIA_RPC_URL` in the frontend or Netlify environment for public event loading. Do not commit provider URLs with private API keys.
