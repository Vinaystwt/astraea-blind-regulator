# Public Approval Events

Do not emit:

```solidity
event Approved(address indexed user, bool approved);
event Rejected(address indexed user, uint8 reason);
```

This defeats the product. Use identical no-leak receipt events instead.
