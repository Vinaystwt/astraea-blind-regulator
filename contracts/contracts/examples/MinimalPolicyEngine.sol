// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, ebool, euint8, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract MinimalPolicyEngine is ZamaEthereumConfig {
    uint64 public immutable cap;
    mapping(address => ebool) private approved;
    mapping(address => euint8) private reason;

    event PolicyEvaluated(address indexed subject, uint256 timestamp);

    constructor(uint64 cap_) {
        cap = cap_;
    }

    function evaluate(externalEuint64 encryptedAmount, bytes calldata inputProof) external {
        ebool ok = FHE.le(FHE.fromExternal(encryptedAmount, inputProof), cap);
        approved[msg.sender] = ok;
        reason[msg.sender] = FHE.select(ok, FHE.asEuint8(1), FHE.asEuint8(2));
        FHE.allowThis(approved[msg.sender]);
        FHE.allow(approved[msg.sender], msg.sender);
        FHE.allowThis(reason[msg.sender]);
        FHE.allow(reason[msg.sender], msg.sender);
        emit PolicyEvaluated(msg.sender, block.timestamp);
    }

    function myHandles() external view returns (ebool, euint8) {
        return (approved[msg.sender], reason[msg.sender]);
    }
}
