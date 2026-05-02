import { GraphqlSseAuthService } from "@api/domains/extension-channel/graphql-sse-auth.service";
import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from "@nestjs/common";
import { GraphQLSchemaHost } from "@nestjs/graphql";
import type { Request, Response } from "express";
import { execute, subscribe } from "graphql";
import { createHandler } from "graphql-sse/lib/use/express";

/** graphql-sse single-connection handshake; follow-up POST+json must stay off strict SSE Accept. */
const GRAPHQL_SSE_STREAM_TOKEN_HEADER = "x-graphql-event-stream-token";

/**
 * Outside `/graphql/…` so Apollo does not intercept SSE. Must stay aligned with
 * `getGraphqlSseUrl()` in `apps/extension` (default path `/stream`).
 */
export const GRAPHQL_SSE_PATH = "/stream";

/**
 * graphql-sse uses strict `accept === 'text/event-stream'`. Duplicate `Accept`
 * headers become `string[]` in Express; `graphql-sse` joins arrays with `\n`,
 * which also fails the strict check and yields 404 ("Stream not found").
 */
function normalizeSseAcceptHeader(req: Request): void {
  const v = req.headers.accept as string | string[] | undefined;
  if (v == null) {
    return;
  }
  const raw = Array.isArray(v) ? v.join(", ") : v;
  if (raw.length === 0) {
    return;
  }
  if (/\btext\/event-stream\b/i.test(raw)) {
    req.headers.accept = "text/event-stream";
  }
}

/**
 * graphql-sse uses strict Accept checks. Extensions / SW stacks may omit `Content-Type`, `Accept`,
 * or both; omitting POST JSON Content-Type skipped our older guard and kept Accept as wildcard → 404.
 * - GET on this mount: always coerce to sse (distinct or single-connection open).
 * - POST: coerce only without stream token header (distinct handshake POST). Single-connection
 * follow-up POSTs carry GRAPHQL_SSE_STREAM_TOKEN_HEADER and must keep Accept application/json-compatible.
 */
function ensureGraphqlSseCompatibleAccept(req: Request): void {
  const rawTok = req.headers[GRAPHQL_SSE_STREAM_TOKEN_HEADER] as
    | string
    | string[]
    | undefined;
  const hasStreamRegistrationToken =
    typeof rawTok === "string"
      ? rawTok.trim().length > 0
      : Array.isArray(rawTok) &&
        rawTok.some((h) => String(h).trim().length > 0);

  if (req.method === "GET") {
    req.headers.accept = "text/event-stream";
    return;
  }
  if (req.method === "POST" && !hasStreamRegistrationToken) {
    req.headers.accept = "text/event-stream";
  }
}

@Injectable()
export class GraphqlSseSetupService implements OnApplicationBootstrap {
  private readonly logger = new Logger(GraphqlSseSetupService.name);
  private expressHandler: ReturnType<typeof createHandler> | null = null;

  constructor(
    private readonly schemaHost: GraphQLSchemaHost,
    private readonly graphqlSseAuth: GraphqlSseAuthService,
  ) {}

  private getOrCreateHandler(): ReturnType<typeof createHandler> | null {
    const schema = this.schemaHost.schema;
    if (!schema) {
      return null;
    }
    if (this.expressHandler == null) {
      this.expressHandler = createHandler({
        schema,
        execute,
        subscribe,
        context: (req) => ({ req: req.raw as Request, res: req.context.res }),
      });
    }
    return this.expressHandler;
  }

  /**
   * Invoked by {@link GraphqlSseMiddleware} before Nest's global 404 layer.
   */
  async handleSseRequest(req: Request, res: Response): Promise<void> {
    const expressHandler = this.getOrCreateHandler();
    if (expressHandler == null) {
      this.logger.error("GraphQL schema is not ready; SSE rejected.");
      if (!res.headersSent) {
        res.status(503).json({ message: "GraphQL schema not ready" });
      }
      return;
    }

    try {
      await this.graphqlSseAuth.attachUser(req);
    } catch {
      res.status(401).json({ errors: [{ message: "Unauthorized" }] });
      return;
    }
    normalizeSseAcceptHeader(req);
    ensureGraphqlSseCompatibleAccept(req);

    try {
      await expressHandler(req, res);
    } catch (err) {
      this.logger.error(err);
      if (!res.headersSent) {
        res.status(500).end();
      }
    }
  }

  onApplicationBootstrap(): void {
    this.logger.log(
      `GraphQL over SSE via Nest middleware at ${GRAPHQL_SSE_PATH}`,
    );
  }
}
