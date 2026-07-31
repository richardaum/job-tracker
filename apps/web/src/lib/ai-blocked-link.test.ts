import { describe, it, expect } from "vitest";
import { ApolloLink } from "@apollo/client";
import { aiBlockedLink } from "./ai-blocked-link";

describe("aiBlockedLink", () => {
  it("exports aiBlockedLink as an Apollo Link instance", () => {
    expect(aiBlockedLink).toBeInstanceOf(ApolloLink);
  });

  it("is properly chainable with other links", () => {
    const dummyLink = new ApolloLink((op, next) => next(op));
    const chainedLink = aiBlockedLink.concat(dummyLink);
    expect(chainedLink).toBeInstanceOf(ApolloLink);
  });
});
