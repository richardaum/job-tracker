import {
  Controller,
  Get,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import type { User } from "@api/domains/users/users.schema";
import { WEB_URL } from "@api/env/server";

const COOKIE_BASE = { httpOnly: true, sameSite: "lax" as const, path: "/" };

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get("google")
  @UseGuards(AuthGuard("google"))
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

    res.redirect(302, WEB_URL);
  }

  @Post("logout")
  @HttpCode(200)
  logout(@Res() res: Response): void {
    res.clearCookie("access_token", { path: "/" });
    res.clearCookie("refresh_token", { path: "/" });
    res.json({ ok: true });
  }
}
