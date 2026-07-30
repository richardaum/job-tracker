# AI Settings — Task List

## Tasks

| #   | Title                                                                                  | Status    | Complexity | Dependencies              |
| --- | -------------------------------------------------------------------------------------- | --------- | ---------- | ------------------------- |
| 01  | Add SETTINGS_ENCRYPTION_KEY and TRIAL_AI_CALL_LIMIT env vars                           | completed | low        | —                         |
| 02  | Migration — ai_enabled, openai_api_key_encrypted, trial_calls_used columns             | completed | low        | —                         |
| 03  | EncryptedColumnTransformer (AES-256-GCM) wired to UserSettingEntity                    | completed | medium     | task_01, task_02          |
| 04  | AiAccessService — gating and atomic trial quota resolution                             | pending   | high       | task_02, task_03          |
| 05  | OpenAIClient.getClientFor(key) — per-request client construction                       | completed | low        | —                         |
| 06  | Wire AiAccessService and getClientFor into AiBaseService.callAi()                      | pending   | medium     | task_04, task_05          |
| 07  | Thread userId into 5 AI services (chat, notes, match, draft-extraction, summary)       | completed | medium     | task_06                   |
| 08  | Thread userId into 4 AI services (company description, rewrite, restructure, location) | completed | medium     | task_06                   |
| 09  | GraphQL — extend UserSetting type and UpdateSettingsInput                              | completed | medium     | task_02                   |
| 10  | GraphQL — saveOpenAiKey and removeOpenAiKey mutations                                  | completed | medium     | task_03, task_04          |
| 11  | Frontend — GraphQL operations and codegen for AI settings                              | completed | low        | task_09, task_10          |
| 12  | SettingsTabPage — OpenAI key field and AI-enabled toggle                               | pending   | medium     | task_11                   |
| 13  | Apollo aiBlockedLink and AiBlockedDialog                                               | pending   | medium     | task_04, task_10, task_11 |
| 14  | Sidebar trial quota trackbar                                                           | completed | low        | task_11                   |
