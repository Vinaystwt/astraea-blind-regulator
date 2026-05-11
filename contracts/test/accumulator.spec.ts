import { expect } from "chai";
import * as hre from "hardhat";
import { decrypt64, deployContract, encrypt64, submitAmount } from "./helpers";

describe("Encrypted accumulator", function () {
  it("supports two sequential submissions and keeps handles decryptable after replacement", async function () {
    const [issuer, investorA, investorB, regulator] = await hre.ethers.getSigners();
    const fund = await deployContract("AstraeaFund", issuer, [
      "Astraea APAC Growth Note I",
      "v1",
      500000,
      700000,
      regulator.address
    ]);
    await fund.connect(issuer).openFund();

    await submitAmount(fund, investorA, 400000n);
    await submitAmount(fund, investorB, 250000n);

    const [exposure, accepted, rejected] = await fund.connect(regulator).getAggregateReportHandles();
    expect(await decrypt64(exposure, fund, regulator)).to.equal(650000n);
    expect(await decrypt64(accepted, fund, regulator)).to.equal(2n);
    expect(await decrypt64(rejected, fund, regulator)).to.equal(0n);
  });

  it("example counter re-grants ACL after every add so auditor decrypts latest handle", async function () {
    const [deployer, auditor] = await hre.ethers.getSigners();
    const counter = await deployContract("EncryptedCounter", deployer, [auditor.address]);
    const address = await counter.getAddress();

    const first = await encrypt64(address, deployer, 1n);
    await (await counter.increment(first.handle, first.proof)).wait();
    const second = await encrypt64(address, deployer, 2n);
    await (await counter.increment(second.handle, second.proof)).wait();

    const handle = await counter.getCountHandle();
    expect(await decrypt64(handle, counter, auditor)).to.equal(3n);
  });
});
