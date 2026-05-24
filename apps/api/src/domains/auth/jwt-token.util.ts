import type { JwtSecretPair } from "@api/env/jwt-secrets";
import { tryRun } from "@job-tracker/try-run";
import * as jwt from "jsonwebtoken";

type JwtPayloadWithSubject = jwt.JwtPayload & {
  sub: string;
  tv?: number;
  jti?: string;
};

function getSecretsForKid(kid: unknown, secrets: JwtSecretPair): string[] {
  if (kid === "previous") {
    return secrets.previous ? [secrets.previous] : [];
  }

  const ordered = [secrets.current];
  if (secrets.previous) {
    ordered.push(secrets.previous);
  }
  return ordered;
}

export function signJwt(
  payload: { sub: string; tv: number; jti?: string },
  secrets: JwtSecretPair,
  expiresIn: string,
): string {
  return jwt.sign(payload, secrets.current, {
    expiresIn: expiresIn as jwt.SignOptions["expiresIn"],
    header: { kid: "current", alg: "HS256" },
  });
}

export function verifyJwt(
  token: string,
  secrets: JwtSecretPair,
): JwtPayloadWithSubject {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === "string") {
    throw new jwt.JsonWebTokenError("invalid token");
  }

  const secretsToTry = getSecretsForKid(decoded.header.kid, secrets);
  let lastError: unknown;

  for (const secret of secretsToTry) {
    const [error, payload] = tryRun(
      () => jwt.verify(token, secret) as JwtPayloadWithSubject,
    );
    if (!error) {
      return payload;
    }
    lastError = error;
  }

  throw lastError ?? new jwt.JsonWebTokenError("invalid token");
}

export function resolveJwtVerificationSecret(
  token: string,
  secrets: JwtSecretPair,
): string {
  const decoded = jwt.decode(token, { complete: true });
  if (!decoded || typeof decoded === "string") {
    throw new jwt.JsonWebTokenError("invalid token");
  }

  const secretsToTry = getSecretsForKid(decoded.header.kid, secrets);
  let lastError: unknown;

  for (const secret of secretsToTry) {
    const [error] = tryRun(() => jwt.verify(token, secret));
    if (!error) {
      return secret;
    }
    lastError = error;
  }

  throw lastError ?? new jwt.JsonWebTokenError("invalid token");
}
