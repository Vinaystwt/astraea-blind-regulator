# Frontend Relayer Encryption

```ts
const input = relayer.createEncryptedInput(contractAddress, userAddress);
input.add64(400000n);
const encrypted = await input.encrypt();
await contract.submit(encrypted.handles[0], encrypted.inputProof);
```

The handle and proof are public transaction parameters. The plaintext value is not.
