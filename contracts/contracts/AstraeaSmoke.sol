// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, ebool, euint8, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract AstraeaSmoke is ZamaEthereumConfig {
    address public immutable regulator;
    uint64 public constant MAX_SUBSCRIPTION = 500000;

    euint64 private acceptedExposure;
    euint64 private acceptedCount;
    euint64 private rejectedCount;

    mapping(address => bool) private submitted;
    mapping(address => ebool) private investorApproved;
    mapping(address => euint8) private investorReasonCode;

    event SmokeSubmitted(address indexed investor, uint256 timestamp);
    event SmokeReceiptCreated(address indexed investor, uint256 timestamp);

    constructor(address regulator_) {
        require(regulator_ != address(0), "regulator required");
        regulator = regulator_;

        acceptedExposure = FHE.asEuint64(0);
        acceptedCount = FHE.asEuint64(0);
        rejectedCount = FHE.asEuint64(0);
        _allowAggregateHandles();
    }

    function submit(externalEuint64 encryptedAmount, bytes calldata inputProof) external {
        require(!submitted[msg.sender], "already submitted");
        submitted[msg.sender] = true;

        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        ebool approved = FHE.le(amount, MAX_SUBSCRIPTION);
        euint8 reason = FHE.select(approved, FHE.asEuint8(1), FHE.asEuint8(2));

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

        emit SmokeSubmitted(msg.sender, block.timestamp);
        emit SmokeReceiptCreated(msg.sender, block.timestamp);
    }

    function getMyResultHandles() external view returns (ebool approved, euint8 reasonCode) {
        require(submitted[msg.sender], "no submission");
        return (investorApproved[msg.sender], investorReasonCode[msg.sender]);
    }

    function getAggregateReportHandles() external view returns (euint64 exposure, euint64 accepted, euint64 rejected) {
        require(msg.sender == regulator, "regulator only");
        return (acceptedExposure, acceptedCount, rejectedCount);
    }

    function hasSubmitted(address investor) external view returns (bool) {
        return submitted[investor];
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
