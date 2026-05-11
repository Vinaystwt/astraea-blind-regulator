// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, ebool, euint8, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract AstraeaFund is ZamaEthereumConfig {
    enum FundState {
        Created,
        Open,
        Closed
    }

    address public immutable issuer;
    address public immutable regulator;
    string public fundName;
    string public policyVersion;
    uint64 public immutable maxInvestorSubscription;
    uint64 public immutable maxFundExposure;
    string public constant unitLabel = "USDC simplified units";
    FundState public fundState;

    mapping(address => bool) public hasSubmitted;
    address[] private investorList;
    mapping(address => uint256) public submissionTimestamps;

    euint64 private encryptedMaxInvestorSubscription;
    euint64 private encryptedMaxFundExposure;
    euint64 private acceptedExposure;
    euint64 private acceptedCount;
    euint64 private rejectedCount;
    mapping(address => ebool) private investorApproved;
    mapping(address => euint8) private investorReasonCode;

    event FundCreated(
        string fundName,
        string policyVersion,
        uint64 maxInvestorSubscription,
        uint64 maxFundExposure,
        address regulator
    );
    event FundOpened();
    event InvestorSubmitted(address indexed investor, uint256 timestamp);
    event ComplianceReceiptCreated(address indexed investor, uint256 timestamp);
    event FundClosed();

    modifier onlyIssuer() {
        require(msg.sender == issuer, "issuer only");
        _;
    }

    constructor(
        string memory fundName_,
        string memory policyVersion_,
        uint64 maxInvestorSubscription_,
        uint64 maxFundExposure_,
        address regulator_
    ) {
        require(bytes(fundName_).length != 0, "fund name required");
        require(bytes(policyVersion_).length != 0, "policy version required");
        require(maxInvestorSubscription_ > 0, "max investor subscription required");
        require(maxFundExposure_ > 0, "max fund exposure required");
        require(regulator_ != address(0), "regulator required");

        issuer = msg.sender;
        regulator = regulator_;
        fundName = fundName_;
        policyVersion = policyVersion_;
        maxInvestorSubscription = maxInvestorSubscription_;
        maxFundExposure = maxFundExposure_;
        fundState = FundState.Created;

        encryptedMaxInvestorSubscription = FHE.asEuint64(maxInvestorSubscription_);
        encryptedMaxFundExposure = FHE.asEuint64(maxFundExposure_);
        acceptedExposure = FHE.asEuint64(0);
        acceptedCount = FHE.asEuint64(0);
        rejectedCount = FHE.asEuint64(0);
        FHE.allowThis(encryptedMaxInvestorSubscription);
        FHE.allowThis(encryptedMaxFundExposure);
        _allowAggregateHandles();

        emit FundCreated(fundName_, policyVersion_, maxInvestorSubscription_, maxFundExposure_, regulator_);
    }

    function openFund() external onlyIssuer {
        require(fundState == FundState.Created, "not created");
        fundState = FundState.Open;
        emit FundOpened();
    }

    function closeFund() external onlyIssuer {
        require(fundState == FundState.Open, "not open");
        fundState = FundState.Closed;
        emit FundClosed();
    }

    function submit(externalEuint64 encryptedAmount, bytes calldata inputProof) external {
        require(fundState == FundState.Open, "fund not open");
        require(!hasSubmitted[msg.sender], "already submitted");

        hasSubmitted[msg.sender] = true;
        investorList.push(msg.sender);
        submissionTimestamps[msg.sender] = block.timestamp;

        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        ebool withinInvestorLimit = FHE.le(amount, maxInvestorSubscription);
        euint64 postSubmissionExposure = FHE.add(acceptedExposure, amount);
        ebool withinFundCapacity = FHE.le(postSubmissionExposure, maxFundExposure);
        ebool approved = FHE.and(withinInvestorLimit, withinFundCapacity);
        euint8 capacityReason = FHE.select(withinFundCapacity, FHE.asEuint8(1), FHE.asEuint8(3));
        euint8 reason = FHE.select(withinInvestorLimit, capacityReason, FHE.asEuint8(2));

        acceptedExposure = FHE.add(acceptedExposure, FHE.select(approved, amount, FHE.asEuint64(0)));
        acceptedCount = FHE.add(acceptedCount, FHE.select(approved, FHE.asEuint64(1), FHE.asEuint64(0)));
        rejectedCount = FHE.add(rejectedCount, FHE.select(FHE.not(approved), FHE.asEuint64(1), FHE.asEuint64(0)));

        investorApproved[msg.sender] = approved;
        investorReasonCode[msg.sender] = reason;

        FHE.allowThis(investorApproved[msg.sender]);
        FHE.allow(investorApproved[msg.sender], msg.sender);
        FHE.allowThis(investorReasonCode[msg.sender]);
        FHE.allow(investorReasonCode[msg.sender], msg.sender);
        _allowAggregateHandles();

        emit InvestorSubmitted(msg.sender, block.timestamp);
        emit ComplianceReceiptCreated(msg.sender, block.timestamp);
    }

    function getMyResultHandles() external view returns (ebool approved, euint8 reasonCode) {
        require(hasSubmitted[msg.sender], "no submission");
        return (investorApproved[msg.sender], investorReasonCode[msg.sender]);
    }

    function getAggregateReportHandles() external view returns (euint64 exposure, euint64 accepted, euint64 rejected) {
        require(msg.sender == regulator, "regulator only");
        return (acceptedExposure, acceptedCount, rejectedCount);
    }

    function getInvestorCount() external view returns (uint256) {
        return investorList.length;
    }

    function getInvestorAt(uint256 index) external view returns (address) {
        return investorList[index];
    }

    function hasInvestorSubmitted(address investor) external view returns (bool) {
        return hasSubmitted[investor];
    }

    function getPublicFundSummary()
        external
        view
        returns (
            address issuer_,
            address regulator_,
            string memory fundName_,
            string memory policyVersion_,
            uint64 maxInvestorSubscription_,
            uint64 maxFundExposure_,
            FundState fundState_,
            uint256 investorCount_,
            string memory unitLabel_
        )
    {
        return (
            issuer,
            regulator,
            fundName,
            policyVersion,
            maxInvestorSubscription,
            maxFundExposure,
            fundState,
            investorList.length,
            unitLabel
        );
    }

    function getEncryptedPolicyLimitHandles() external view returns (euint64 investorLimit, euint64 fundLimit) {
        return (encryptedMaxInvestorSubscription, encryptedMaxFundExposure);
    }

    function _allowAggregateHandles() private {
        FHE.allowThis(acceptedExposure);
        FHE.allow(acceptedExposure, regulator);
        FHE.allowThis(acceptedCount);
        FHE.allow(acceptedCount, regulator);
        FHE.allowThis(rejectedCount);
        FHE.allow(rejectedCount, regulator);
    }
}
