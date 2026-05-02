import { Injectable, NestMiddleware } from "@nestjs/common";
import type { NextFunction, Request, Response } from "express";

import { GraphqlSseSetupService } from "./graphql-sse-setup.service";

/** Runs before Nest's global 404; must not call next() — graphql-sse ends the response. */
@Injectable()
export class GraphqlSseMiddleware implements NestMiddleware {
  constructor(private readonly graphqlSse: GraphqlSseSetupService) {}

  async use(req: Request, res: Response, next: NextFunction): Promise<void> {
    void next;
    await this.graphqlSse.handleSseRequest(req, res);
  }
}
