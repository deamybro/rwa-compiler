// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import { RWARegistry } from "../src/RWARegistry.sol";
import { PolicyEngine } from "../src/PolicyEngine.sol";
import { GuardedExecutor } from "../src/GuardedExecutor.sol";

interface ScriptVm {
    function envUint(string calldata name) external returns (uint256 value);
    function addr(uint256 privateKey) external returns (address keyAddr);
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
}

contract Deploy {
    ScriptVm internal constant vm = ScriptVm(address(uint160(uint256(keccak256("hevm cheat code")))));

    function run() external returns (RWARegistry registry, PolicyEngine engine, GuardedExecutor executor) {
        uint256 privateKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(privateKey);
        vm.startBroadcast(privateKey);
        registry = new RWARegistry(deployer, deployer);
        engine = new PolicyEngine(registry);
        executor = new GuardedExecutor(engine);
        vm.stopBroadcast();
    }
}

