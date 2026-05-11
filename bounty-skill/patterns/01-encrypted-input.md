# Encrypted Input

Accept `externalEuint64 encryptedValue, bytes calldata inputProof`.

```solidity
euint64 value = FHE.fromExternal(encryptedValue, inputProof);
```

The frontend must encrypt for the target contract address and calling user address.
