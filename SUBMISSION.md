# Hackathon submission payload

> **Submission gate:** Do not submit until both X Layer deployment records say `DEPLOYED_AND_SMOKE_TESTED`, the public app exposes the verified mainnet addresses, and the dedicated X handle/post plus contact fields below are complete.
>
> Official form: https://docs.google.com/forms/d/e/1FAIpQLSfgU_3zcXdxK0GJQxj33QeUWdEcAaYnieVe9p5cFDb2JFQa4Q/viewform?usp=publish-editor
>
> Deadline: August 21, 2026 at 23:59 UTC (August 22 at 00:59 WAT).

## Project Name

RWA Compiler

## Short Description

RWA Compiler is the preflight safety layer for tokenized real-world assets and autonomous agents on X Layer. It uses AI to convert fragmented RWA information into structured Passports, verifies critical claims against authoritative data and onchain state, and exposes deterministic ALLOW / WATCH / PAUSE policies before execution.

## Project Description

Tokenized assets may live onchain, but the rules that define them remain spread across issuer documents, APIs, proof-of-reserve systems, market calendars, and corporate-action schedules. Knowing a token address and price is not enough for a wallet, protocol, or autonomous agent to know whether an RWA is operationally safe to interact with.

RWA Compiler creates machine-readable RWA Passports. Its AI Compiler interprets untrusted notices into strictly validated candidate claims. A deterministic verifier checks asset identity, X Layer deployment, multiplier state, reserves, market state, freshness, and conflicts against public xStocks data. Official structured data always wins. The Passport is canonically serialized, hashed with keccak256, and designed to be anchored to X Layer.

Applications receive ALLOW, WATCH, or PAUSE with an exact reason, validity window, Passport hash, and source provenance. The signature demo moves from NORMAL to WATCH to PAUSE, rejects a guarded action during the safety window, verifies the updated state, and automatically resumes execution.

AI interprets reality. Deterministic systems verify it. X Layer enforces the result.

## Required fields

Project Name: RWA Compiler

Project Description: Use the description above.

Project URL: https://rwa-compiler.meboebube48.chatgpt.site

Github: https://github.com/deamybro/rwa-compiler

Email: USER REQUIRED BEFORE SUBMISSION

Telegram: USER REQUIRED BEFORE SUBMISSION

X Handle: USER REQUIRED AFTER DEDICATED ACCOUNT CREATION

X Post URL: USER REQUIRED AFTER PUBLISHING

## Verified technical status

Frontend: PUBLIC AND VERIFIED — https://rwa-compiler.meboebube48.chatgpt.site

GitHub: PUBLIC AND VERIFIED — https://github.com/deamybro/rwa-compiler

X Layer data/RPC: VERIFIED — chain IDs 196/1952; NVDAx bytecode and multiplier read

X Layer Testnet RWA Compiler Contracts: NOT DEPLOYED — FUNDED DEPLOYER KEY REQUIRED

X Layer Mainnet RWA Compiler Contracts: NOT DEPLOYED — TESTNET VERIFICATION AND FUNDED KEY REQUIRED

AI provider: IMPLEMENTED; LIVE KEY MISSING; DEVELOPMENT FALLBACK LABELED

