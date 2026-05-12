# Architecture

Astraea is a single-policy confidential subscription engine. Public state describes the fund and receipt trail; encrypted state carries investor outcomes and regulator aggregates.

```text
Investor wallet
  -> Browser frontend
  -> Zama Relayer SDK encrypted input + proof
  -> AstraeaFund.submit(externalEuint64, inputProof)
  -> FHE.le(amount, maxInvestorSubscription)
  -> FHE.le(acceptedExposure + amount, maxFundExposure)
  -> FHE.select result, reason, and aggregate updates
  -> ACL grants for investor/regulator decrypt
  -> Public no-leak receipt events
```

## Onchain

- `contracts/contracts/AstraeaFund.sol`: deployed Sepolia policy engine.
- `contracts/contracts/AstraeaSmoke.sol`: minimal FHEVM proof contract.
- `contracts/contracts/examples/*`: compact pattern examples.

## Offchain

- `frontend/`: role-based product UI for public observer, issuer, investor, and regulator flows.
- `sdk/`: typed helpers for contract access, encrypted submissions, and decrypt adapters.
- `contracts/scripts/*`: local and Sepolia deployment, seeding, actor funding, verification, and ABI export.
- `frontend-handoff/ABI.json`: exported ABI consumed by the frontend build and external integrators.

## Privacy Boundary

Public observers can read policy metadata, tx hashes, timestamps, and neutral events. Investor amounts, outcomes, reason codes, and regulator aggregates remain encrypted until an authorized wallet decrypts the relevant handles.
