// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { RWARegistry } from "./RWARegistry.sol";

/// @title PolicyEngine
/// @notice Deterministic preflight evaluation over the latest anchored Passport state.
contract PolicyEngine {
    bytes32 public constant REASON_OK = keccak256("OK");
    bytes32 public constant REASON_ASSET_UNKNOWN = keccak256("ASSET_UNKNOWN");
    bytes32 public constant REASON_SOURCE_STALE = keccak256("SOURCE_STALE");
    bytes32 public constant REASON_MANUAL_EMERGENCY_PAUSE = keccak256("MANUAL_EMERGENCY_PAUSE");

    RWARegistry public immutable registry;

    constructor(RWARegistry registry_) {
        if (address(registry_) == address(0)) revert RWARegistry.InvalidAddress();
        registry = registry_;
    }

    function preflight(bytes32 assetId, bytes32 action)
        external
        view
        returns (
            bool allowed,
            RWARegistry.PolicyStatus status,
            bytes32 reasonCode,
            bytes32 passportHash
        )
    {
        action;
        if (registry.emergencyPaused()) {
            return (false, RWARegistry.PolicyStatus.PAUSE, REASON_MANUAL_EMERGENCY_PAUSE, bytes32(0));
        }
        if (!registry.isRegistered(assetId)) {
            return (false, RWARegistry.PolicyStatus.UNKNOWN, REASON_ASSET_UNKNOWN, bytes32(0));
        }

        RWARegistry.PassportState memory passport = registry.getPassport(assetId);
        if (passport.manifestHash == bytes32(0)) {
            return (false, RWARegistry.PolicyStatus.UNKNOWN, REASON_SOURCE_STALE, bytes32(0));
        }
        if (passport.validUntil < block.timestamp) {
            return (false, RWARegistry.PolicyStatus.PAUSE, REASON_SOURCE_STALE, passport.manifestHash);
        }

        bytes32 storedReason = registry.latestReasonCode(assetId);
        reasonCode = storedReason == bytes32(0) ? REASON_OK : storedReason;
        allowed = passport.status == RWARegistry.PolicyStatus.ALLOW
            || passport.status == RWARegistry.PolicyStatus.WATCH;
        return (allowed, passport.status, reasonCode, passport.manifestHash);
    }
}

