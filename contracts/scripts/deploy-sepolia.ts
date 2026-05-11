import "dotenv/config";
import { ContractFactory } from "ethers";
import artifact from "../artifacts/contracts/AstraeaFund.sol/AstraeaFund.json";
import { getIssuerWallet, getProvider, getRegulatorAddress, getRelayerUrl, POLICY, updateEnvValue, writeDeployment } from "./sepolia-utils";

async function main() {
  if (!process.env.SEPOLIA_RPC_URL) throw new Error("SEPOLIA_RPC_URL is required");
  const regulator = getRegulatorAddress();

  const issuer = getIssuerWallet();
  const factory = new ContractFactory(artifact.abi, artifact.bytecode, issuer);
  const fund = await factory.deploy(
    POLICY.fundName,
    POLICY.policyVersion,
    Number(POLICY.maxInvestorSubscription),
    Number(POLICY.maxFundExposure),
    regulator
  );
  await fund.waitForDeployment();
  const deploymentTx = fund.deploymentTransaction();
  const receipt = deploymentTx ? await deploymentTx.wait() : null;
  const address = await fund.getAddress();

  const output = {
    network: "sepolia",
    chainId: Number((await getProvider().getNetwork()).chainId),
    AstraeaFund: address,
    deployer: issuer.address,
    issuer: issuer.address,
    regulator,
    relayerUrl: getRelayerUrl(),
    policy: POLICY,
    deploymentTx: deploymentTx?.hash,
    deploymentBlockNumber: receipt?.blockNumber,
    deployedAt: new Date().toISOString()
  } as const;

  writeDeployment(output);
  updateEnvValue("contracts/.env", "ASTRAEA_FUND_ADDRESS", address);
  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
