import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

async function main() {
  const root = resolve(__dirname, "../..");
  const artifactPath = resolve(__dirname, "../artifacts/contracts/AstraeaFund.sol/AstraeaFund.json");
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  const outDir = resolve(root, "frontend-handoff");
  const frontendPublicDir = resolve(root, "frontend/public");
  mkdirSync(outDir, { recursive: true });
  mkdirSync(frontendPublicDir, { recursive: true });

  const abiJson = `${JSON.stringify(artifact.abi, null, 2)}\n`;
  writeFileSync(resolve(outDir, "ABI.json"), abiJson);
  writeFileSync(resolve(frontendPublicDir, "ABI.json"), abiJson);

  const examplePath = resolve(outDir, "deployed-addresses.example.json");
  if (!existsSync(examplePath)) {
    writeFileSync(
      examplePath,
      `${JSON.stringify(
        {
          sepolia: {
            AstraeaFund: "0x0000000000000000000000000000000000000000",
            chainId: 11155111,
            fundName: "Astraea APAC Growth Note I",
            policyVersion: "v1",
            maxInvestorSubscription: "500000",
            maxFundExposure: "700000"
          },
          local: {
            AstraeaFund: "0x0000000000000000000000000000000000000000",
            chainId: 31337
          }
        },
        null,
        2
      )}\n`
    );
  }

  console.log(`Exported ABI to ${resolve(outDir, "ABI.json")} and ${resolve(frontendPublicDir, "ABI.json")}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
