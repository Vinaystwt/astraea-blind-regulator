# User Flows

## Issuer

1. Connect issuer wallet.
2. Read `getPublicFundSummary()`.
3. Call `openFund()`.
4. Watch public receipt feed.
5. Call `closeFund()` after demo.

## Investor

1. Connect investor wallet.
2. Enter amount.
3. Create encrypted input for contract address and investor address.
4. Call `submit(handle, inputProof)`.
5. Read `getMyResultHandles()`.
6. Decrypt own `ebool` result and `euint8` reason.

## Regulator

1. Connect regulator wallet.
2. Read `getAggregateReportHandles()`.
3. Decrypt three `euint64` handles.
4. Display aggregate report only in the regulator view after authorized decrypt.

## Public Observer

1. Read metadata and events.
2. See receipt lifecycle only.
3. Never see private amount/outcome/reason or aggregate report.
