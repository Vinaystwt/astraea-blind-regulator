import * as hre from "hardhat";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  await hre.fhevm.initializeCLIApi();
  const [issuer, , , regulator] = await hre.ethers.getSigners();
  const regulatorAddress = process.env.REGULATOR_ADDRESS || regulator.address;
  const factory = await hre.ethers.getContractFactory("AstraeaFund", issuer);
  const fund = await factory.deploy("Astraea APAC Growth Note I", "v1", 500000, 700000, regulatorAddress);
  await fund.waitForDeployment();

  const address = await fund.getAddress();
  const output = {
    network: hre.network.name,
    chainId: Number((await hre.ethers.provider.getNetwork()).chainId),
    AstraeaFund: address,
    issuer: issuer.address,
    regulator: regulatorAddress,
    maxInvestorSubscription: "500000",
    maxFundExposure: "700000",
    deployedAt: new Date().toISOString()
  };

  const outDir = resolve(__dirname, "../../frontend-handoff");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "deployed-addresses.local.json"), `${JSON.stringify(output, null, 2)}\n`);
  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
