import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { relative, resolve } from "node:path";
import solc from "solc";

const projectRoot = resolve(import.meta.dirname, "..");
const contractsRoot = resolve(projectRoot, "contracts");

function solidityFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = resolve(directory, entry.name);
    return entry.isDirectory() ? solidityFiles(fullPath) : entry.name.endsWith(".sol") ? [fullPath] : [];
  });
}

const sources = Object.fromEntries(solidityFiles(contractsRoot).map((file) => [
  relative(projectRoot, file).replaceAll("\\", "/"),
  { content: readFileSync(file, "utf8") },
]));

const input = {
  language: "Solidity",
  sources,
  settings: { optimizer: { enabled: true, runs: 10_000 }, outputSelection: { "*": { "*": ["abi", "evm.bytecode.object"] } } },
};

const output = JSON.parse(solc.compile(JSON.stringify(input)));
const failures = (output.errors ?? []).filter((item) => item.severity === "error");
if (failures.length) console.error(failures.map((item) => item.formattedMessage).join("\n"));
assert.equal(failures.length, 0, "Solidity compilation failed");
const compiled = Object.values(output.contracts ?? {}).reduce((count, group) => count + Object.keys(group).length, 0);
assert.ok(compiled >= 6, `Expected contracts and tests to compile; got ${compiled}`);
console.log(`Solidity ${solc.version()}: compiled ${compiled} contracts/interfaces successfully.`);

