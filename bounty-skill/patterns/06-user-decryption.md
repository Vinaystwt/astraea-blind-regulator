# User Decryption

Return handles:

```solidity
function getMyResultHandles() external view returns (ebool, euint8);
```

The frontend decrypts with the user's wallet signature. The contract must have also been allowed with `allowThis`.
