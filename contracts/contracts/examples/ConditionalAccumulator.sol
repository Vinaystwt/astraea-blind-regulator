// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract ConditionalAccumulator is ZamaEthereumConfig {
    uint64 public immutable cap;
    address public immutable auditor;
    euint64 private acceptedExposure;

    event Accumulated(address indexed caller, uint256 timestamp);

    constructor(uint64 cap_, address auditor_) {
        cap = cap_;
        auditor = auditor_;
        acceptedExposure = FHE.asEuint64(0);
        _allowExposure();
    }

    function addIfWithinCap(externalEuint64 encryptedAmount, bytes calldata inputProof) external {
        euint64 amount = FHE.fromExternal(encryptedAmount, inputProof);
        acceptedExposure = FHE.add(acceptedExposure, FHE.select(FHE.le(amount, cap), amount, FHE.asEuint64(0)));
        _allowExposure();
        emit Accumulated(msg.sender, block.timestamp);
    }

    function exposureHandle() external view returns (euint64) {
        return acceptedExposure;
    }

    function _allowExposure() private {
        FHE.allowThis(acceptedExposure);
        FHE.allow(acceptedExposure, auditor);
    }
}
