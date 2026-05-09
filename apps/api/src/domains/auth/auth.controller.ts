import { getSafeReturnTo } from "@api/domains/auth/auth-return-to.util";
import { GoogleAuthGuard } from "@api/domains/auth/google-auth.guard";
import type { User } from "@api/domains/users/users.schema";
import { WEB_URL } from "@api/env/server";
import { tryRun } from "@job-tracker/try-run";
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
import type { Request, Response } from "express";

import { AuthService } from "./auth.service";
import { DevAuthBypassService } from "./dev-auth-bypass.service";

const cookieBase = {
  httpOnly: true,
  // Extension requests come from `chrome-extension://` and are cross-site.
  // `SameSite=None; Secure` is required so auth cookies are sent on GraphQL fetches.
  sameSite: "none" as const,
  secure: true,
  path: "/",
};
const DEFAULT_AFTER_LOGIN_PATH = "/login";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly devAuthBypassService: DevAuthBypassService,
  ) {}

  @Get("google")
  @UseGuards(GoogleAuthGuard)
  googleLogin(
    @Req() req: Request & { user?: Pick<User, "id"> },
    @Res() res: Response,
  ): void {
    if (!this.devAuthBypassService.isEnabled() || !req.user) {
      return;
    }

    this.finishLogin(req.user, req.query.returnTo, req, res);
  }

  @Get("google/callback")
  @UseGuards(GoogleAuthGuard)
  googleCallback(
    @Req() req: Request & { user: Pick<User, "id"> },
    @Res() res: Response,
  ): void {
    this.finishLogin(req.user, req.query.state, req, res);
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

    const [refreshErr] = tryRun(() => {
      const { userId } = this.authService.verifyRefreshToken(refreshToken);
      const accessToken = this.authService.generateAccessToken({ id: userId });

      res.cookie("access_token", accessToken, {
        ...cookieBase,
        maxAge: 15 * 60 * 1000,
      });
      res.json({ ok: true });
    });
    if (refreshErr) {
      throw new UnauthorizedException();
    }
  }

  private finishLogin(
    user: Pick<User, "id">,
    returnToQueryValue: Request["query"][string],
    req: Request,
    res: Response,
  ): void {
    const accessToken = this.authService.generateAccessToken(user);
    const refreshToken = this.authService.generateRefreshToken(user);

    res.cookie("access_token", accessToken, {
      ...cookieBase,
      maxAge: 15 * 60 * 1000,
    });
    res.cookie("refresh_token", refreshToken, {
      ...cookieBase,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const returnTo = getSafeReturnTo(returnToQueryValue);
    const originHeader = req.headers.origin;
    const forwardedHostHeader = req.headers["x-forwarded-host"];
    const forwardedHost = Array.isArray(forwardedHostHeader)
      ? forwardedHostHeader[0]
      : forwardedHostHeader;
    const host = forwardedHost ?? req.headers.host;
    const forwardedProto = req.headers["x-forwarded-proto"];
    const protocol = Array.isArray(forwardedProto)
      ? forwardedProto[0]
      : (forwardedProto ?? req.protocol);
    const runtimeWebUrl =
      (originHeader && originHeader.trim()) ||
      (host ? `${protocol}://${host}` : WEB_URL);
    const redirectUrl = new URL(DEFAULT_AFTER_LOGIN_PATH, runtimeWebUrl);

    if (returnTo) {
      redirectUrl.searchParams.set("returnTo", returnTo);
    }

    res.redirect(302, redirectUrl.toString());
  }
}
