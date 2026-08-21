import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import solc from "solc";

const projectRoot = resolve(import.meta.dirname, "..", "..");

const contractFiles = ["RWARegistry.sol", "PolicyEngine.sol", "GuardedExecutor.sol"];

export function compileProtocolContracts() {
  const sources = Object.fromEntries(
    contractFiles.map((file) => [
      file,
      { content: readFileSync(resolve(projectRoot, "contracts", "src", file), "utf8") },
    ]),
  );

  const input = {
    language: "Solidity",
    sources,
    settings: {
      optimizer: { enabled: true, runs: 10_000 },
      outputSelection: { "*": { "*": ["abi", "evm.bytecode.object", "evm.deployedBytecode.object"] } },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input)));
  const failures = (output.errors ?? []).filter((item) => item.severity === "error");
  assert.equal(failures.length, 0, failures.map((item) => item.formattedMessage).join("\n"));

  return Object.fromEntries(
    contractFiles.map((file) => {
      const name = file.replace(/\.sol$/, "");
      const contract = output.contracts[file][name];
      return [
        name,
        {
          abi: contract.abi,
          bytecode: `0x${contract.evm.bytecode.object}`,
          deployedBytecode: `0x${contract.evm.deployedBytecode.object}`,
        },
      ];
    }),
  );
}
