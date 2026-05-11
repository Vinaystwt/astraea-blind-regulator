import { expect } from "chai";
import * as hre from "hardhat";
import { decrypt8, decrypt64, decryptBool, deployContract, expectNoPrivateEventLeak, submitAmount } from "./helpers";

describe("AstraeaSmoke", function () {
  async function fixture() {
    const [issuer, investorA, investorB, regulator] = await hre.ethers.getSigners();
    const smoke = await deployContract("AstraeaSmoke", issuer, [regulator.address]);
    return { smoke, investorA, investorB, regulator };
  }

  it("compiles and deploys with a regulator", async function () {
    const { smoke, regulator } = await fixture();
    expect(await smoke.regulator()).to.equal(regulator.address);
  });

  it("stores encrypted approval and reason for approve path", async function () {
    const { smoke, investorA } = await fixture();
    await submitAmount(smoke, investorA, 400000n);

    const [approvedHandle, reasonHandle] = await smoke.connect(investorA).getMyResultHandles();

    expect(await decryptBool(approvedHandle, smoke, investorA)).to.equal(true);
    expect(await decrypt8(reasonHandle, smoke, investorA)).to.equal(1n);
  });

  it("stores encrypted rejection and reason for reject path", async function () {
    const { smoke, investorB } = await fixture();
    await submitAmount(smoke, investorB, 600000n);

    const [approvedHandle, reasonHandle] = await smoke.connect(investorB).getMyResultHandles();

    expect(await decryptBool(approvedHandle, smoke, investorB)).to.equal(false);
    expect(await decrypt8(reasonHandle, smoke, investorB)).to.equal(2n);
  });

  it("lets regulator decrypt encrypted aggregate counters", async function () {
    const { smoke, investorA, investorB, regulator } = await fixture();
    await submitAmount(smoke, investorA, 400000n);
    await submitAmount(smoke, investorB, 600000n);

    const [exposure, accepted, rejected] = await smoke.connect(regulator).getAggregateReportHandles();

    expect(await decrypt64(exposure, smoke, regulator)).to.equal(400000n);
    expect(await decrypt64(accepted, smoke, regulator)).to.equal(1n);
    expect(await decrypt64(rejected, smoke, regulator)).to.equal(1n);
  });

  it("emits no private value in public events", async function () {
    const { smoke, investorA } = await fixture();
    const receipt = await submitAmount(smoke, investorA, 400000n);
    expectNoPrivateEventLeak(receipt!, smoke.interface, [400000, 600000, "true", "false"]);
  });
});
