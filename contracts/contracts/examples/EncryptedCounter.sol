// SPDX-License-Identifier: BSD-3-Clause-Clear
pragma solidity ^0.8.24;

import {FHE, euint64, externalEuint64} from "@fhevm/solidity/lib/FHE.sol";
import {ZamaEthereumConfig} from "@fhevm/solidity/config/ZamaConfig.sol";

contract EncryptedCounter is ZamaEthereumConfig {
    euint64 private count;
    address public immutable auditor;

    event CounterUpdated(address indexed caller, uint256 timestamp);

    constructor(address auditor_) {
        auditor = auditor_;
        count = FHE.asEuint64(0);
        _allowCount();
    }

    function increment(externalEuint64 encryptedValue, bytes calldata inputProof) external {
        euint64 value = FHE.fromExternal(encryptedValue, inputProof);
        count = FHE.add(count, value);
        _allowCount();
        emit CounterUpdated(msg.sender, block.timestamp);
    }

    function getCountHandle() external view returns (euint64) {
        return count;
    }

    function _allowCount() private {
        FHE.allowThis(count);
        FHE.allow(count, auditor);
    }
}
