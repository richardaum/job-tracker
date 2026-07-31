import { describe, it, expect, beforeEach } from "vitest";
import { ApolloLink, Observable, execute, gql } from "@apollo/client";
import { aiBlockedLink } from "./ai-blocked-link";
import { aiBlockedDialogState } from "./ai-blocked-dialog-state";

const OPERATION = gql`
  mutation Dummy {
    dummyField
  }
`;

function runWith(result: ApolloLink.Result): Promise<ApolloLink.Result> {
  const mockLink = new ApolloLink(
    () =>
      new Observable((observer) => {
        observer.next(result);
        observer.complete();
      }),
  );
  return new Promise((resolve, reject) => {
    execute(aiBlockedLink.concat(mockLink), { query: OPERATION }, { client: {} as never }).subscribe({
      next: resolve,
      error: reject,
    });
  });
}

describe("aiBlockedLink", () => {
  it("exports aiBlockedLink as an Apollo Link instance", () => {
    expect(aiBlockedLink).toBeInstanceOf(ApolloLink);
  });

  it("is properly chainable with other links", () => {
    const dummyLink = new ApolloLink((op, next) => next(op));
    const chainedLink = aiBlockedLink.concat(dummyLink);
    expect(chainedLink).toBeInstanceOf(ApolloLink);
  });

  describe("AI-blocked error handling", () => {
    beforeEach(() => {
      aiBlockedDialogState.closeDialog();
    });

    it("swallows the error and keeps partial data when the field is nullable", async () => {
      const result = await runWith({
        data: { dummyField: null },
        errors: [{ message: "blocked", extensions: { code: "AI_KEY_REQUIRED" } }] as never,
      });

      expect(result.errors).toEqual([]);
      expect(result.data).toEqual({ dummyField: null });
      expect(aiBlockedDialogState.getState()).toEqual({ open: true, reason: "AI_KEY_REQUIRED" });
    });

    it("keeps the error when data is null (non-nullable field wiped out by the error)", async () => {
      const result = await runWith({
        data: null,
        errors: [{ message: "blocked", extensions: { code: "AI_KEY_REQUIRED" } }] as never,
      });

      expect(result.data).toBeNull();
      expect(result.errors).toHaveLength(1);
      expect(aiBlockedDialogState.getState()).toEqual({ open: true, reason: "AI_KEY_REQUIRED" });
    });
  });
});
