# Policy engine

Policy is deterministic. An LLM never returns ALLOW, WATCH, or PAUSE.

Default thresholds:

- pause 900 seconds before multiplier activation;
- pause 900 seconds after activation;
- watch from 86,400 seconds before activation;
- price freshness 300 seconds;
- Passport freshness 300 seconds;
- proof-of-reserves freshness 86,400 seconds.

Hard pause conditions are evaluated before watch conditions. They include unknown/unverified deployment, trading halt, critical-source outage, source conflict, multiplier mismatch, stale reserves, corporate-action window, and manual emergency pause. WATCH includes upcoming corporate action, pending multiplier, and stale price. WATCH remains executable; PAUSE reverts.

