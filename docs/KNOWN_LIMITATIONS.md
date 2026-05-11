# Known Limitations

- Local Hardhat tests use Zama's mock FHEVM runtime. Sepolia is required for real encrypted execution.
- No React frontend is included in this run.
- No ERC20 transfers, token minting, KYC, oracle, marketplace, PDF export, or legal workflow is implemented.
- The demo uses one fixed fund contract rather than a multi-fund factory.
- Sepolia deployment requires human-provided RPC URL, funded private key, and regulator address.
- The SDK includes browser relayer integration helpers, but real wallet UX and relayer environment wiring belong to the frontend build.
