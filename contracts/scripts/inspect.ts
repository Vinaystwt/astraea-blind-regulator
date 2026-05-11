import * as hre from "hardhat";

async function main() {
  const address = process.env.ASTRAEA_FUND_ADDRESS;
  if (!address) throw new Error("ASTRAEA_FUND_ADDRESS is required");

  const fund = await hre.ethers.getContractAt("AstraeaFund", address);
  const summary = await fund.getPublicFundSummary();
  console.log(
    JSON.stringify(
      {
        issuer: summary[0],
        regulator: summary[1],
        fundName: summary[2],
        policyVersion: summary[3],
        maxInvestorSubscription: summary[4].toString(),
        maxFundExposure: summary[5].toString(),
        fundState: summary[6].toString(),
        investorCount: summary[7].toString(),
        unitLabel: summary[8]
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
