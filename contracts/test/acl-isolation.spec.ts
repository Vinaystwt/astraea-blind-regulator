import { expect } from "chai";
import * as hre from "hardhat";
import { decrypt64, decryptBool, deployContract, submitAmount } from "./helpers";

describe("ACL isolation", function () {
  it("prevents investors and random addresses from decrypting unauthorized handles", async function () {
    const [issuer, investorA, investorB, regulator, random] = await hre.ethers.getSigners();
    const fund = await deployContract("AstraeaFund", issuer, [
      "Astraea APAC Growth Note I",
      "v1",
      500000,
      700000,
      regulator.address
    ]);

    await fund.connect(issuer).openFund();
    await submitAmount(fund, investorA, 400000n);
    await submitAmount(fund, investorB, 600000n);

    const [aApproved] = await fund.connect(investorA).getMyResultHandles();
    const [bApproved] = await fund.connect(investorB).getMyResultHandles();
    const [exposure] = await fund.connect(regulator).getAggregateReportHandles();

    await expect(decryptBool(bApproved, fund, investorA)).to.be.rejected;
    await expect(decryptBool(aApproved, fund, random)).to.be.rejected;
    await expect(decrypt64(exposure, fund, random)).to.be.rejected;
    await expect(decryptBool(aApproved, fund, regulator)).to.be.rejected;
  });
});
