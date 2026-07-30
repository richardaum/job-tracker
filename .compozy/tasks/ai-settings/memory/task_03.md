# Task Memory: task_03.md

## Objective Snapshot

Implement AES-256-GCM field-level encryption transformer for UserSettingEntity.openaiApiKeyEncrypted column.

## Important Decisions

- Master key validation: .env.test needed a proper 32-byte base64-encoded key (not a plaintext string). Generated via `crypto.randomBytes(32).toString('base64')`.
- Tamper detection: Auth tag verification happens during decipher.final(), so flipping a bit in the ciphertext properly triggers auth tag mismatch.
- Pack format: IV (12 bytes) + auth tag (16 bytes) + ciphertext, stored as base64 to database.

## Learnings

- Node's crypto.createDecipheriv() validates auth tag automatically during final() if tag was set via setAuthTag() beforehand.
- TypeORM transformer instance is created fresh per entity use, which is safe for per-operation random IVs.

## Files / Surfaces

- Created: `/apps/api/src/lib/crypto/encrypted-column.transformer.ts` (65 lines, ValueTransformer impl)
- Created: `/apps/api/src/lib/crypto/encrypted-column.transformer.spec.ts` (161 lines, unit tests)
- Modified: `/apps/api/src/database/entities/user-setting.entity.ts` (added import + transformer to @Column)
- Modified: `/apps/api/src/database/entities/user-setting.entity.spec.ts` (added integration tests)
- Modified: `/apps/api/.env.test` (fixed SETTINGS_ENCRYPTION_KEY to proper 32-byte base64)

## Errors / Corrections

1. Initial test failure: Invalid key length. Root cause: SETTINGS_ENCRYPTION_KEY in .env.test was "test-encryption-key-32-bytes-long==" (plaintext), not base64-encoded 32 bytes. Fixed by generating proper key.
2. Tamper test failure: Expected throw on byte flip didn't happen. Root cause: flipped byte at position 50 might not have been in ciphertext. Fixed by flipping last byte of ciphertext (guaranteed to be in ciphertext region).

## Ready for Next Run

All 29 tests passing (17 transformer + 12 entity). Task is complete and ready for task_04 (AiAccessService implementation).
