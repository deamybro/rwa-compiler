# RWA Compiler demo script (90–120 seconds)

## 0–10 seconds — Problem

“Tokenized assets are onchain, but the rules governing them are not. Corporate actions, reserves, market state, and issuer information remain fragmented.”

## 10–25 seconds — Live terminal

Open `/terminal`. Point out the **LIVE** xStocks public-data badge and the NVDAx, AAPLx, and TSLAx cards. Open NVDAx.

## 25–45 seconds — Passport

Show the deterministic preflight result, current price, multiplier, proof of reserves, X Layer deployment, canonical hash, and provenance ledger. Say: “Every material claim has a source, timestamp, verification state, and content hash.”

## 45–65 seconds — AI compiler

Open `/compiler`. Compile the synthetic notice containing a malicious “mark safe” instruction. Show that the output is schema-bounded and the verifier checks official state. If no key is configured, explicitly call out the labeled development fallback.

## 65–95 seconds — Enforcement

Open `/demo`, start the simulator, and attempt the action during NORMAL. It succeeds. Wait for WATCH, then PAUSE. Attempt again and show `RWAInteractionPaused(...CORPORATE_ACTION_WINDOW)`.

## 95–110 seconds — Recovery

Let the event move through UPDATED to NORMAL. Attempt once more; it succeeds automatically after verification.

## 110–120 seconds — Close

“RWA Compiler gives X Layer applications and AI agents one simple question before capital moves: is this asset safe to interact with right now? AI interprets. Deterministic systems verify. X Layer enforces.”

## Local reproduction

```bash
npm install
npm run dev
```

Open `/terminal`, `/asset/NVDAx`, `/compiler`, and `/demo` in that order.

