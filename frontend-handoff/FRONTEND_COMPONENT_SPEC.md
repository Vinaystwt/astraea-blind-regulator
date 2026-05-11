# Frontend Component Spec

## Shell

Use a compact app layout with four role tabs: Issuer, Investor, Regulator, Public. Keep the public receipt feed visible in issuer/public contexts.

## Issuer View

- Policy card with fund name, policy version, max investor subscription, max fund exposure, unit label, and state.
- Open/close action buttons.
- Receipt table showing investor address, tx hash if indexed from provider, timestamp, and lifecycle event.
- No individual decrypted private facts.

## Investor View

- Amount input.
- Encrypt button using relayer SDK.
- Submit button.
- Result panel that only appears after `getMyResultHandles()` and user decryption.
- Reason labels after private decrypt only: `1 = approved`, `2 = per-investor max exceeded`, `3 = fund capacity exceeded`.

## Regulator View

- Aggregate decrypt button.
- Report fields: accepted exposure, accepted count, rejected count.
- No individual investor result decrypt.

## Public View

- Fund metadata.
- Receipt feed with identical rendering for approved and rejected submissions.
- Never show amount, approval, rejection, or reason.
- Never show aggregate report values.
- Any policy preview must only claim the two rules enforced by the contract.
