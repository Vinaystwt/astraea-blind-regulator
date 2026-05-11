# Handle Replacement Silent Failure

Assignments after `FHE.select`, `FHE.add`, casts, or logical operations replace the ciphertext handle. Old ACLs do not automatically make the new handle decryptable in later transactions.

Tests should submit twice and decrypt the final aggregate to prove re-granting works.
