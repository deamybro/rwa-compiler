# AI and verification

The compiler sends untrusted document text inside explicit document boundaries. Its system message says to ignore document instructions, return only schema-conforming facts, and never decide execution policy.

The response is parsed as JSON and validated. Each claim is compared with the official asset and X Layer multiplier endpoints. Matching identity, type, and activation can be VERIFIED. A published official event that disagrees becomes CONFLICT; official data wins. A valid asset with no matching event is UNVERIFIED.

Without `AI_API_KEY`, a deterministic development extractor keeps the interface testable and is visibly labeled as not live AI.

