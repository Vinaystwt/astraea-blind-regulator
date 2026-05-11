# Missing allowThis After Add

`FHE.add` returns a new handle. Transient permission during the transaction is not durable.

Bad:

```solidity
acceptedCount = FHE.add(acceptedCount, delta);
```

Good:

```solidity
acceptedCount = FHE.add(acceptedCount, delta);
FHE.allowThis(acceptedCount);
FHE.allow(acceptedCount, regulator);
```
