import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import type { User } from "@api/domains/users/users.schema";
import { WEB_URL } from "@api/env/server";
import { GoogleAuthGuard } from "@api/domains/auth/google-auth.guard";
import { getSafeReturnTo } from "@api/domains/auth/auth-return-to.util";

const COOKIE_BASE = { httpOnly: true, sameSite: "lax" as const, path: "/" };
const DEFAULT_AFTER_LOGIN_PATH = "/login";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  googleLogin() {}

  @Get("google/callback")
  @UseGuards(AuthGuard("google"))
  googleCallback(
    @Req() req: Request & { user: User },
    @Res() res: Response,
  ): void {
    const accessToken = this.authService.generateAccessToken(req.user);
    const refreshToken = this.authService.generateRefreshToken(req.user);

    res.cookie("access_token", accessToken, {
      ...COOKIE_BASE,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", refreshToken, {
      ...COOKIE_BASE,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const returnTo = getSafeReturnTo(req.query.state);
    const redirectUrl = new URL(DEFAULT_AFTER_LOGIN_PATH, WEB_URL);

    if (returnTo) {
      redirectUrl.searchParams.set("returnTo", returnTo);
    }

    res.redirect(302, redirectUrl.toString());
  }

  @Post("logout")
  @HttpCode(200)
  logout(@Res() res: Response): void {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    res.json({ ok: true });
  }

  @Post("refresh")
  @HttpCode(200)
  refresh(@Req() req: Request, @Res() res: Response): void {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    try {
      const { userId } = this.authService.verifyRefreshToken(refreshToken);
      const accessToken = this.authService.generateAccessToken({ id: userId });

      res.cookie("access_token", accessToken, {
        ...COOKIE_BASE,
        maxAge: 15 * 60 * 1000,
      });
      res.json({ ok: true });
    } catch {
      throw new UnauthorizedException();
    }
  }
}
