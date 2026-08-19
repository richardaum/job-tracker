import type { User } from "@api/domains/users/users.schema";
import { jwtAccessSecrets, jwtRefreshSecrets } from "@api/env/server";
import { Injectable } from "@nestjs/common";

import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from "./auth-token.constants";
import { signJwt, verifyJwt } from "./jwt-token.util";

type JwtSubject = Pick<User, "id">;
type TokenPayload = { userId: string; tokenVersion: number; jti?: string };

@Injectable()
export class AuthService {
  generateAccessToken(user: JwtSubject, tokenVersion: number): string {
    return signJwt({ sub: user.id, tv: tokenVersion }, jwtAccessSecrets, ACCESS_TOKEN_TTL);
  }

  generateRefreshToken(user: JwtSubject, tokenVersion: number, jti: string): string {
    return signJwt({ sub: user.id, tv: tokenVersion, jti }, jwtRefreshSecrets, REFRESH_TOKEN_TTL);
  }

  verifyRefreshToken(token: string): TokenPayload {
    const payload = verifyJwt(token, jwtRefreshSecrets);
    return { userId: payload.sub, tokenVersion: payload.tv ?? 0, jti: payload.jti };
  }

  verifyAccessToken(token: string): TokenPayload {
    const payload = verifyJwt(token, jwtAccessSecrets);
    return { userId: payload.sub, tokenVersion: payload.tv ?? 0 };
  }
}
