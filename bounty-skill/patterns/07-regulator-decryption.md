# Regulator Decryption

Expose aggregate handles to the regulator.

```solidity
require(msg.sender == regulator, "regulator only");
return (acceptedExposure, acceptedCount, rejectedCount);
```

Do not expose individual results to the regulator in P0 unless the product requires it.
