# Privacy Model

Public observers see fund metadata, transaction hashes, timestamps, lifecycle events, and compliance receipt creation.

Public observers do not see:

- subscription amount
- approval or rejection
- reason code
- aggregate exposure/count report

Investors can decrypt only their own approval result and reason code. Reason codes are `1 = approved`, `2 = rejected: per-investor max exceeded`, and `3 = rejected: fund capacity exceeded`. The regulator can decrypt only aggregate accepted exposure, accepted count, and rejected count. The issuer sees public policy and lifecycle data only in P0.

## Testable Rules

- No public event amount.
- No public event result.
- No public event reason code.
- Approved and rejected submissions emit identical event names and argument schemas.
- Unauthorized user decryption fails.
