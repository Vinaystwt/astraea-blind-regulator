import "dotenv/config";
import { Contract, type Wallet } from "ethers";
import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/node";
import artifact from "../artifacts/contracts/AstraeaFund.sol/AstraeaFund.json";
import { getRelayerUrl, getWalletFromEnv, readDeployment } from "./sepolia-utils";

async function decryptFor(instance: Awaited<ReturnType<typeof createInstance>>, user: Wallet, address: string, handles: Array<{ handle: string; contractAddress: string }>) {
  const keypair = instance.generateKeypair();
  const startTimestamp = Math.floor(Date.now() / 1000);
  const durationDays = 7;
  const eip712 = instance.createEIP712(keypair.publicKey, [address], startTimestamp, durationDays);
  const signature = await user.signTypedData(
    eip712.domain,
    { UserDecryptRequestVerification: [...eip712.types.UserDecryptRequestVerification] },
    eip712.message
  );
  return instance.userDecrypt(handles, keypair.privateKey, keypair.publicKey, signature, [address], user.address, startTimestamp, durationDays);
}

async function main() {
  const deployment = readDeployment();
  const address = process.env.ASTRAEA_FUND_ADDRESS || deployment?.AstraeaFund;
  if (!address) throw new Error("ASTRAEA_FUND_ADDRESS or contracts/deployments/sepolia.json is required");

  const instance = await createInstance({ ...SepoliaConfig, network: process.env.SEPOLIA_RPC_URL!, relayerUrl: getRelayerUrl() });

  const investorA = getWalletFromEnv("INVESTOR_A_PRIVATE_KEY");
  const investorB = getWalletFromEnv("INVESTOR_B_PRIVATE_KEY");
  const investorC = getWalletFromEnv("INVESTOR_C_PRIVATE_KEY");
  const regulator = getWalletFromEnv("REGULATOR_PRIVATE_KEY");

  const fundA = new Contract(address, artifact.abi, investorA);
  const fundB = new Contract(address, artifact.abi, investorB);
  const fundC = new Contract(address, artifact.abi, investorC);
  const fundR = new Contract(address, artifact.abi, regulator);

  const [approvedA, reasonA] = await fundA.getMyResultHandles();
  const [approvedB, reasonB] = await fundB.getMyResultHandles();
  const [approvedC, reasonC] = await fundC.getMyResultHandles();
  const [exposure, accepted, rejected] = await fundR.getAggregateReportHandles();

  const decryptedA = await decryptFor(instance, investorA, address, [
    { handle: approvedA, contractAddress: address },
    { handle: reasonA, contractAddress: address }
  ]);
  const decryptedB = await decryptFor(instance, investorB, address, [
    { handle: approvedB, contractAddress: address },
    { handle: reasonB, contractAddress: address }
  ]);
  const decryptedC = await decryptFor(instance, investorC, address, [
    { handle: approvedC, contractAddress: address },
    { handle: reasonC, contractAddress: address }
  ]);
  const decryptedR = await decryptFor(instance, regulator, address, [
    { handle: exposure, contractAddress: address },
    { handle: accepted, contractAddress: address },
    { handle: rejected, contractAddress: address }
  ]);

  const results = {
    investorA: {
      address: investorA.address,
      approved: decryptedA[approvedA],
      reason: String(decryptedA[reasonA])
    },
    investorB: {
      address: investorB.address,
      approved: decryptedB[approvedB],
      reason: String(decryptedB[reasonB])
    },
    investorC: {
      address: investorC.address,
      approved: decryptedC[approvedC],
      reason: String(decryptedC[reasonC])
    },
    regulatorAggregate: {
      regulator: regulator.address,
      acceptedExposure: String(decryptedR[exposure]),
      acceptedCount: String(decryptedR[accepted]),
      rejectedCount: String(decryptedR[rejected])
    }
  };

  console.log(JSON.stringify({ network: "sepolia", AstraeaFund: address, results }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
