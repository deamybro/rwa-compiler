# Deployment

## Web

Set hosted runtime variables from `.env.example`, build with `npm run build`, and deploy through Sites. Verify `/api/health`, `/terminal`, `/asset/NVDAx`, `/compiler`, and `/demo` over HTTPS.

## X Layer testnet

```bash
forge test -vvv
forge script contracts/script/Deploy.s.sol:Deploy --rpc-url "$XLAYER_TESTNET_RPC_URL" --broadcast
```

Record every receipt, block, explorer link, deployer address, timestamp, and git commit in `deployments/xlayer-testnet.json`. Register assets and publish a short-lived Passport, then call preflight and the guarded executor in ALLOW and PAUSE states.

## Mainnet

Proceed only after testnet smoke tests pass. Use the same minimal deployment script with `XLAYER_MAINNET_RPC_URL`, record receipts in `deployments/xlayer-mainnet.json`, and avoid unrelated transfers or trading.

Never print or commit the deployer key.

