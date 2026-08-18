// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { RWARegistry } from "../src/RWARegistry.sol";
import { PolicyEngine } from "../src/PolicyEngine.sol";
import { GuardedExecutor } from "../src/GuardedExecutor.sol";

interface Vm {
    function prank(address sender) external;
    function warp(uint256 timestamp) external;
    function expectRevert(bytes calldata revertData) external;
    function recordLogs() external;
    function getRecordedLogs() external returns (Log[] memory entries);

    struct Log {
        bytes32[] topics;
        bytes data;
        address emitter;
    }
}

contract RWACompilerTest {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
    bytes32 internal constant ASSET = keccak256("NVDAx");
    bytes32 internal constant ACTION = keccak256("SWAP");
    bytes32 internal constant HASH = keccak256("passport-v1");
    bytes32 internal constant OK = keccak256("OK");
    address internal constant UPDATER = address(0xBEEF);
    address internal constant ATTACKER = address(0xBAD);

    RWARegistry internal registry;
    PolicyEngine internal engine;
    GuardedExecutor internal executor;

    function setUp() public {
        registry = new RWARegistry(address(this), UPDATER);
        engine = new PolicyEngine(registry);
        executor = new GuardedExecutor(engine);
        registry.registerAsset(ASSET);
    }

    function assertTrue(bool condition) internal pure {
        require(condition, "assertTrue failed");
    }

    function assertFalse(bool condition) internal pure {
        require(!condition, "assertFalse failed");
    }

    function assertEq(bytes32 left, bytes32 right) internal pure {
        require(left == right, "bytes32 mismatch");
    }

    function assertEq(uint256 left, uint256 right) internal pure {
        require(left == right, "uint mismatch");
    }

    function update(RWARegistry.PolicyStatus status, bytes32 reason, uint64 validUntil) internal {
        vm.prank(UPDATER);
        registry.updatePassport(ASSET, HASH, status, reason, validUntil);
    }

    function testRegistrationAndInitialState() public view {
        assertTrue(registry.isRegistered(ASSET));
        RWARegistry.PassportState memory passport = registry.getPassport(ASSET);
        assertEq(passport.version, 0);
    }

    function testUnauthorizedUpdateRejected() public {
        vm.prank(ATTACKER);
        vm.expectRevert(abi.encodeWithSelector(RWARegistry.Unauthorized.selector));
        registry.updatePassport(ASSET, HASH, RWARegistry.PolicyStatus.ALLOW, OK, uint64(block.timestamp + 1 hours));
    }

    function testAllowPreflightAndGuardedExecution() public {
        update(RWARegistry.PolicyStatus.ALLOW, OK, uint64(block.timestamp + 1 hours));
        (bool allowed, RWARegistry.PolicyStatus status, bytes32 reason, bytes32 passportHash) =
            engine.preflight(ASSET, ACTION);
        assertTrue(allowed);
        assertEq(uint256(status), uint256(RWARegistry.PolicyStatus.ALLOW));
        assertEq(reason, OK);
        assertEq(passportHash, HASH);
        executor.execute(ASSET, ACTION, keccak256("demo"));
    }

    function testWatchAllowsExecution() public {
        bytes32 upcoming = keccak256("CORPORATE_ACTION_UPCOMING");
        update(RWARegistry.PolicyStatus.WATCH, upcoming, uint64(block.timestamp + 1 hours));
        (bool allowed, RWARegistry.PolicyStatus status,,) = engine.preflight(ASSET, ACTION);
        assertTrue(allowed);
        assertEq(uint256(status), uint256(RWARegistry.PolicyStatus.WATCH));
        executor.execute(ASSET, ACTION, keccak256("watch-demo"));
    }

    function testPauseBlocksGuardedExecution() public {
        bytes32 window = keccak256("CORPORATE_ACTION_WINDOW");
        update(RWARegistry.PolicyStatus.PAUSE, window, uint64(block.timestamp + 1 hours));
        (bool allowed,, bytes32 reason,) = engine.preflight(ASSET, ACTION);
        assertFalse(allowed);
        assertEq(reason, window);
        vm.expectRevert(abi.encodeWithSelector(GuardedExecutor.RWAInteractionPaused.selector, ASSET, window));
        executor.execute(ASSET, ACTION, keccak256("blocked"));
    }

    function testExpiredPassportPauses() public {
        update(RWARegistry.PolicyStatus.ALLOW, OK, uint64(block.timestamp + 10));
        vm.warp(block.timestamp + 11);
        (bool allowed, RWARegistry.PolicyStatus status, bytes32 reason,) = engine.preflight(ASSET, ACTION);
        assertFalse(allowed);
        assertEq(uint256(status), uint256(RWARegistry.PolicyStatus.PAUSE));
        assertEq(reason, keccak256("SOURCE_STALE"));
    }

    function testEmergencyPause() public {
        update(RWARegistry.PolicyStatus.ALLOW, OK, uint64(block.timestamp + 1 hours));
        registry.setEmergencyPause(true);
        (bool allowed, RWARegistry.PolicyStatus status, bytes32 reason,) = engine.preflight(ASSET, ACTION);
        assertFalse(allowed);
        assertEq(uint256(status), uint256(RWARegistry.PolicyStatus.PAUSE));
        assertEq(reason, keccak256("MANUAL_EMERGENCY_PAUSE"));
    }

    function testUnknownAssetAndInvalidInputs() public {
        (bool allowed, RWARegistry.PolicyStatus status, bytes32 reason,) = engine.preflight(keccak256("NOPE"), ACTION);
        assertFalse(allowed);
        assertEq(uint256(status), uint256(RWARegistry.PolicyStatus.UNKNOWN));
        assertEq(reason, keccak256("ASSET_UNKNOWN"));

        vm.expectRevert(abi.encodeWithSelector(RWARegistry.InvalidAssetId.selector));
        registry.registerAsset(bytes32(0));
    }

    function testStatusTransitionAndEvents() public {
        vm.recordLogs();
        update(RWARegistry.PolicyStatus.ALLOW, OK, uint64(block.timestamp + 1 hours));
        update(RWARegistry.PolicyStatus.PAUSE, keccak256("CORPORATE_ACTION_WINDOW"), uint64(block.timestamp + 2 hours));
        Vm.Log[] memory entries = vm.getRecordedLogs();
        assertTrue(entries.length >= 4);
        RWARegistry.PassportState memory passport = registry.getPassport(ASSET);
        assertEq(passport.version, 2);
    }
}

