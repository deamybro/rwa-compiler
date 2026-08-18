# Deployment

## Web

Set hosted runtime variables from `.env.example`, build with `npm run build`, and deploy through Sites. Verify `/api/health`, `/terminal`, `/asset/NVDAx`, `/compiler`, and `/demo` over HTTPS.

## Read-only chain and bytecode checks

These commands require no key and broadcast nothing:

```bash
npm run deploy:check:testnet
npm run deploy:check:mainnet
```

They compile the exact Solidity sources, report bytecode sizes and keccak256 fingerprints, query the RPC chain ID, and fail on a network mismatch.

## Recommended Windows release flow

Use the guarded PowerShell runner. It keeps the key out of command history, requires an exact network-specific confirmation, clears the key from the environment afterward, and records every receipt.

```powershell
.\scripts\release-deploy.ps1 -Network testnet
.\scripts\release-deploy.ps1 -Network mainnet
```

Mainnet is automatically blocked until `deployments/xlayer-testnet.json` reports `DEPLOYED_AND_SMOKE_TESTED`.

For each network, the runner:

1. verifies the official RPC chain ID and stable contract bytecode fingerprints;
2. deploys `RWARegistry`, `PolicyEngine`, and `GuardedExecutor`;
3. verifies receipts and non-empty runtime bytecode;
4. fetches the live production NVDAx Passport hash;
5. registers NVDAx and anchors ALLOW;
6. proves a guarded action succeeds;
7. anchors PAUSE and confirms the action reverts in simulation;
8. resumes ALLOW;
9. writes addresses, blocks, hashes, timestamps, and explorer URLs to `deployments/`.

It performs no token approval, swap, purchase, transfer, or volume-generating action.

## Direct Node commands

For a secure environment where `DEPLOYER_PRIVATE_KEY` is already injected outside the repository:

```bash
npm run deploy:testnet
npm run smoke:testnet
npm run deploy:mainnet
npm run smoke:mainnet
```

Never paste the key into chat, commit it, print it, or put it in a command that will be retained in shell history.

## Foundry alternative

```bash
forge test -vvv
forge script contracts/script/Deploy.s.sol:Deploy --rpc-url "$XLAYER_TESTNET_RPC_URL" --broadcast
```

Foundry deployments must still be recorded in the same deployment JSON schema and followed by the lifecycle smoke checks.

## Release verification

After testnet passes, deploy the same minimal protocol to mainnet. Then configure:

```text
NEXT_PUBLIC_REGISTRY_ADDRESS=<verified mainnet registry>
NEXT_PUBLIC_POLICY_ENGINE_ADDRESS=<verified mainnet policy engine>
NEXT_PUBLIC_GUARDED_EXECUTOR_ADDRESS=<verified mainnet executor>
```

Redeploy the web app and verify the live Passport page compares its canonical hash to the configured registry before claiming an onchain match.

Preserve all deployment receipts and use only the minimum safe transactions required to prove operation.
