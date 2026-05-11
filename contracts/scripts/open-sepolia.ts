import "dotenv/config";
import { Contract } from "ethers";
import artifact from "../artifacts/contracts/AstraeaFund.sol/AstraeaFund.json";
import { getIssuerWallet, getProvider, readDeployment, writeDeployment, updateEnvValue } from "./sepolia-utils";

async function main() {
  const deployment = readDeployment();
  const address = process.env.ASTRAEA_FUND_ADDRESS || deployment?.AstraeaFund;
  if (!address) throw new Error("ASTRAEA_FUND_ADDRESS or contracts/deployments/sepolia.json is required");

  const issuer = getIssuerWallet();
  const fund = new Contract(address, artifact.abi, issuer);
  const state = await fund.fundState();
  if (state === 1n) {
    console.log(JSON.stringify({ network: "sepolia", AstraeaFund: address, issuer: issuer.address, status: "already-open" }, null, 2));
    return;
  }
  const tx = await fund.openFund();
  await tx.wait();
  const receipt = await getProvider().getTransactionReceipt(tx.hash);

  if (deployment) {
    writeDeployment({ ...deployment, openTx: tx.hash, openBlockNumber: receipt?.blockNumber, openedAt: new Date().toISOString() });
  }
  updateEnvValue("contracts/.env", "ASTRAEA_FUND_ADDRESS", address);

  console.log(
    JSON.stringify(
      {
        network: "sepolia",
        AstraeaFund: address,
        issuer: issuer.address,
        openTx: tx.hash,
        blockNumber: receipt?.blockNumber
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
