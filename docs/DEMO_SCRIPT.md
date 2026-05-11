# Demo Script

1. Deploy `AstraeaFund` with `Astraea APAC Growth Note I`, policy `v1`, per-investor max `500000`, and max fund exposure `700000`.
2. Issuer calls `openFund()`.
3. Investor A encrypts `400000` and submits.
4. Investor B encrypts `600000` and submits.
5. Investor C encrypts `400000` and submits after Investor A has consumed `400000` of accepted exposure.
6. Public feed shows only `InvestorSubmitted` and `ComplianceReceiptCreated` for all investors.
7. Investor A decrypts `approved = true`, `reason = 1`.
8. Investor B decrypts `approved = false`, `reason = 2`.
9. Investor C decrypts `approved = false`, `reason = 3`.
10. Regulator decrypts accepted exposure `400000`, accepted count `1`, rejected count `2`.

Do not describe the result publicly during the observer portion of the demo.
