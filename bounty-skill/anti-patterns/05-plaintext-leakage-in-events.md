# Plaintext Leakage in Events

Never emit private values directly or indirectly.

Reject:

- amount fields
- booleans representing result
- reason codes
- event names that reveal branch outcome
- branch-specific argument schemas
