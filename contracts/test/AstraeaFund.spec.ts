import { expect } from "chai";
import * as hre from "hardhat";
import { decrypt8, decrypt64, decryptBool, deployContract, expectNoPrivateEventLeak, submitAmount } from "./helpers";

describe("AstraeaFund", function () {
  async function fixture() {
    const [issuer, investorA, investorB, regulator, outsider, investorC] = await hre.ethers.getSigners();
    const fund = await deployContract("AstraeaFund", issuer, [
      "Astraea APAC Growth Note I",
      "v1",
      500000,
      700000,
      regulator.address
    ]);
    return { fund, issuer, investorA, investorB, regulator, outsider, investorC };
  }

  it("deploys with public metadata", async function () {
    const { fund, issuer, regulator } = await fixture();
    const summary = await fund.getPublicFundSummary();

    expect(summary[0]).to.equal(issuer.address);
    expect(summary[1]).to.equal(regulator.address);
    expect(summary[2]).to.equal("Astraea APAC Growth Note I");
    expect(summary[3]).to.equal("v1");
    expect(summary[4]).to.equal(500000n);
    expect(summary[5]).to.equal(700000n);
    expect(summary[6]).to.equal(0n);
    expect(summary[7]).to.equal(0n);
  });

  it("issuer opens and closes fund while non-issuer cannot", async function () {
    const { fund, issuer, outsider } = await fixture();

    await expect(fund.connect(outsider).openFund()).to.be.revertedWith("issuer only");
    await expect(fund.connect(issuer).openFund()).to.emit(fund, "FundOpened");
    await expect(fund.connect(outsider).closeFund()).to.be.revertedWith("issuer only");
    await expect(fund.connect(issuer).closeFund()).to.emit(fund, "FundClosed");
  });

  it("processes per-investor and fund-capacity policy with encrypted regulator report", async function () {
    const { fund, issuer, investorA, investorB, investorC, regulator } = await fixture();
    await fund.connect(issuer).openFund();

    const receiptA = await submitAmount(fund, investorA, 400000n);
    const receiptB = await submitAmount(fund, investorB, 600000n);
    const receiptC = await submitAmount(fund, investorC, 400000n);

    const [approvedA, reasonA] = await fund.connect(investorA).getMyResultHandles();
    const [approvedB, reasonB] = await fund.connect(investorB).getMyResultHandles();
    const [approvedC, reasonC] = await fund.connect(investorC).getMyResultHandles();
    const [exposure, accepted, rejected] = await fund.connect(regulator).getAggregateReportHandles();

    expect(await decryptBool(approvedA, fund, investorA)).to.equal(true);
    expect(await decrypt8(reasonA, fund, investorA)).to.equal(1n);
    expect(await decryptBool(approvedB, fund, investorB)).to.equal(false);
    expect(await decrypt8(reasonB, fund, investorB)).to.equal(2n);
    expect(await decryptBool(approvedC, fund, investorC)).to.equal(false);
    expect(await decrypt8(reasonC, fund, investorC)).to.equal(3n);
    expect(await decrypt64(exposure, fund, regulator)).to.equal(400000n);
    expect(await decrypt64(accepted, fund, regulator)).to.equal(1n);
    expect(await decrypt64(rejected, fund, regulator)).to.equal(2n);
    expect(await fund.getInvestorCount()).to.equal(3n);
    expect(await fund.getInvestorAt(0)).to.equal(investorA.address);
    expect(await fund.hasInvestorSubmitted(investorB.address)).to.equal(true);
    expectNoPrivateEventLeak(receiptA!, fund.interface, [400000, 600000, 1, 2, 3, "true", "false"]);
    expectNoPrivateEventLeak(receiptB!, fund.interface, [400000, 600000, 1, 2, 3, "true", "false"]);
    expectNoPrivateEventLeak(receiptC!, fund.interface, [400000, 600000, 1, 2, 3, "true", "false"]);
  });

  it("rejects duplicate submission", async function () {
    const { fund, issuer, investorA } = await fixture();
    await fund.connect(issuer).openFund();
    await submitAmount(fund, investorA, 400000n);
    await expect(submitAmount(fund, investorA, 400000n)).to.be.rejectedWith("already submitted");
  });
});
