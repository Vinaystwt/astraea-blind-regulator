import "dotenv/config";
import { Contract, Wallet } from "ethers";
import { createInstance, SepoliaConfig } from "@zama-fhe/relayer-sdk/node";
import artifact from "../artifacts/contracts/AstraeaFund.sol/AstraeaFund.json";
import { getProvider, getRelayerUrl, readDeployment, writeDeployment } from "./sepolia-utils";

async function encrypt64(contractAddress: string, userAddress: string, value: bigint) {
  const instance = await createInstance({ ...SepoliaConfig, network: process.env.SEPOLIA_RPC_URL!, relayerUrl: getRelayerUrl() });
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.add64(value);
  const encrypted = await input.encrypt();
  return { handle: encrypted.handles[0], proof: encrypted.inputProof };
}

async function submitFor(label: string, fundAddress: string, privateKey: string, amount: bigint, expectedPrivateResult: string) {
  const investor = new Wallet(privateKey, getProvider());
  const fund = new Contract(fundAddress, artifact.abi, investor);
  const encrypted = await encrypt64(fundAddress, investor.address, amount);
  const tx = await fund.submit(encrypted.handle, encrypted.proof);
  const receipt = await tx.wait();
  return {
    label,
    address: investor.address,
    amount: amount.toString(),
    submitTx: tx.hash,
    blockNumber: receipt?.blockNumber,
    expectedPrivateResult
  };
}

async function main() {
  const deployment = readDeployment();
  const fundAddress = process.env.ASTRAEA_FUND_ADDRESS || deployment?.AstraeaFund;
  if (!fundAddress) throw new Error("ASTRAEA_FUND_ADDRESS or contracts/deployments/sepolia.json is required");
  if (!process.env.INVESTOR_A_PRIVATE_KEY) throw new Error("INVESTOR_A_PRIVATE_KEY is required");
  if (!process.env.INVESTOR_B_PRIVATE_KEY) throw new Error("INVESTOR_B_PRIVATE_KEY is required");
  if (!process.env.INVESTOR_C_PRIVATE_KEY) throw new Error("INVESTOR_C_PRIVATE_KEY is required");

  const submissions = [
    await submitFor("Investor A", fundAddress, process.env.INVESTOR_A_PRIVATE_KEY, 400000n, "APPROVED"),
    await submitFor(
      "Investor B",
      fundAddress,
      process.env.INVESTOR_B_PRIVATE_KEY,
      600000n,
      "REJECTED_PER_INVESTOR_CAP"
    ),
    await submitFor(
      "Investor C",
      fundAddress,
      process.env.INVESTOR_C_PRIVATE_KEY,
      400000n,
      "REJECTED_FUND_CAPACITY"
    )
  ];

  if (deployment) {
    writeDeployment({ ...deployment, seedTxs: submissions, seededAt: new Date().toISOString() });
  }

  console.log(
    JSON.stringify(
      {
        network: "sepolia",
        AstraeaFund: fundAddress,
        maxInvestorSubscription: "500000",
        maxFundExposure: "700000",
        submissions
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
