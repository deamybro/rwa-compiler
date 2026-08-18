# Architecture

RWA Compiler has three deliberately separate trust domains:

1. **Interpretation:** an OpenAI-compatible model extracts candidate facts from untrusted text.
2. **Verification:** deterministic adapters compare those facts with current structured xStocks and X Layer state.
3. **Enforcement:** a compact Passport hash and policy status are published by an authorized updater; contracts evaluate freshness and block guarded execution.

The web runtime is a Vinext/React application deployed as Cloudflare Worker-compatible ESM. External calls are centralized under `src/lib/adapters`, validated with Zod, timed out after eight seconds, cached briefly, and never replaced with production-looking fixtures.

The onchain surface is intentionally small. JSON remains offchain; `RWARegistry` stores only the manifest hash, status, timestamps, version, and reason code. `PolicyEngine` treats unknown and expired state as unsafe. `GuardedExecutor` emits a success event or reverts; it cannot make arbitrary external calls or hold funds.

