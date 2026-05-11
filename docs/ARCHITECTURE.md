# Architecture

```text
Investor wallet
  -> Relayer SDK encrypted input
  -> AstraeaFund.submit(externalEuint64, inputProof)
  -> FHE.le(amount, maxInvestorSubscription)
  -> FHE.le(acceptedExposure + amount, maxFundExposure)
  -> FHE.and(perInvestorOk, fundCapacityOk)
  -> FHE.select encrypted result/reason and aggregate deltas
  -> ACL grants to investor/regulator
  -> Public no-leak receipt events
```

## Contracts

- `AstraeaSmoke.sol`: minimal proof of encrypted input, comparison, storage, ACL, aggregate, and event privacy.
- `AstraeaFund.sol`: one immutable demo fund and policy with private investor results and regulator aggregate report.
- `examples/*`: focused patterns for counter, policy engine, and conditional accumulator.

## Offchain Handoff

- `frontend-handoff/ABI.json`: exported ABI.
- `frontend-handoff/deployed-addresses.example.json`: address file shape.
- `sdk/src/*`: TypeScript helpers for encryption, submission, handles, and decryption.
