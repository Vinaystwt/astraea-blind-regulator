declare module "@zama-fhe/relayer-sdk" {
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
  }

  export function createInstance(options: ZamaOptions): Promise<ZamaInstance>;
}
