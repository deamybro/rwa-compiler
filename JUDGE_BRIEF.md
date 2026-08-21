# RWA Compiler judge brief

## One sentence

RWA Compiler is the AI-assisted, deterministic preflight layer that tells X Layer applications whether a tokenized real-world asset is safe to interact with right now.

## Why it matters

Token contracts expose balances and transfers, but operational meaning still lives across issuer documents, reserve attestations, market calendars, corporate-action schedules, APIs, and multiplier contracts. Agents need that context before execution, not after a failure or economic mismatch.

## What is technically novel

- AI converts hostile, unstructured notices into schema-bounded candidate claims; it never decides whether funds move.
- Official xStocks data and onchain state deterministically verify or reject those claims.
- A versioned RWA Passport canonically hashes identity, backing, reserves, price freshness, multiplier state, corporate actions, market state, policy, and provenance.
- X Layer contracts expose composable ALLOW / WATCH / PAUSE policy and a guarded executor that rejects unsafe actions.
- The demo proves the full lifecycle: NORMAL → WATCH → PAUSE → UPDATED → NORMAL.

## Judge verification path

1. Open the live Terminal and NVDAx Passport.
2. Inspect source timestamps, content hashes, reserve data, multiplier state, and X Layer deployment evidence.
3. Run the hostile synthetic notice through the AI Compiler and observe schema containment plus official-source verification.
4. Run the enforcement demo and attempt the guarded action during PAUSE.
5. Review the deployment JSON and explorer links for the onchain Passport hash and guarded-execution receipts.
6. Reproduce with the public repository tests and documented API.

## Honest scope

The MVP uses an authorized updater and does not claim a decentralized verifier network. It is infrastructure and informational tooling, not an investment adviser, trading bot, issuer, broker, or custody system.
