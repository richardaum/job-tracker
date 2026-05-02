import { AuthService } from "@api/domains/auth/auth.service";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import type { Request } from "express";

@Injectable()
export class GraphqlSseAuthService {
  constructor(private readonly authService: AuthService) {}

  /**
   * Validates session (JWT cookie) and sets `req.user` for GraphQL context.
   */
  async attachUser(req: Request): Promise<void> {
    const r = req as Request & { user?: { userId: string } };
    const token = r.cookies?.access_token;
    if (!token) {
      throw new UnauthorizedException();
    }

    try {
      const { userId } = this.authService.verifyAccessToken(token);
      r.user = { userId };
    } catch {
      throw new UnauthorizedException();
    }
  }
}
