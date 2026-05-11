# Evaluation Prompt

Build a confidential voting or private credit eligibility policy engine using Zama FHEVM.

Requirements:

- encrypted user input
- encrypted comparison or eligibility computation
- `FHE.select` for private branching
- conditional encrypted aggregate update
- `allowThis` after every handle mutation
- minimal ACL grants
- no public result events
- unauthorized decryption failure tests
- public receipts with identical schema for pass/fail outcomes

Return contracts, tests, and docs. Explain any limitations honestly.
