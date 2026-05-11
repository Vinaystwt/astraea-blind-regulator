// Stub for @zama-fhe/relayer-sdk/web when SDK is not installed.
// When the real SDK is installed (npm install @zama-fhe/relayer-sdk),
// vite.config.ts stops aliasing to this file and uses the real package.

export async function initSDK(_opts?: Record<string, unknown>): Promise<void> {
  throw new Error(
    "@zama-fhe/relayer-sdk not installed. Run: cd frontend && npm install @zama-fhe/relayer-sdk"
  );
}

export async function createInstance(_config: unknown): Promise<never> {
  throw new Error(
    "@zama-fhe/relayer-sdk not installed. Run: cd frontend && npm install @zama-fhe/relayer-sdk"
  );
}

// Sepolia contract addresses — mirrored here so the stub compiles without the real SDK.
export const SepoliaConfig = {
  aclContractAddress: "0xf0Ffdc93b7E186bC2f8CB3dAA75D86d1930A433D",
  kmsContractAddress: "0xbE0E383937d564D7FF0BC3b46c51f0bF8d5C311A",
  inputVerifierContractAddress: "0xBBC1fFCdc7C316aAAd72E807D9b0272BE8F84DA0",
  verifyingContractAddressDecryption: "0x5D8BD78e2ea6bbE41f26dFe9fdaEAa349e077478",
  verifyingContractAddressInputVerification: "0x483b9dE06E4E4C7D35CCf5837A1668487406D955",
  chainId: 11155111,
  gatewayChainId: 10901,
  relayerUrl: "https://relayer.testnet.zama.org",
} as const;
