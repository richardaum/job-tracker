import cookieParser from "cookie-parser";
import type { Request, Response } from "express";

const parse = cookieParser();

/**
 * WS upgrade requests never pass through Express's `cookieParser()` middleware — that
 * middleware is registered on the HTTP pipeline, not the raw `upgrade` handshake — so
 * `req.cookies` is undefined for subscriptions and JwtStrategy's cookie extractor silently
 * falls through, rejecting every subscription with "No auth token".
 */
export function parseWsCookies(req: Request): void {
  if (req.cookies) return;
  parse(req, {} as Response, () => {});
}
