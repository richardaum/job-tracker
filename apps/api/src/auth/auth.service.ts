import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from "../env/server";
import type { User } from "../users/users.schema";

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateAccessToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id },
      { secret: JWT_ACCESS_SECRET, expiresIn: "15m" },
    );
  }

  generateRefreshToken(user: User): string {
    return this.jwtService.sign(
      { sub: user.id },
      { secret: JWT_REFRESH_SECRET, expiresIn: "7d" },
    );
  }
}
