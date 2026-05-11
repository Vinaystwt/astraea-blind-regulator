# FHE Select

Use `FHE.select` for encrypted branching.

```solidity
euint8 reason = FHE.select(approved, FHE.asEuint8(1), FHE.asEuint8(2));
```

Both branches have the same public transaction shape.
