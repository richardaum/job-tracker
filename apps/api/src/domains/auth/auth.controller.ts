import { randomUUID } from "node:crypto";

import { assertAuthMutation } from "@api/domains/auth/auth-mutation.util";
import { getSafeReturnTo } from "@api/domains/auth/auth-return-to.util";
import { AuthUserAccessService } from "@api/domains/auth/auth-user-access.service";
import { GoogleAuthGuard } from "@api/domains/auth/google-auth.guard";
import type { User } from "@api/domains/users/users.schema";
import { UserService } from "@api/domains/users/users.service";
import { apiEnv } from "@api/env/server";
import { tryRun } from "@job-tracker/try-run";
import { Controller, Get, HttpCode, Logger, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { Throttle, ThrottlerGuard } from "@nestjs/throttler";
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
const cookieBaseDev = { httpOnly: true, sameSite: "lax" as const, secure: false, domain: "localhost", path: "/" };
/** Long-lived refresh cookie scoped to `/auth/*` so SSE/other paths do not send it on every reconnect. */
const REFRESH_COOKIE_PATH = "/auth";
const DEFAULT_AFTER_LOGIN_PATH = "/login";

// TODO(infra): ThrottlerGuard/@Throttle below are temporary until WAF rules on /auth/*.
// Suggested edge limits: google/callback 5/min, refresh 10/min, logout 20/min per IP.
@Controller("auth")
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly devAuthBypassService: DevAuthBypassService,
    private readonly userService: UserService,
    private readonly authUserAccessService: AuthUserAccessService,
  ) {}

  @Get("google")
  @UseGuards(ThrottlerGuard, GoogleAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  googleLogin(@Req() req: Request & { user?: Pick<User, "id" | "tokenVersion"> }, @Res() res: Response): void {
    if (!this.devAuthBypassService.isEnabled() || !req.user) {
      return;
    }

    void this.finishLogin(req.user, req.query.returnTo, req, res);
  }

  @Get("google/callback")
  @UseGuards(ThrottlerGuard, GoogleAuthGuard)
  @Throttle({ default: { ttl: 60_000, limit: 5 } })
  googleCallback(@Req() req: Request & { user: Pick<User, "id" | "tokenVersion"> }, @Res() res: Response): void {
    void this.finishLogin(req.user, req.query.state, req, res);
  }

  @Post("logout")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  @HttpCode(200)
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    assertAuthMutation(req);

    await this.revokeSessionFromCookies(req);

    const cookies = this.devAuthBypassService.isEnabled() ? cookieBaseDev : cookieBase;

    res.clearCookie("access_token", { ...cookies, path: "/" });
    res.clearCookie("refresh_token", { ...cookies, path: "/" });
    res.clearCookie("refresh_token", { ...cookies, path: REFRESH_COOKIE_PATH });
    res.json({ ok: true });
  }

  @Post("refresh")
  @UseGuards(ThrottlerGuard)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res() res: Response): Promise<void> {
    assertAuthMutation(req);

    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      this.logger.warn("refresh denied reason=no_refresh_cookie");
      throw new UnauthorizedException();
    }

    const [verifyErr, payload] = tryRun(() => this.authService.verifyRefreshToken(refreshToken));
    if (verifyErr || !payload) {
      this.logger.warn(
        `refresh denied reason=verify_failed err=${verifyErr instanceof Error ? `${verifyErr.name}: ${verifyErr.message}` : String(verifyErr)}`,
      );
      throw new UnauthorizedException();
    }

    await this.authUserAccessService.assertAuthenticatedUser(payload.userId, payload.tokenVersion);

    const freshUser = await this.userService.findById(payload.userId);
    if (!freshUser?.active) {
      throw new UnauthorizedException();
    }

    const isLegacyToken = payload.jti === undefined;
    const jtiMatches = payload.jti !== undefined && freshUser.refreshJti === payload.jti;
    const isLegacyMigration = isLegacyToken && freshUser.refreshJti === null;

    if (!jtiMatches && !isLegacyMigration) {
      this.logger.warn(`refresh denied userId=${payload.userId} reason=jti_reuse_detected`);
      await this.userService.incrementTokenVersion(payload.userId);
      throw new UnauthorizedException();
    }

    const newJti = randomUUID();
    await this.userService.setRefreshJti(payload.userId, newJti);
    await this.userService.incrementTokenVersion(payload.userId);
    const rotatedUser = await this.userService.findById(payload.userId);
    if (!rotatedUser?.active) {
      throw new UnauthorizedException();
    }

    const accessToken = this.authService.generateAccessToken({ id: rotatedUser.id }, rotatedUser.tokenVersion);
    const newRefreshToken = this.authService.generateRefreshToken(
      { id: rotatedUser.id },
      rotatedUser.tokenVersion,
      newJti,
    );

    const cookies = this.devAuthBypassService.isEnabled() ? cookieBaseDev : cookieBase;

    res.cookie("access_token", accessToken, { ...cookies, maxAge: 15 * 60 * 1000 });
    res.cookie("refresh_token", newRefreshToken, {
      ...cookies,
      path: REFRESH_COOKIE_PATH,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    this.logger.log(`refresh succeeded userId=${rotatedUser.id}`);
    res.json({ ok: true });
  }

  private async finishLogin(
    user: Pick<User, "id" | "tokenVersion">,
    returnToQueryValue: Request["query"][string],
    req: Request,
    res: Response,
  ): Promise<void> {
    const jti = randomUUID();
    await this.userService.setRefreshJti(user.id, jti);

    const accessToken = this.authService.generateAccessToken(user, user.tokenVersion);
    const refreshToken = this.authService.generateRefreshToken(user, user.tokenVersion, jti);

    const cookies = this.devAuthBypassService.isEnabled() ? cookieBaseDev : cookieBase;

    res.cookie("access_token", accessToken, { ...cookies, maxAge: 15 * 60 * 1000 });
    res.cookie("refresh_token", refreshToken, {
      ...cookies,
      path: REFRESH_COOKIE_PATH,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const returnTo = getSafeReturnTo(returnToQueryValue);
    const originHeader = req.headers.origin;
    const forwardedHostHeader = req.headers["x-forwarded-host"];
    const forwardedHost = Array.isArray(forwardedHostHeader) ? forwardedHostHeader[0] : forwardedHostHeader;
    const forwardedProto = req.headers["x-forwarded-proto"];
    const protocol = Array.isArray(forwardedProto) ? forwardedProto[0] : (forwardedProto ?? req.protocol);
    const runtimeWebUrl =
      (originHeader && originHeader.trim()) || (forwardedHost ? `${protocol}://${forwardedHost}` : apiEnv.WEB_URL);
    const redirectUrl = new URL(DEFAULT_AFTER_LOGIN_PATH, runtimeWebUrl);

    if (returnTo) {
      redirectUrl.searchParams.set("returnTo", returnTo);
    }

    res.redirect(302, redirectUrl.toString());
  }

  private async revokeSessionFromCookies(req: Request): Promise<void> {
    const refreshToken = req.cookies?.refresh_token;
    if (refreshToken) {
      const [verifyErr, payload] = tryRun(() => this.authService.verifyRefreshToken(refreshToken));
      if (!verifyErr && payload) {
        const [revokeErr] = await tryRun(this.userService.incrementTokenVersion(payload.userId));
        if (revokeErr) {
          this.logger.warn(
            `logout revoke failed userId=${payload.userId} err=${revokeErr instanceof Error ? `${revokeErr.name}: ${revokeErr.message}` : String(revokeErr)}`,
          );
        }
        return;
      }
      this.logger.warn(
        `logout revoke skipped reason=refresh_verify_failed err=${verifyErr instanceof Error ? `${verifyErr.name}: ${verifyErr.message}` : String(verifyErr)}`,
      );
    }

    const accessToken = req.cookies?.access_token;
    if (accessToken) {
      const [verifyErr, payload] = tryRun(() => this.authService.verifyAccessToken(accessToken));
      if (!verifyErr && payload) {
        const [revokeErr] = await tryRun(this.userService.incrementTokenVersion(payload.userId));
        if (revokeErr) {
          this.logger.warn(
            `logout revoke failed userId=${payload.userId} err=${revokeErr instanceof Error ? `${revokeErr.name}: ${revokeErr.message}` : String(revokeErr)}`,
          );
        }
        return;
      }
      this.logger.warn(
        `logout revoke skipped reason=access_verify_failed err=${verifyErr instanceof Error ? `${verifyErr.name}: ${verifyErr.message}` : String(verifyErr)}`,
      );
    }
  }
}
