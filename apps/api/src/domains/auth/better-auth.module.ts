import { apiEnv } from "@api/env/server";
import type { DynamicModule } from "@nestjs/common";
import { AuthModule as NestBetterAuthModule } from "@thallesp/nestjs-better-auth";
import { betterAuth as createBetterAuth } from "better-auth";
import { Kysely, PostgresDialect } from "kysely";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: apiEnv.DATABASE_URL,
  ssl: apiEnv.DATABASE_SSL_ENABLED ? { rejectUnauthorized: false } : undefined,
});
const database = new Kysely<Record<string, never>>({ dialect: new PostgresDialect({ pool }) });

export const betterAuth = createBetterAuth({
  database: { db: database, type: "postgres" },
  secret: apiEnv.BETTER_AUTH_SECRET,
  baseURL: apiEnv.BETTER_AUTH_BASE_URL,
  basePath: "/api/auth",
  trustedOrigins: [apiEnv.WEB_URL],
  socialProviders: { google: { clientId: apiEnv.GOOGLE_CLIENT_ID, clientSecret: apiEnv.GOOGLE_CLIENT_SECRET } },
  // Domain users already use UUID primary keys; sharing the ID makes the
  // session-to-domain authorization bridge explicit and lookup-safe.
  advanced: {
    useSecureCookies: apiEnv.NODE_ENV === "production",
    // Today web and API are different sites in production. This is required
    // for browser credentialed requests from WEB_URL to carry the session.
    defaultCookieAttributes: { sameSite: apiEnv.NODE_ENV === "production" ? "none" : "lax" },
    database: { generateId: "uuid" },
  },
  // The Nest integration attaches the domain provisioner to these hooks.
  databaseHooks: {},
});

/** Better Auth's Nest integration. Authorization remains a domain concern. */
export function createBetterAuthModule(): DynamicModule {
  return NestBetterAuthModule.forRoot({
    auth: betterAuth,
    // GraphQL keeps explicit domain-aware guards rather than accepting Better Auth users directly.
    disableGlobalAuthGuard: true,
    bodyParser: { json: { limit: "2mb" }, urlencoded: { limit: "2mb", extended: true } },
  });
}
