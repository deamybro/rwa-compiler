// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { RWARegistry } from "./RWARegistry.sol";
import { PolicyEngine } from "./PolicyEngine.sol";

/// @title GuardedExecutor
/// @notice Minimal non-custodial proof that Passport policy can stop execution.
contract GuardedExecutor {
    error RWAInteractionPaused(bytes32 assetId, bytes32 reasonCode);

    PolicyEngine public immutable policyEngine;

    event GuardedActionExecuted(
        bytes32 indexed assetId,
        bytes32 indexed action,
        address indexed caller,
        bytes32 payloadHash,
        bytes32 passportHash,
        RWARegistry.PolicyStatus status
    );

    constructor(PolicyEngine policyEngine_) {
        if (address(policyEngine_) == address(0)) revert RWARegistry.InvalidAddress();
        policyEngine = policyEngine_;
    }

    function execute(bytes32 assetId, bytes32 action, bytes32 payloadHash) external {
        (bool allowed, RWARegistry.PolicyStatus status, bytes32 reasonCode, bytes32 passportHash) =
            policyEngine.preflight(assetId, action);
        if (!allowed) revert RWAInteractionPaused(assetId, reasonCode);
        emit GuardedActionExecuted(assetId, action, msg.sender, payloadHash, passportHash, status);
    }
}

