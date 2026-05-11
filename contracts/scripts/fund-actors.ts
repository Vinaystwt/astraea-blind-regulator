import { formatEther, parseEther } from "ethers";
import "dotenv/config";
import { getIssuerWallet, getProvider, getWalletFromEnv } from "./sepolia-utils";

const fundingPlan = [
  { label: "Investor A", walletEnv: "INVESTOR_A_PRIVATE_KEY", target: parseEther("0.05") },
  { label: "Investor B", walletEnv: "INVESTOR_B_PRIVATE_KEY", target: parseEther("0.05") },
  { label: "Investor C", walletEnv: "INVESTOR_C_PRIVATE_KEY", target: parseEther("0.05") },
  { label: "Regulator", walletEnv: "REGULATOR_PRIVATE_KEY", target: parseEther("0.03") }
];

async function main() {
  const issuer = getIssuerWallet();
  const provider = getProvider();
  const issuerBalance = await provider.getBalance(issuer.address);
  const required = fundingPlan.reduce((sum, item) => sum + item.target, 0n);
  if (issuerBalance < required) {
    throw new Error(`Issuer balance ${formatEther(issuerBalance)} ETH is below requested actor funding total ${formatEther(required)} ETH`);
  }

  const results = [];
  for (const item of fundingPlan) {
    const wallet = getWalletFromEnv(item.walletEnv);
    const balance = await provider.getBalance(wallet.address);
    if (balance >= item.target) {
      results.push({
        label: item.label,
        address: wallet.address,
        status: "already-funded",
        balanceEth: formatEther(balance)
      });
      continue;
    }
    const amount = item.target - balance;
    const tx = await issuer.sendTransaction({ to: wallet.address, value: amount });
    const receipt = await tx.wait();
    results.push({
      label: item.label,
      address: wallet.address,
      status: "funded",
      amountEth: formatEther(amount),
      txHash: tx.hash,
      blockNumber: receipt?.blockNumber
    });
  }

  console.log(JSON.stringify({ issuer: issuer.address, results }, null, 2));
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
