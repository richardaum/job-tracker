---
status: completed
title: EncryptedColumnTransformer (AES-256-GCM) wired to UserSettingEntity
type: api
complexity: medium
dependencies:
  - task_01
  - task_02
---

# Task 3: EncryptedColumnTransformer (AES-256-GCM) wired to UserSettingEntity

## Overview

Build the field-level encryption capability this feature introduces — nothing like it exists in the codebase yet. A TypeORM `ValueTransformer` encrypts `openaiApiKeyEncrypted` on write and decrypts on read, using the master key from `SETTINGS_ENCRYPTION_KEY`, so the raw OpenAI key is never persisted in plaintext.

<critical>
- ALWAYS READ the PRD and TechSpec before starting
- REFERENCE TECHSPEC for implementation details — do not duplicate here
- FOCUS ON "WHAT" — describe what needs to be accomplished, not how
- MINIMIZE CODE — show code only to illustrate current structure or problem areas
- TESTS REQUIRED — every task MUST include tests in deliverables
</critical>

<requirements>
- MUST implement a TypeORM `ValueTransformer` (`to`/`from`) performing AES-256-GCM encryption using Node's native `crypto` module — no new npm dependency.
- MUST derive the encryption key from `apiEnv.SETTINGS_ENCRYPTION_KEY` (added in task_01).
- MUST use a random IV per encryption operation (never reuse an IV with the same key) and store the IV alongside the ciphertext and auth tag so `from()` can decrypt.
- MUST throw a clear error on decryption if the auth tag does not match (tampered or corrupted ciphertext), rather than silently returning garbage.
- MUST return `null`/pass through unchanged when the input value is `null` (unset key case) in both `to()` and `from()`.
- MUST wire the transformer onto `UserSettingEntity.openaiApiKeyEncrypted` (added in task_02) via the `transformer` option on `@Column`.
- MUST NOT log the plaintext key or the master key anywhere, including in error messages or stack traces.
</requirements>

## Subtasks

- [x] 3.1 Implement `EncryptedColumnTransformer` with `to()`/`from()` using AES-256-GCM
- [x] 3.2 Wire the transformer onto `UserSettingEntity.openaiApiKeyEncrypted`
- [x] 3.3 Handle the `null` pass-through case in both directions
- [x] 3.4 Write unit tests covering round-trip correctness and tamper detection

## Implementation Details

See TechSpec "Core Interfaces" section for the `EncryptedColumnTransformer` shape (IV + auth tag + ciphertext packed and base64-encoded). Place the transformer in a new file under `apps/api/src/lib/crypto/` (new directory — no existing crypto utility to extend, per TechSpec "Integration Points"/ADR-002 context).

### Relevant Files

- `apps/api/src/database/entities/user-setting.entity.ts` — apply the transformer to `openaiApiKeyEncrypted` (column added in task_02)
- `apps/api/src/env/server.ts` — source of `SETTINGS_ENCRYPTION_KEY` (added in task_01)

### Dependent Files

- `apps/api/src/lib/ai/ai-access.service.ts` — task_04 will use this transformer indirectly by reading/writing the entity field; no direct code dependency beyond the entity

### Related ADRs

- [ADR-002: Server-Side Encrypted Storage of Per-User OpenAI Key](../adrs/adr-002.md) — the encryption approach this task implements, including why AES-256-GCM with an env-var master key was chosen over localStorage or a managed KMS

## Deliverables

- New `EncryptedColumnTransformer` in `apps/api/src/lib/crypto/`
- `UserSettingEntity.openaiApiKeyEncrypted` wired to the transformer
- Unit tests with 80%+ coverage **(REQUIRED)**
- Integration tests for entity save/load round-trip **(REQUIRED)**

## Tests

- Unit tests:
  - [x] Encrypting then decrypting the same plaintext returns the original value
  - [x] Encrypting the same plaintext twice produces different ciphertext (random IV)
  - [x] Decrypting a tampered ciphertext (flipped byte) throws instead of returning corrupted data
  - [x] `to(null)` and `from(null)` both return `null`
- Integration tests:
  - [x] Saving a `UserSettingEntity` with a plaintext key via the repository persists ciphertext in the database column (verified via a raw query), and reloading the entity returns the original plaintext
- Test coverage target: >=80% ✅ (29/29 tests passing)
- All tests must pass ✅ (490/490 in full suite)

## Success Criteria

- All tests passing
- Test coverage >=80%
- No plaintext OpenAI key ever appears in the database or in logs during tests
- Transformer is reusable (no `UserSettingEntity`-specific logic baked into it) for potential future encrypted columns
