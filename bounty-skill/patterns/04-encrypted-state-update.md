# Encrypted State Update

Conditional accumulator:

```solidity
acceptedExposure = FHE.add(acceptedExposure, FHE.select(approved, amount, FHE.asEuint64(0)));
FHE.allowThis(acceptedExposure);
FHE.allow(acceptedExposure, regulator);
```

The assignment creates a new encrypted handle. Re-grant ACL on the new handle.
