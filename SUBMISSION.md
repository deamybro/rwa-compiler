# Hackathon submission payload

## Project Name

RWA Compiler

## Short Description

RWA Compiler is the preflight safety layer for tokenized real-world assets and autonomous agents on X Layer. It uses AI to convert fragmented RWA information into structured Passports, verifies critical claims against authoritative data and onchain state, and exposes deterministic ALLOW / WATCH / PAUSE policies before execution.

## Project Description

Tokenized assets may live onchain, but the rules that define them still live across issuer documents, APIs, proof-of-reserve systems, market calendars, and corporate-action schedules. Knowing a token address and price is not enough for a wallet, protocol, or autonomous agent to know whether an RWA is operationally safe to interact with.

RWA Compiler creates machine-readable RWA Passports. Its AI Compiler interprets untrusted RWA notices into strictly validated candidate claims. A deterministic verifier checks asset identity, X Layer deployment, multiplier state, reserves, market state, freshness, and conflicts against public xStocks data. Official structured data always wins. The resulting Passport is canonically serialized, hashed with keccak256, and designed to be anchored to X Layer.

Applications call one preflight interface and receive ALLOW, WATCH, or PAUSE with an exact reason, validity window, Passport hash, and source provenance. The signature corporate-action demo moves from NORMAL to WATCH to PAUSE, rejects a guarded contract action during the safety window, verifies the updated multiplier state, and automatically resumes execution.

AI interprets reality. Deterministic systems verify it. X Layer enforces the result.

## Required form fields

Project Name: RWA Compiler

Project Description: Use the description above.

Project URL: USER REQUIRED AFTER PRODUCTION DEPLOYMENT

Github: USER REQUIRED AFTER REPOSITORY PUBLISHING

Email: USER REQUIRED BEFORE SUBMISSION

Telegram: USER REQUIRED BEFORE SUBMISSION

X Handle: USER REQUIRED AFTER DEDICATED ACCOUNT CREATION

X Post URL: USER REQUIRED AFTER PUBLISHING

## Verified deployment fields

X Layer Testnet: NOT DEPLOYED — FUNDED DEPLOYER KEY REQUIRED

X Layer Mainnet: NOT DEPLOYED — TESTNET VERIFICATION AND FUNDED KEY REQUIRED

Frontend: PRODUCTION BUILD VERIFIED; PUBLIC HOSTING PENDING

AI provider: IMPLEMENTED; LIVE KEY NOT PRESENT/VERIFIED

