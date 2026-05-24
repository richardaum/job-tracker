import { IpRateLimitService } from "@api/common/ip-rate-limit.service";
import { AuthUserAccessService } from "@api/domains/auth/auth-user-access.service";
import { DevAuthBypassService } from "@api/domains/auth/dev-auth-bypass.service";
import { RoleEnum } from "@api/domains/users/role.enum";
import { tryRun } from "@job-tracker/try-run";
import {
  HttpException,
  HttpStatus,
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from "@nestjs/common";
import { GraphQLSchemaHost } from "@nestjs/graphql";
import type { NextFunction, Request, Response } from "express";
import { createHandler } from "graphql-sse/lib/use/express";
import passport from "passport";

type JwtUser = { userId: string; tokenVersion: number };

// TODO(infra): Move to WAF path rule on /graphql-sse/stream (~30 req/min per IP).
const SSE_RATE_LIMIT = 30;
const SSE_RATE_TTL_MS = 60_000;

@Injectable()
export class GraphqlSseMiddleware implements NestMiddleware {
  private handler: ReturnType<typeof createHandler> | null = null;

  constructor(
    private readonly gqlSchemaHost: GraphQLSchemaHost,
    private readonly authUserAccessService: AuthUserAccessService,
    private readonly devAuthBypassService: DevAuthBypassService,
    private readonly ipRateLimitService: IpRateLimitService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const clientIp = req.ip ?? req.socket.remoteAddress ?? "unknown";
    // TODO(infra): Drop this block when edge rate limiting is configured.
    if (
      !this.ipRateLimitService.consume(
        `sse:${clientIp}`,
        SSE_RATE_LIMIT,
        SSE_RATE_TTL_MS,
      )
    ) {
      next(
        new HttpException("Too Many Requests", HttpStatus.TOO_MANY_REQUESTS),
      );
      return;
    }

    if (this.devAuthBypassService.isEnabled()) {
      void (async () => {
        const [err] = await tryRun(this.handleBypass(req, res, next));
        if (err) next(err);
      })();
      return;
    }

    passport.authenticate(
      "jwt",
      { session: false },
      (err: unknown, user: JwtUser | false | undefined) => {
        void (async () => {
          if (err || !user) {
            next(new UnauthorizedException());
            return;
          }
          const [handleErr] = await tryRun(
            this.handleWithUser(req, res, next, user),
          );
          if (handleErr) next(handleErr);
        })();
      },
    )(req, res, next);
  }

  private async handleBypass(
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<void> {
    const user = await this.devAuthBypassService.getBypassUser();
    await this.handleWithUser(req, res, next, {
      userId: user.id,
      tokenVersion: user.tokenVersion,
    });
  }

  private async handleWithUser(
    req: Request,
    res: Response,
    next: NextFunction,
    user: JwtUser,
  ): Promise<void> {
    await this.authUserAccessService.assertAuthenticatedUser(
      user.userId,
      user.tokenVersion,
      [RoleEnum.User],
    );

    (req as Request & { user: JwtUser }).user = user;

    if (!this.handler) {
      const schema = this.gqlSchemaHost.schema;
      if (!schema) {
        throw new Error("GraphQL schema not available");
      }

      this.handler = createHandler({
        schema,
        context: (gqlReq) => ({
          req: gqlReq.raw as Request & { user: JwtUser },
        }),
      });
    }

    const [handlerErr] = await tryRun(this.handler(req, res));
    if (handlerErr) {
      next(handlerErr);
    }
  }
}
