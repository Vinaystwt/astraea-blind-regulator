# ACL Grants

Use minimum necessary grants.

```solidity
FHE.allowThis(result);
FHE.allow(result, msg.sender);
```

For aggregates:

```solidity
FHE.allowThis(acceptedCount);
FHE.allow(acceptedCount, regulator);
```
