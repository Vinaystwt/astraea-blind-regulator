// Stub for @zama-fhe/relayer-sdk when not installed.
// When a real relayer SDK is available, install it via npm and remove this stub.
export async function initSDK() {
  throw new Error("@zama-fhe/relayer-sdk not installed. Set VITE_ZAMA_RELAYER_URL and install the SDK.");
}

export async function createInstance(_opts: { relayerUrl: string; chainId?: number; gatewayChainId?: number; network?: any }) {
  throw new Error("@zama-fhe/relayer-sdk not installed. Set VITE_ZAMA_RELAYER_URL and install the SDK.");
}
