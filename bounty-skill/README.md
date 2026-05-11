# Astraea Confidential Finance Patterns

Reusable FHEVM design patterns for confidential finance applications with public receipts and selective disclosure.

This bounty artifact is derived from Astraea — The Blind Regulator, a Sepolia-deployed confidential RWA subscription policy engine. It teaches other Zama builders how to keep private user values encrypted, publish neutral receipts, authorize scoped decrypts, and avoid UI/event privacy leaks.

## Contents

- `SKILL.md`: main reusable skill and pass/fail rubric.
- `patterns/`: focused notes for encrypted input, comparison, select, state updates, ACL, decrypt, receipts, relayer flow, and testing.
- `anti-patterns/`: common privacy and ACL mistakes.
- `examples/`: small Solidity reference contracts derived from Astraea patterns.
- `evaluation/`: static test harness and evaluation prompt.
- `scripts/validate-skill.mjs`: local artifact validation.

## Validate

```bash
cd bounty-skill
npm run validate
```

The validator checks required sections, reference implementation details, local file references, and obvious credential leakage patterns. It is not a replacement for contract tests.

## Evaluate Another Agent

```bash
node evaluation/test-harness.js /path/to/candidate
```

Pair the static harness with real Hardhat/FHEVM tests for encrypted execution, ACL isolation, and event privacy.

## Reference Implementation

- Sepolia `AstraeaFund`: `0xB9F38E0180F62e80Be6ca44cE6202316FCcefEC9`
- Deployment block: `10828295`
- Policy: max investor subscription `500000`, max fund exposure `700000`
- Verified flow: A approved, B rejected by per-investor cap, C rejected by fund capacity
- Regulator aggregate: accepted exposure `400000`, accepted count `1`, rejected count `2`

## Limitations

Sepolia testnet demonstration only. No real assets, no real KYC, no token movement, and not a licensed compliance product. Always verify current Zama FHEVM APIs before implementing a new contract.
