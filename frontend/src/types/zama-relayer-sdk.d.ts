declare module "@zama-fhe/relayer-sdk/web" {
  export type EncryptedInput = {
    add64(value: bigint | number): void;
    encrypt(): Promise<{ handles: string[]; inputProof: string }>;
  };

  export type UserDecryptHandle = {
    handle: string;
    contractAddress: string;
  };

  export type RelayerInstance = {
    createEncryptedInput(contractAddress: string, userAddress: string): EncryptedInput;
    createEIP712(
      publicKey: string,
      contractAddresses: string[],
      startTimestamp: number,
      durationDays: number
    ): {
      domain: Record<string, unknown>;
      types: Record<string, unknown>;
      message: Record<string, unknown>;
    };
    generateKeypair(): { publicKey: string; privateKey: string };
    userDecrypt(
      handles: UserDecryptHandle[],
      privateKey: string,
      publicKey: string,
      signature: string,
      contractAddresses: string[],
      userAddress: string,
      startTimestamp: number,
      durationDays: number
    ): Promise<Record<`0x${string}`, bigint | boolean | string>>;
  };

  export type RelayerOptions = {
    relayerUrl: string;
    network?: unknown;
    chainId?: number;
    gatewayChainId?: number;
    aclContractAddress?: string;
    kmsContractAddress?: string;
    inputVerifierContractAddress?: string;
    verifyingContractAddressDecryption?: string;
    verifyingContractAddressInputVerification?: string;
  };

  export const SepoliaConfig: RelayerOptions;
  export function initSDK(): Promise<boolean>;
  export function createInstance(options: RelayerOptions): Promise<RelayerInstance>;
}
