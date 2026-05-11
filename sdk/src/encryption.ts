import type { EncryptedInputPayload, RelayerLike } from "./types";

export async function encryptSubscriptionAmount(
  relayer: RelayerLike,
  contractAddress: string,
  userAddress: string,
  amount: bigint | number
): Promise<EncryptedInputPayload> {
  const input = relayer.createEncryptedInput(contractAddress, userAddress);
  input.add64(amount);
  const encrypted = await input.encrypt();
  return {
    handle: encrypted.handles[0],
    inputProof: encrypted.inputProof
  };
}
