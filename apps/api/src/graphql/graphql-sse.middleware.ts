import { DevAuthBypassService } from "@api/domains/auth/dev-auth-bypass.service";
import { RoleEnum } from "@api/domains/users/role.enum";
import { UserService } from "@api/domains/users/users.service";
import { tryRun } from "@job-tracker/try-run";
import { Injectable, NestMiddleware } from "@nestjs/common";
import { GraphQLSchemaHost } from "@nestjs/graphql";
import type { NextFunction, Request, Response } from "express";
import { createHandler } from "graphql-sse/lib/use/express";
import passport from "passport";

type JwtUser = { userId: string };

@Injectable()
export class GraphqlSseMiddleware implements NestMiddleware {
  private handler: ReturnType<typeof createHandler> | null = null;

  constructor(
    private readonly gqlSchemaHost: GraphQLSchemaHost,
    private readonly userService: UserService,
    private readonly devAuthBypassService: DevAuthBypassService,
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
    if (this.devAuthBypassService.isEnabled()) {
      void this.handleBypass(req, res, next);
      return;
    }

    passport.authenticate(
      "jwt",
      { session: false },
      (err: unknown, user: JwtUser | false | undefined) => {
        void (async () => {
          if (err || !user) {
            if (!res.headersSent) {
              res.status(401).json({ errors: [{ message: "Unauthorized" }] });
            }
            return;
          }
          await this.handleWithUser(req, res, next, user);
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
    await this.handleWithUser(req, res, next, { userId: user.id });
  }

  private async handleWithUser(
    req: Request,
    res: Response,
    next: NextFunction,
    user: JwtUser,
  ): Promise<void> {
    const [dbErr, dbUser] = await tryRun(
      this.userService.findById(user.userId),
    );
    if (dbErr) {
      next(dbErr);
      return;
    }

    if (!dbUser || dbUser.role !== RoleEnum.User) {
      if (!res.headersSent) {
        res.status(403).json({ errors: [{ message: "Forbidden" }] });
      }
      return;
    }

    (req as Request & { user: JwtUser }).user = user;

    if (!this.handler) {
      const schema = this.gqlSchemaHost.schema;
      if (!schema) {
        if (!res.headersSent) {
          res.status(503).end();
        }
        return;
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
