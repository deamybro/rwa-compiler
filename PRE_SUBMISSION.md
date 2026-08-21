# RWA Compiler pre-submission runbook

Verified against the official AI Season page and Google Form on August 18, 2026.

## Deadline and official links

- Deadline: **August 21, 2026 at 23:59 UTC** — August 22 at 00:59 WAT.
- Official event: https://web3.okx.com/xlayer/build-x-series
- Official form: https://docs.google.com/forms/d/e/1FAIpQLSfgU_3zcXdxK0GJQxj33QeUWdEcAaYnieVe9p5cFDb2JFQa4Q/viewform?usp=publish-editor
- Testnet faucet: https://web3.okx.com/xlayer/faucet

Submit several hours before the deadline. Do not wait for the final minute to discover an account, explorer, or Google Form issue.

## Hard eligibility gates

- [x] AI is materially integrated into the product design.
- [x] Public HTTPS application is live and verified.
- [x] Public GitHub repository is live and verified.
- [ ] Protocol contracts are deployed and smoke-tested on X Layer Testnet.
- [ ] The same minimal protocol is subsequently deployed and smoke-tested on X Layer Mainnet.
- [ ] Production hosting exposes the verified mainnet contract addresses.
- [ ] A dedicated RWA Compiler X account exists and is active.
- [ ] Its launch post mentions `@XLayerOfficial` and has a public URL.
- [ ] Email, Telegram, X handle, and X post URL are inserted into `SUBMISSION.md`.
- [ ] Every URL, address, transaction hash, and implementation claim is checked one final time.

Do not submit while any unchecked hard gate remains.

## Exact execution order

### 1. Create the dedicated X account

Use `submission-assets/x-avatar.png`, `submission-assets/x-header.png`, and the profile copy in `submission-assets/README.md`. Do not place account credentials in this repository.

### 2. Prepare the deployment wallet

Use a dedicated low-balance deployer. Obtain testnet OKB from the official faucet if the RPC requires gas. Ensure the same wallet can cover the minimal mainnet deployment and lifecycle transactions. Never paste its private key into chat, source files, shell history, or Git.

### 3. Deploy and prove testnet behavior

From PowerShell:

```powershell
.\scripts\release-deploy.ps1 -Network testnet
```

The script requires an exact typed confirmation and reads the private key as hidden input. It then:

1. verifies chain ID 1952 and deterministic bytecode fingerprints;
2. deploys `RWARegistry`, `PolicyEngine`, and `GuardedExecutor`;
3. verifies successful receipts and runtime bytecode;
4. fetches the live NVDAx Passport from production;
5. anchors its canonical hash;
6. proves ALLOW execution;
7. proves PAUSE blocks execution through simulation;
8. restores ALLOW;
9. records addresses, hashes, blocks, timestamps, and explorer links.

Review every entry in `deployments/xlayer-testnet.json` before continuing.

### 4. Deploy and prove mainnet behavior

The script refuses mainnet unless the recorded testnet status is `DEPLOYED_AND_SMOKE_TESTED`.

```powershell
.\scripts\release-deploy.ps1 -Network mainnet
```

Review `deployments/xlayer-mainnet.json` and confirm all three contracts have non-empty runtime bytecode through the explorer and RPC.

### 5. Update the public app

Set these hosted variables from the verified mainnet record and redeploy:

```text
NEXT_PUBLIC_REGISTRY_ADDRESS=<verified RWARegistry address>
NEXT_PUBLIC_POLICY_ENGINE_ADDRESS=<verified PolicyEngine address>
NEXT_PUBLIC_GUARDED_EXECUTOR_ADDRESS=<verified GuardedExecutor address>
```

Then verify `/api/health`, `/terminal`, `/asset/NVDAx`, `/compiler`, and `/demo`. The asset page must show a real onchain match only after the comparison is actually enabled and passes.

### 6. Record and publish the launch material

- Follow `DEMO_SCRIPT.md` for the 90–120 second walkthrough.
- Publish the prepared thread in `X_POST.md` from the dedicated account.
- Confirm the first post mentions `@XLayerOfficial`.
- Copy the public first-post URL into `SUBMISSION.md`.

### 7. Final form review and submission

The live form fields are:

1. Project Name — required
2. Project Description — required
3. Project URL — required
4. Github
5. Email — required
6. Telegram — required
7. X (Twitter) Handle — required
8. X (Twitter) Post URL

Use `SUBMISSION.md` as the sole copy/paste source. Open every link in a signed-out/private window before pressing Submit. Save the Google Form confirmation screen and timestamp.

## Integrity rules

- No fabricated contract addresses or transaction hashes.
- No claim that the AI provider is live until a provider key is configured and tested.
- No wash trading, manufactured volume, token purchases for appearance, or unrelated transactions.
- No submission until both required network deployments and the dedicated X post are verifiable.
