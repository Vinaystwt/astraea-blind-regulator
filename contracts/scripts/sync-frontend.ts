import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { readDeployment, updateEnvValue, getRelayerUrl } from "./sepolia-utils";

async function main() {
  const deployment = readDeployment();
  if (!deployment) throw new Error("contracts/deployments/sepolia.json is required");

  const frontendDir = resolve(__dirname, "../../frontend");
  mkdirSync(frontendDir, { recursive: true });
  const envPath = resolve(frontendDir, ".env");
  updateEnvValue(envPath, "VITE_CHAIN_ID", "11155111");
  updateEnvValue(envPath, "VITE_ASTRAEA_FUND_ADDRESS", deployment.AstraeaFund);
  updateEnvValue(envPath, "VITE_SEPOLIA_RPC_URL", process.env.SEPOLIA_RPC_URL || "");
  updateEnvValue(envPath, "VITE_ZAMA_RELAYER_URL", getRelayerUrl());
  updateEnvValue(envPath, "VITE_ENABLE_DEMO_ASSIST", "false");
  updateEnvValue(envPath, "VITE_SHOW_INTERNAL_GUIDES", "false");
  updateEnvValue(envPath, "VITE_ENABLE_ISSUER_CONTROLS", "false");

  writeFileSync(resolve(frontendDir, "public/ABI.json"), require("node:fs").readFileSync(resolve(__dirname, "../../frontend-handoff/ABI.json")));

  console.log(
    JSON.stringify(
      {
        frontendEnv: envPath,
        AstraeaFund: deployment.AstraeaFund,
        chainId: 11155111,
        relayerUrl: getRelayerUrl()
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
