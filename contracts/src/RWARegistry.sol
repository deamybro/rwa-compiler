// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/// @title RWARegistry
/// @notice Compact, authorized anchor for offchain RWA Passport manifests.
contract RWARegistry {
    enum PolicyStatus {
        UNKNOWN,
        ALLOW,
        WATCH,
        PAUSE
    }

    struct PassportState {
        bytes32 manifestHash;
        PolicyStatus status;
        uint64 updatedAt;
        uint64 validUntil;
        uint64 version;
    }

    error Unauthorized();
    error InvalidAddress();
    error InvalidAssetId();
    error AssetAlreadyRegistered(bytes32 assetId);
    error AssetNotRegistered(bytes32 assetId);
    error InvalidManifestHash();
    error InvalidStatus();
    error InvalidValidityWindow();

    address public owner;
    bool public emergencyPaused;
    mapping(address updater => bool allowed) public isUpdater;
    mapping(bytes32 assetId => bool registered) public isRegistered;
    mapping(bytes32 assetId => PassportState state) private passports;
    mapping(bytes32 assetId => bytes32 reasonCode) public latestReasonCode;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event UpdaterSet(address indexed updater, bool allowed);
    event AssetRegistered(bytes32 indexed assetId);
    event PassportUpdated(
        bytes32 indexed assetId,
        bytes32 indexed manifestHash,
        PolicyStatus status,
        bytes32 reasonCode,
        uint64 validUntil,
        uint64 version
    );
    event PolicyStatusChanged(
        bytes32 indexed assetId,
        PolicyStatus previousStatus,
        PolicyStatus newStatus,
        bytes32 reasonCode
    );
    event EmergencyPauseChanged(bool paused);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    modifier onlyUpdater() {
        if (!isUpdater[msg.sender]) revert Unauthorized();
        _;
    }

    constructor(address initialOwner, address initialUpdater) {
        if (initialOwner == address(0) || initialUpdater == address(0)) revert InvalidAddress();
        owner = initialOwner;
        isUpdater[initialUpdater] = true;
        emit OwnershipTransferred(address(0), initialOwner);
        emit UpdaterSet(initialUpdater, true);
    }

    function transferOwnership(address newOwner) external onlyOwner {
        if (newOwner == address(0)) revert InvalidAddress();
        address previousOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(previousOwner, newOwner);
    }

    function setUpdater(address updater, bool allowed) external onlyOwner {
        if (updater == address(0)) revert InvalidAddress();
        isUpdater[updater] = allowed;
        emit UpdaterSet(updater, allowed);
    }

    function registerAsset(bytes32 assetId) external onlyOwner {
        if (assetId == bytes32(0)) revert InvalidAssetId();
        if (isRegistered[assetId]) revert AssetAlreadyRegistered(assetId);
        isRegistered[assetId] = true;
        emit AssetRegistered(assetId);
    }

    function updatePassport(
        bytes32 assetId,
        bytes32 manifestHash,
        PolicyStatus status,
        bytes32 reasonCode,
        uint64 validUntil
    ) external onlyUpdater {
        if (!isRegistered[assetId]) revert AssetNotRegistered(assetId);
        if (manifestHash == bytes32(0)) revert InvalidManifestHash();
        if (status == PolicyStatus.UNKNOWN) revert InvalidStatus();
        if (validUntil <= block.timestamp) revert InvalidValidityWindow();

        PassportState storage current = passports[assetId];
        PolicyStatus previousStatus = current.status;
        unchecked {
            current.version += 1;
        }
        current.manifestHash = manifestHash;
        current.status = status;
        current.updatedAt = uint64(block.timestamp);
        current.validUntil = validUntil;
        latestReasonCode[assetId] = reasonCode;

        emit PassportUpdated(assetId, manifestHash, status, reasonCode, validUntil, current.version);
        if (previousStatus != status) {
            emit PolicyStatusChanged(assetId, previousStatus, status, reasonCode);
        }
    }

    function setEmergencyPause(bool paused) external onlyOwner {
        emergencyPaused = paused;
        emit EmergencyPauseChanged(paused);
    }

    function getPassport(bytes32 assetId) external view returns (PassportState memory) {
        return passports[assetId];
    }
}

