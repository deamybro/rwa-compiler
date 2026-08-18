# RWA Compiler build checklist

## P0 product

- [ ] Verify official X Layer and xStocks interfaces; record exact endpoints and chain metadata.
- [ ] Implement versioned RWA Passport schema, canonical hashing, provenance, verification, and deterministic policy evaluation.
- [ ] Integrate resilient live xStocks public-data adapters with honest unavailable/stale states.
- [ ] Implement the AI extraction provider abstraction with strict validation and deterministic development fixtures.
- [ ] Build the Solidity registry, policy engine, guarded executor, deployment scripts, and comprehensive contract tests.
- [ ] Ship the live terminal, asset detail, compiler, demo, developer, and about experiences plus API routes.
- [ ] Demonstrate NORMAL → WATCH → PAUSE → UPDATED → NORMAL and guarded-action enforcement.

## Verification and release

- [ ] Run lint, typecheck, unit/API tests, contract tests, production build, and route smoke checks.
- [ ] Deploy and smoke-test X Layer testnet contracts when a funded key is available.
- [ ] Deploy minimal X Layer mainnet contracts only after testnet verification and gas confirmation.
- [ ] Publish the frontend and verify HTTPS, metadata, social preview, error handling, and no secret exposure.
- [ ] Finish README, architecture/security/deployment docs, demo script, submission payload, and X launch copy.
- [ ] Record only verified URLs, addresses, transaction hashes, and remaining user-owned submission fields.
