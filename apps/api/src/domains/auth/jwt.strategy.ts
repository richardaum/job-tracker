import { jwtAccessSecrets } from "@api/env/server";
import { tryRun } from "@job-tracker/try-run";
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import type { Request } from "express";
import { ExtractJwt, Strategy } from "passport-jwt";

import { resolveJwtVerificationSecret } from "./jwt-token.util";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => req.cookies?.access_token ?? null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKeyProvider: (
        _request: Request,
        rawJwtToken: string,
        done: (error: Error | null, secret?: string) => void,
      ) => {
        const [error, secret] = tryRun(() =>
          resolveJwtVerificationSecret(rawJwtToken, jwtAccessSecrets),
        );
        if (error) {
          done(error);
          return;
        }
        done(null, secret);
      },
    });
  }

  validate(payload: { sub: string; tv?: number }): {
    userId: string;
    tokenVersion: number;
  } {
    return { userId: payload.sub, tokenVersion: payload.tv ?? 0 };
  }
}
