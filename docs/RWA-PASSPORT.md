# RWA Passport

Schema version `1.0.0` covers asset identity, X Layer deployment, 1:1 backing, proof of reserves, price retrieval, multiplier, corporate action, market state, policy, provenance, compilation time, and validity.

Every provenance item records the field, observed value, source type/URI, retrieval time, verification state, and content hash. The UI answers “Why does RWA Compiler believe this?” with concise evidence, not hidden reasoning.

Hashing uses recursively key-sorted JSON with array order preserved, then `keccak256(UTF-8 canonical JSON)`. Undefined object properties are omitted; bigint values are serialized as decimal strings. The complete Passport is hashed before anchoring.

