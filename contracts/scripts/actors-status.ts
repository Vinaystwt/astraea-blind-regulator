import { formatEther, Wallet } from "ethers";
import "dotenv/config";
import { getIssuerPrivateKey, getProvider } from "./sepolia-utils";

async function main() {
  const actors = {
    issuer: new Wallet(getIssuerPrivateKey()),
    investorA: new Wallet(process.env.INVESTOR_A_PRIVATE_KEY || Wallet.createRandom().privateKey),
    investorB: new Wallet(process.env.INVESTOR_B_PRIVATE_KEY || Wallet.createRandom().privateKey),
    investorC: new Wallet(process.env.INVESTOR_C_PRIVATE_KEY || Wallet.createRandom().privateKey),
    regulator: new Wallet(process.env.REGULATOR_PRIVATE_KEY || Wallet.createRandom().privateKey)
  };

  const output: Record<string, { address: string; balanceEth: string; configured: boolean }> = {};
  const provider = getProvider();
  for (const [label, wallet] of Object.entries(actors)) {
    const balance = await provider.getBalance(wallet.address);
    const envName =
      label === "issuer"
        ? "ISSUER_PRIVATE_KEY"
        : `${label === "investorA" ? "INVESTOR_A" : label === "investorB" ? "INVESTOR_B" : label === "investorC" ? "INVESTOR_C" : "REGULATOR"}_PRIVATE_KEY`;
    output[label] = {
      address: wallet.address,
      balanceEth: formatEther(balance),
      configured: label === "issuer" ? Boolean(process.env.ISSUER_PRIVATE_KEY || process.env.PRIVATE_KEY) : Boolean(process.env[envName])
    };
  }
  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
