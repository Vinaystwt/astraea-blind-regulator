import { expect } from "chai";
import * as hre from "hardhat";
import { deployContract, expectNoPrivateEventLeak, parseContractEvents, submitAmount } from "./helpers";

describe("event privacy", function () {
  it("approved and rejected submissions emit identical public event names and schemas", async function () {
    const [issuer, investorA, investorB, regulator, , investorC] = await hre.ethers.getSigners();
    const fund = await deployContract("AstraeaFund", issuer, [
      "Astraea APAC Growth Note I",
      "v1",
      500000,
      700000,
      regulator.address
    ]);
    await fund.connect(issuer).openFund();

    const receiptA = await submitAmount(fund, investorA, 400000n);
    const receiptB = await submitAmount(fund, investorB, 600000n);
    const receiptC = await submitAmount(fund, investorC, 400000n);

    const parsedA = parseContractEvents(receiptA!, fund.interface);
    const parsedB = parseContractEvents(receiptB!, fund.interface);
    const parsedC = parseContractEvents(receiptC!, fund.interface);

    expect(parsedA.map((event) => event!.name)).to.deep.equal(parsedB.map((event) => event!.name));
    expect(parsedA.map((event) => event!.name)).to.deep.equal(parsedC.map((event) => event!.name));
    expect(parsedA.map((event) => event!.fragment.inputs.map((input) => `${input.type}:${input.indexed}`))).to.deep.equal(
      parsedB.map((event) => event!.fragment.inputs.map((input) => `${input.type}:${input.indexed}`))
    );
    expect(parsedA.map((event) => event!.fragment.inputs.map((input) => `${input.type}:${input.indexed}`))).to.deep.equal(
      parsedC.map((event) => event!.fragment.inputs.map((input) => `${input.type}:${input.indexed}`))
    );
    expectNoPrivateEventLeak(receiptA!, fund.interface, [400000, 600000, 1, 2, 3, "true", "false", "approved", "rejected"]);
    expectNoPrivateEventLeak(receiptB!, fund.interface, [400000, 600000, 1, 2, 3, "true", "false", "approved", "rejected"]);
    expectNoPrivateEventLeak(receiptC!, fund.interface, [400000, 600000, 1, 2, 3, "true", "false", "approved", "rejected"]);
  });
});
