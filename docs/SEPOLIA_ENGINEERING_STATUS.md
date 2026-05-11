# Sepolia Engineering Status

Updated: 2026-05-10

## Deployment

- Network: Sepolia
- Chain ID: 11155111
- AstraeaFund: `0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9`
- Issuer/deployer: `0x94c188F8280cA706949CC030F69e42B5544514ac`
- Regulator: `0xB6767dAA4aF50DA070FE2600E5f9C0d8146227fe`
- Deployment tx: `0xcf2f17f4078c0d3b16a556c9e7b22173a1deef1cf0a9906a161bbbeb94c8a323`
- Deployment block: `10828295`
- Open fund tx: `0xad6c39e3a2f1ec1ef0d4eaba8c6aea30687f8371b6f04006918c42446eb9a700`
- Open fund block: `10828297`

## Policy

- Fund: Astraea APAC Growth Note I
- Policy version: v1
- maxInvestorSubscription: 500000
- maxFundExposure: 700000
- Unit: USDC simplified units

## Actor Wallets

Private keys are stored only in ignored local env files.

- Issuer: `0x94c188F8280cA706949CC030F69e42B5544514ac`
- Investor A: `0xb4D1e1B488636EaF0e074ACF1B6b5C4F6Af223e6`
- Investor B: `0xB1C45B18639f736Cdc5F22D2C75EB4f0474e3d7B`
- Investor C: `0xc99033b39a2a4e375452e088C42EeAD320e9Acd6`
- Regulator: `0xB6767dAA4aF50DA070FE2600E5f9C0d8146227fe`

## Funding

- Investor A funding tx: `0x2bd142964f6f6b754ffb65a720478c1eda5a0f3e4bbaf5e73a2d0982ff80bd27`
- Investor B funding tx: `0xc374403bcd8ceddabf07e64f262ac4f3bd7eafbbdb5e2235e6f716ca8045d083`
- Investor C funding tx: `0xeef6daf1355f258aa0956c79303ab2e0c1fc81c53369caa4231a45da92cdbac9`
- Regulator funding tx: `0xb0768d7597f59e1af61dc581bdf1f42978a442d47c95ac423390348f78bc8cc7`

## Encrypted Seed

Real encrypted inputs were created with `@zama-fhe/relayer-sdk@0.4.1` and `https://relayer.testnet.zama.org`.

- Investor A submitted 400000: `0xf2ed8d0897adb552e8f7dd4928e87c935ba553b19e318b6530cbcd37536beb26`
- Investor B submitted 600000: `0x6caad0479f925cab61559a45528d23768ae125be42e3f1ff59fd622fab88ec4d`
- Investor C submitted 400000: `0x5ea8434ceee4574585a484de8ee0d7f27a30f08d6333ee84f6308a3f900b3b66`

## Decryption Verification

Verified through the relayer/KMS user decrypt path:

- Investor A: approved `true`, reason `1`
- Investor B: approved `false`, reason `2`
- Investor C: approved `false`, reason `3`
- Regulator aggregate: acceptedExposure `400000`, acceptedCount `1`, rejectedCount `2`

## Frontend Wiring

- `frontend/.env` was synced locally with chain ID `11155111`, the deployed contract address, and the Zama relayer URL.
- `frontend/.env` is ignored and must not be committed.
- Public receipt links should use Sepolia Etherscan transaction URLs.
- Product mode defaults hide internal recording tools, expected outcomes, demo aggregate values, and issuer lifecycle controls.
- Demo Assist is opt-in through `VITE_ENABLE_DEMO_ASSIST=true` or `VITE_SHOW_INTERNAL_GUIDES=true`. It must not be presented as real ciphertext or real decryption.
- Public Observer reads Sepolia receipts from deployment block `10828295` through the configured read-only RPC and does not require wallet connection.
- Investor decrypt requires the selected investor wallet. Regulator aggregate decrypt requires the configured regulator wallet.

## Known Engineering Notes

- Hardhat FHEVM plugin Sepolia task initialization failed against the Alchemy endpoint because the plugin probes `anvil_nodeInfo` and the endpoint returns an unsupported-method `SERVER_ERROR`. Sepolia operational scripts were moved to standalone `ethers` plus `@zama-fhe/relayer-sdk` execution.
- Real encryption, submit, and user decryption have been verified despite that Hardhat plugin provider issue.
- Sepolia testnet demonstration only. No real assets, no real KYC, not a licensed compliance product.
