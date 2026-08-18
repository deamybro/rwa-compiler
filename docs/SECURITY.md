# Security

## Contracts

- Owner and updater are separate roles; both are initialized explicitly.
- Zero addresses, unknown assets, zero hashes, UNKNOWN updates, and expired validity are rejected.
- Versions increase monotonically; status changes and updates emit separate events.
- Emergency pause overrides every Passport.
- Expired Passport state fails closed.
- GuardedExecutor has no arbitrary-call or custody capability.

## Backend

- Compiler input is text only, capped at 20,000 characters; no user-supplied URL fetch exists.
- The AI system prompt treats source instructions as hostile data.
- Model JSON and all external API payloads are schema-validated.
- External requests use timeouts and short caches.
- Server secrets have no `NEXT_PUBLIC_` prefix.
- Production rate limiting should be configured at the hosting edge.

## Trust assumptions

The MVP updater can publish policy state. Users must trust its operational security and the correctness of authoritative sources. Decentralized publishing is roadmap only.

