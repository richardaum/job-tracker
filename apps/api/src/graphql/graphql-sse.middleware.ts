import { UserService } from "@api/domains/users/users.service";
import { to } from "@job-tracker/async";
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
  ) {}

  use(req: Request, res: Response, next: NextFunction): void {
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

          const [dbErr, dbUser] = await to(
            this.userService.findById(user.userId),
          );
          if (dbErr) {
            next(dbErr);
            return;
          }

          if (!dbUser || dbUser.role !== "user") {
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

          const [handlerErr] = await to(this.handler(req, res));
          if (handlerErr) {
            next(handlerErr);
          }
        })();
      },
    )(req, res, next);
  }
}
