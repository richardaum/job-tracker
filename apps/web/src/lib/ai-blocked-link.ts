import { ApolloLink, Observable } from "@apollo/client";
import { aiBlockedDialogState } from "./ai-blocked-dialog-state";

const AI_ERROR_CODES = { AI_DISABLED_BY_USER: "AI_DISABLED_BY_USER", AI_KEY_REQUIRED: "AI_KEY_REQUIRED" } as const;

interface FormattedError {
  message: string;
  extensions?: { code?: string };
}

/**
 * Apollo error link that intercepts AI-blocked errors and opens the dialog.
 * Inspects errors[].extensions.code for AI-specific error codes and intercepts them.
 * Non-AI errors pass through to normal error handling.
 * Must be placed early in the link chain to catch errors before other handlers.
 */
export const aiBlockedLink = new ApolloLink((operation, forward) => {
  return new Observable((observer) => {
    const subscription = forward(operation).subscribe({
      next: (result) => {
        if (result.errors && result.errors.length > 0) {
          const aiBlockedErrorIndex = (result.errors as FormattedError[]).findIndex((error) => {
            const code = error.extensions?.code || "";
            return code === AI_ERROR_CODES.AI_DISABLED_BY_USER || code === AI_ERROR_CODES.AI_KEY_REQUIRED;
          });

          if (aiBlockedErrorIndex >= 0) {
            const aiBlockedError = (result.errors as FormattedError[])[aiBlockedErrorIndex];
            const code = aiBlockedError.extensions?.code || "";

            if (code === AI_ERROR_CODES.AI_DISABLED_BY_USER) {
              aiBlockedDialogState.openDialog("AI_DISABLED_BY_USER");
            } else if (code === AI_ERROR_CODES.AI_KEY_REQUIRED) {
              aiBlockedDialogState.openDialog("AI_KEY_REQUIRED");
            }

            // A non-nullable field errors out to a null `data`, not a partial object — there's
            // nothing to salvage, so let the error propagate instead of faking a success with
            // no data (which breaks Apollo's cache write with "Missing field ... while writing
            // result {}").
            if (result.data != null) {
              // Filter out the AI-blocked error so it doesn't trigger other error handlers
              result.errors = (result.errors as FormattedError[]).filter((e) => {
                const errCode = e.extensions?.code || "";
                return !(errCode === AI_ERROR_CODES.AI_DISABLED_BY_USER || errCode === AI_ERROR_CODES.AI_KEY_REQUIRED);
              });

              // If all errors were AI-blocked errors, treat as success (no errors)
              if (result.errors.length === 0) {
                observer.next(result);
                observer.complete();
                return;
              }
            }
          }
        }

        observer.next(result);
      },
      error: observer.error.bind(observer),
      complete: observer.complete.bind(observer),
    });

    return subscription;
  });
});
