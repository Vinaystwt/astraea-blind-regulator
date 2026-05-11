import * as hre from "hardhat";
import { writeFileSync, mkdirSync } from "node:fs";
import { resolve } from "node:path";

async function encrypt64(contractAddress: string, userAddress: string, value: bigint) {
  const input = hre.fhevm.createEncryptedInput(contractAddress, userAddress);
  input.add64(value);
  const encrypted = await input.encrypt();
  return { handle: encrypted.handles[0], proof: encrypted.inputProof };
}

async function main() {
  await hre.fhevm.initializeCLIApi();
  const [issuer, investorA, investorB, regulator, , investorC] = await hre.ethers.getSigners();
  const factory = await hre.ethers.getContractFactory("AstraeaFund", issuer);
  const fund = await factory.deploy("Astraea APAC Growth Note I", "v1", 500000, 700000, regulator.address);
  await fund.waitForDeployment();
  const address = await fund.getAddress();
  await hre.fhevm.assertCoprocessorInitialized(fund, "AstraeaFund");

  const openTx = await fund.connect(issuer).openFund();
  await openTx.wait();

  const encryptedA = await encrypt64(address, investorA.address, 400000n);
  const submitATx = await fund.connect(investorA).submit(encryptedA.handle, encryptedA.proof);
  await submitATx.wait();

  const encryptedB = await encrypt64(address, investorB.address, 600000n);
  const submitBTx = await fund.connect(investorB).submit(encryptedB.handle, encryptedB.proof);
  await submitBTx.wait();

  const encryptedC = await encrypt64(address, investorC.address, 400000n);
  const submitCTx = await fund.connect(investorC).submit(encryptedC.handle, encryptedC.proof);
  await submitCTx.wait();

  const output = {
    network: hre.network.name,
    AstraeaFund: address,
    maxInvestorSubscription: "500000",
    maxFundExposure: "700000",
    openTx: openTx.hash,
    investorA: { address: investorA.address, amount: "400000", submitTx: submitATx.hash, expectedPrivateResult: "APPROVED" },
    investorB: {
      address: investorB.address,
      amount: "600000",
      submitTx: submitBTx.hash,
      expectedPrivateResult: "REJECTED_PER_INVESTOR_CAP"
    },
    investorC: {
      address: investorC.address,
      amount: "400000",
      submitTx: submitCTx.hash,
      expectedPrivateResult: "REJECTED_FUND_CAPACITY"
    },
    regulator: regulator.address,
    decryptHints: {
      investor: "Call getMyResultHandles() as the investor, then userDecrypt ebool/euint8 handles.",
      regulator: "Call getAggregateReportHandles() as regulator, then userDecrypt euint64 handles."
    }
  };

  const outDir = resolve(__dirname, "../../frontend-handoff");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "seed-local-output.json"), `${JSON.stringify(output, null, 2)}\n`);
  console.log(JSON.stringify(output, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
