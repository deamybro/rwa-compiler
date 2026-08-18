# RWA Compiler build checklist

## Completed

- [x] Verify official X Layer RPCs, chain IDs, explorers, hackathon requirements, and current xStocks v2 endpoints.
- [x] Implement versioned Passport schema, canonical hashing, provenance, verification, and deterministic policy.
- [x] Integrate resilient live xStocks Assets, Price, Multiplier, and Proof-of-Reserves adapters.
- [x] Implement OpenAI-compatible extraction with strict validation and honest no-key development mode.
- [x] Build RWARegistry, PolicyEngine, GuardedExecutor, deployment script, and comprehensive Foundry tests.
- [x] Ship home, terminal, asset, compiler, demo, developer, and about routes plus six API endpoints.
- [x] Demonstrate NORMAL → WATCH → PAUSE → UPDATED → NORMAL and guarded-action rejection.
- [x] Verify lint, types, unit tests, Solidity compilation, production build, routes, metadata, live APIs, X Layer RPCs, token bytecode, and multiplier read.
- [x] Publish and verify the public production app over HTTPS.
- [x] Finish README, architecture/security/deployment docs, fixtures, demo script, submission payload, CI, and X copy.

## External blockers

- [ ] Deploy RWA Compiler contracts to X Layer testnet: funded `DEPLOYER_PRIVATE_KEY` required.
- [ ] Smoke-test testnet contracts, then deploy minimal contracts to mainnet: same funded wallet and explicit gas availability required.
- [ ] Enable live AI extraction: `AI_API_KEY` required; app currently labels deterministic development extraction honestly.
- [ ] Publish GitHub repository and supply its URL.
- [ ] Create/authenticate dedicated X account and publish prepared thread.
- [ ] Supply email and Telegram, then submit the prepared hackathon payload.

