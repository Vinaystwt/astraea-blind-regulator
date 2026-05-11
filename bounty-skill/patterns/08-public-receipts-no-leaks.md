# Public Receipts Without Leaks

Good:

```solidity
event ComplianceReceiptCreated(address indexed investor, uint256 timestamp);
```

Bad:

```solidity
event Approved(address investor, bool approved);
event AmountSubmitted(address investor, uint64 amount);
```

Approved and rejected submissions must emit the same event names and schemas.
