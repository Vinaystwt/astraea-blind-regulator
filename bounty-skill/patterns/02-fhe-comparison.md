# FHE Comparison

Use FHE comparisons directly.

```solidity
ebool approved = FHE.le(amount, cap);
```

Do not decrypt to compare. Do not use public branches on private facts.
