declare module "@zama-fhe/relayer-sdk" {
  export * from "@zama-fhe/relayer-sdk/bundle";
}

declare module "@zama-fhe/relayer-sdk/bundle" {
  interface EncryptedInput {
    add64(value: bigint | number): void;
    encrypt(): Promise<{ handles: string[]; inputProof: string }>;
  }

  interface ZamaInstance {
    createEncryptedInput(contractAddress: string, userAddress: string): EncryptedInput;
    reencrypt(handle: string): Promise<unknown>;
  }

  interface ZamaOptions {
    relayerUrl: string;
    chainId?: number;
    gatewayChainId?: number;
    network?: any;
  }

  export function initSDK(): Promise<void>;
  export function createInstance(options: ZamaOptions): Promise<ZamaInstance>;
}
