import { apiEnv } from "@api/env/server";
import { UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";

export const AUTH_ACTION_HEADER = "x-auth-action";
export const AUTH_ACTION_VALUE = "1";

export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.origin;
  if (!origin) {
    return apiEnv.NODE_ENV !== "production";
  }

  if (origin.startsWith("chrome-extension://")) return true;

  if (apiEnv.NODE_ENV !== "production") {
    if (origin.startsWith("http://localhost:")) return true;
  }

  return origin === new URL(apiEnv.WEB_URL).origin;
}

export function assertAuthMutation(req: Request): void {
  if (req.headers[AUTH_ACTION_HEADER] !== AUTH_ACTION_VALUE) {
    throw new UnauthorizedException();
  }
  if (!isSameOrigin(req)) {
    throw new UnauthorizedException();
  }
}
