# Astraea Frontend

The React frontend for Astraea — The Blind Regulator.

## Quick Start

```bash
# From repo root
cp frontend-handoff/ABI.json frontend/public/ABI.json
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment

Copy `.env.example` to `.env` and fill the values:

```bash
cp .env.example .env
```

| Variable | Description |
|----------|-------------|
| `VITE_CHAIN_ID` | `31337` for local Hardhat, `11155111` for Sepolia |
| `VITE_ASTRAEA_FUND_ADDRESS` | Deployed `AstraeaFund` contract address |
| `VITE_SEPOLIA_RPC_URL` | Sepolia RPC URL (optional for frontend; required for node scripts) |
| `VITE_ZAMA_RELAYER_URL` | Zama FHE relayer URL — required for real encryption/decryption |
| `VITE_ENABLE_DEMO_ASSIST` | `false` by default; set `true` only to show expected-value Demo Assist panels |
| `VITE_SHOW_INTERNAL_GUIDES` | `false` by default; set `true` to show the internal Demo Script route and Recording Guide |
| `VITE_ENABLE_ISSUER_CONTROLS` | `false` by default; set `true` only for issuer lifecycle rehearsals |

Verified Sepolia values:

```bash
VITE_CHAIN_ID=11155111
VITE_ASTRAEA_FUND_ADDRESS=0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9
VITE_SEPOLIA_RPC_URL=<your Sepolia RPC URL>
VITE_ZAMA_RELAYER_URL=https://relayer.testnet.zama.org
VITE_SHOW_INTERNAL_GUIDES=false
VITE_ENABLE_DEMO_ASSIST=false
VITE_ENABLE_ISSUER_CONTROLS=false
```

## Local Hardhat Demo

1. Terminal 1: `cd contracts && npm run node`
2. Terminal 2: `cd contracts && npm run seed:local && npm run export:frontend`
3. Terminal 3: `cp frontend-handoff/ABI.json frontend/public/ABI.json && cd frontend && npm install && npm run dev`
4. Open `http://localhost:5173`
5. Connect MetaMask to `localhost:8545`, chainId `31337`

The local seed deploys the fund, opens it, and submits Investor A/B/C.

## Modes

### Public UI Default

The public/product UI hides internal recording tools by default. Set `VITE_SHOW_INTERNAL_GUIDES=true` only for rehearsals that need the Demo Script route or floating Recording Guide.

### Demo Assist

Demo Assist is hidden by default in product mode. Enable it only with `VITE_ENABLE_DEMO_ASSIST=true` or `VITE_SHOW_INTERNAL_GUIDES=true`. Simulated ciphertext previews cannot be submitted to the real contract.

### Contract Mode

Contract address configured. Public Observer reads Sepolia state through `VITE_SEPOLIA_RPC_URL` without requiring a wallet. Wallet connection is required only for signed actions and authorized investor/regulator decrypt flows.

### Full Encryption/Decryption Mode

Requires Zama relayer at `VITE_ZAMA_RELAYER_URL`. Enables real FHE encryption of investor amounts and real handle decryption.

The Sepolia deployment has verified real encrypted A/B/C submissions and regulator aggregate decryption. In product mode, expected values stay hidden unless Demo Assist is explicitly enabled.

## Netlify Deploy Notes

Set these environment variables in Netlify:

```bash
VITE_CHAIN_ID=11155111
VITE_ASTRAEA_FUND_ADDRESS=0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9
VITE_ZAMA_RELAYER_URL=https://relayer.testnet.zama.org
VITE_SHOW_INTERNAL_GUIDES=false
VITE_ENABLE_DEMO_ASSIST=false
VITE_ENABLE_ISSUER_CONTROLS=false
```

Also set `VITE_SEPOLIA_RPC_URL` in Netlify for the Public Observer event feed. Do not commit private provider URLs.

## Scripts

```bash
npm run dev        # Start Vite dev server
npm run build      # TypeScript compile + Vite build
npm run typecheck  # TypeScript type check only
npm run preview    # Preview production build
```

## Views

| View | Role | Description |
|------|------|-------------|
| Home | All | Overview, role selector, network status |
| Issuer | Issuer | Policy card, open/close controls, receipt feed |
| Investor A/B/C | Investor | Encrypt amount, submit, decrypt own result |
| Public Observer | Public | Neutral no-leak receipt feed only |
| Regulator | Regulator | Encrypted aggregate handles, decrypt, certificate export |
| Demo Script | Internal only | Hidden unless `VITE_SHOW_INTERNAL_GUIDES=true` |

## Privacy Notes

The Public Observer view enforces absolute information hiding:
- No investor amount shown
- No approval/rejection shown
- No reason code shown
- No aggregate report shown
- Identical neutral styling for all submission receipts

The Investor view shows private results only after decryption, clearly labeled.

The Regulator view shows aggregate metrics only after decryption.

Investor result decryption requires the connected wallet to match the selected demo investor address. Regulator aggregate decryption requires the configured regulator wallet.

## Tech Stack

- React 18, TypeScript, Vite
- Tailwind CSS with Astraea design tokens
- ethers v6
- lucide-react icons
- Google Fonts: Cormorant Garamond, Inter, JetBrains Mono
