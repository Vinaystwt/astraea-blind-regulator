# API Decisions

Verification date: 2026-05-06

Sources checked:
- Official Zama Hardhat plugin docs: https://docs.zama.org/protocol/solidity-guides/development-guide/hardhat
- Official encrypted input docs: https://docs.zama.ai/protocol/solidity-guides/smart-contract/inputs
- Official quick-start FHEVM tutorial: https://docs.zama.org/protocol/solidity-guides/getting-started/quick-start-tutorial/turn_it_into_fhevm
- Official ACL examples: https://docs.zama.org/protocol/solidity-guides/smart-contract/acl/acl_examples
- Installed packages: `@fhevm/solidity@0.11.1`, `@fhevm/hardhat-plugin@0.4.2`, `@zama-fhe/relayer-sdk@0.4.1`

## Solidity Import Path

Current import:

```solidity
import {FHE, ebool, euint8, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";
```

The current library is `FHE`, not the older `TFHE`. Contracts inherit `ZamaEthereumConfig`, which configures local Hardhat chain `31337` and Sepolia `11155111`.

## Encrypted Input Pattern

Solidity functions accept `externalEuintXX` plus `bytes calldata inputProof`.

```solidity
euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
```

TypeScript tests and scripts create inputs with:

```ts
const input = hre.fhevm.createEncryptedInput(contractAddress, userAddress);
input.add64(400000n);
const encrypted = await input.encrypt();
await contract.submit(encrypted.handles[0], encrypted.inputProof);
```

## Comparison and Branching

Comparing encrypted values to public constants is supported. Astraea uses it for both per-investor and post-submission exposure checks:

```solidity
ebool withinInvestorLimit = FHE.le(amount, maxInvestorSubscription);
euint64 postSubmissionExposure = FHE.add(acceptedExposure, amount);
ebool withinFundCapacity = FHE.le(postSubmissionExposure, maxFundExposure);
ebool approved = FHE.and(withinInvestorLimit, withinFundCapacity);
```

Encrypted branching uses `FHE.select`:

```solidity
euint64 acceptedAmount = FHE.select(approved, amount, FHE.asEuint64(0));
euint8 capacityReason = FHE.select(withinFundCapacity, FHE.asEuint8(1), FHE.asEuint8(3));
euint8 reason = FHE.select(withinInvestorLimit, capacityReason, FHE.asEuint8(2));
```

## ACL Function Names

Current names:

- `FHE.allow(ciphertext, address)`
- `FHE.allowThis(ciphertext)`
- `FHE.allowTransient(ciphertext, address)`
- `FHE.isAllowed(ciphertext, address)`
- `FHE.isSenderAllowed(ciphertext)`
- `FHE.makePubliclyDecryptable(ciphertext)`

A user-decryptable ciphertext must be allowed to both the decrypting user and the contract.

## Return Values and Handles

Encrypted values can be returned from view functions as encrypted types such as `ebool`, `euint8`, and `euint64`. In ABI/client terms these are `bytes32` ciphertext handles. The frontend must pass those handles into user decryption with the correct FHEVM type.

## User Decryption Pattern

Hardhat tests use:

```ts
await hre.fhevm.userDecryptEbool(handle, contractAddress, userSigner);
await hre.fhevm.userDecryptEuint(FhevmType.euint64, handle, contractAddress, userSigner);
```

The browser frontend should use `@zama-fhe/relayer-sdk@0.4.1` or the current compatible SDK to create encrypted inputs and perform ACL-gated user decryption.

## Handle Replacement and `allowThis`

Encrypted operations such as `FHE.add`, `FHE.select`, and `FHE.not` return new handles. The docs state operation results have transient permission during the transaction, so persistent access must be re-granted before the function exits.

Decision: Astraea re-grants `FHE.allowThis` after every stored encrypted handle replacement and grants only the intended user/regulator reader.

Validated by `contracts/test/accumulator.spec.ts`:

- Initialize encrypted accumulators.
- Submit two sequential encrypted values.
- Re-grant after each accumulator update.
- Regulator decrypts expected final values.
- Contract continues computing after the first handle replacement.

Negative validation: the implementation does not include a deliberately broken contract in the main suite, but the anti-pattern docs explain that omitting the re-grant leaves later transactions/decryption without durable ACL. Current docs and installed implementation make this a required pattern.

## Public Decryption

Public decryption is deliberately not used for investor outcomes or aggregate reports in Astraea P0. Individual investor values are user-decryptable only by the investor, and aggregate report handles are user-decryptable only by the regulator.

## Runtime Modes

Local Hardhat tests use mock FHEVM execution through the official plugin. Sepolia is the real encrypted runtime and requires a Sepolia RPC URL, issuer/investor wallet values, funded actor wallets, and a regulator address. The legacy deployer fallback remains issuer-only.
