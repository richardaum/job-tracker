import type { User } from "@api/domains/users/users.schema";
import { serverEnv } from "@api/env/server";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";

type JwtSubject = Pick<User, "id">;

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(user: JwtSubject): string {
    return this.jwtService.sign(
      { sub: user.id },
      { secret: serverEnv.JWT_ACCESS_SECRET, expiresIn: "15m" },
    );
  }

  generateRefreshToken(user: JwtSubject): string {
    return this.jwtService.sign(
      { sub: user.id },
      { secret: serverEnv.JWT_REFRESH_SECRET, expiresIn: "7d" },
    );
  }

  verifyRefreshToken(token: string): { userId: string } {
    const payload = this.jwtService.verify<{ sub: string }>(token, {
      secret: serverEnv.JWT_REFRESH_SECRET,
    });
    return { userId: payload.sub };
  }

  verifyAccessToken(token: string): { userId: string } {
    const payload = this.jwtService.verify<{ sub: string }>(token, {
      secret: serverEnv.JWT_ACCESS_SECRET,
    });
    return { userId: payload.sub };
  }
}
