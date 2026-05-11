# Astraea SDK

Thin TypeScript helpers for the frontend build. The SDK intentionally does not own wallet UI or relayer setup.

## Main Flow

```ts
const runtime = await connectAstraea(window.ethereum, address, abi);
const encrypted = await encryptSubscriptionAmount(relayer, address, userAddress, 400000n);
await submitSubscription(runtime.contract, encrypted);
const handles = await getMyResultHandles(runtime.contract);
```

For decryption, wire the current Zama relayer SDK user-decryption functions into `decryptMyResult` and `decryptAggregateReport`.

Local Hardhat tests use plugin helpers; browser production code should use `@zama-fhe/relayer-sdk@0.4.1` or the current compatible SDK version documented by Zama.
