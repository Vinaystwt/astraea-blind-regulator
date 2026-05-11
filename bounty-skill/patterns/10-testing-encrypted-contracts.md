# Testing Encrypted Contracts

Minimum tests:

- approve path decrypts true/reason 1 for authorized user
- reject path decrypts false/reason 2 for authorized user
- unauthorized users cannot decrypt
- regulator decrypts aggregates
- events contain no amount/result/reason
- handle replacement remains usable after sequential updates
