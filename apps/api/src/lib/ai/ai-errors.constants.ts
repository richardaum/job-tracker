/**
 * GraphQL error extension codes for AI access gating.
 * Reusable across multiple tasks: task_04 (gating), task_10 (key validation), task_13 (error dialog).
 */
export const AI_ERROR_CODES = {
  /** User has disabled AI via the toggle in settings */
  AI_DISABLED_BY_USER: "AI_DISABLED_BY_USER",
  /** User's trial quota is exhausted and no personal key is set */
  AI_KEY_REQUIRED: "AI_KEY_REQUIRED",
  /** The provided OpenAI key failed validation (e.g., via GET /v1/models) */
  AI_KEY_INVALID: "AI_KEY_INVALID",
} as const;
