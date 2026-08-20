import { describe, expect, it } from "vitest";

import { resolveJwtVerificationSecret, signJwt, verifyJwt } from "./jwt-token.util";

const secrets = { current: "current-secret", previous: "previous-secret" };

describe("JWT token utilities", () => {
  it("signs and verifies tokens with the current key", () => {
    const token = signJwt({ sub: "user-1", tv: 3, jti: "token-1" }, secrets, "1h");

    expect(verifyJwt(token, secrets)).toMatchObject({ sub: "user-1", tv: 3, jti: "token-1" });
    expect(resolveJwtVerificationSecret(token, secrets)).toBe(secrets.current);
  });

  it("accepts a token signed by the previous key during rotation", () => {
    const token = signJwt({ sub: "user-1", tv: 3 }, { current: secrets.previous }, "1h");

    expect(verifyJwt(token, secrets)).toMatchObject({ sub: "user-1" });
    expect(resolveJwtVerificationSecret(token, secrets)).toBe(secrets.previous);
  });

  it("rejects malformed and unverifiable tokens", () => {
    expect(() => verifyJwt("not-a-jwt", secrets)).toThrow("invalid token");
    expect(() => resolveJwtVerificationSecret("not-a-jwt", secrets)).toThrow("invalid token");

    const token = signJwt({ sub: "user-1", tv: 3 }, { current: "unknown" }, "1h");
    expect(() => verifyJwt(token, secrets)).toThrow();
    expect(() => resolveJwtVerificationSecret(token, secrets)).toThrow();
  });

  it("does not try an absent previous key for a token that declares it", () => {
    const token = signJwt({ sub: "user-1", tv: 3 }, { current: secrets.previous }, "1h");
    expect(() => verifyJwt(token, { current: secrets.current })).toThrow();
  });
});
