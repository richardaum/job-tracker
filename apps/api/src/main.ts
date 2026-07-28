import "reflect-metadata";

import { setupFileLogger } from "@job-tracker/logger";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import passport from "passport";

import { AppModule } from "./app.module";
import { apiEnv } from "./env/server";

setupFileLogger({ filename: "api.log" });

Sentry.init({ dsn: apiEnv.SENTRY_DSN, tracesSampleRate: 1.0 });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  if (apiEnv.TRUST_PROXY_HOPS > 0) {
    app.set("trust proxy", apiEnv.TRUST_PROXY_HOPS);
  }
  app.use(cookieParser());
  app.use(passport.initialize());
  app.enableCors({ origin: apiEnv.CORS_ORIGINS ?? true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(apiEnv.PORT, "0.0.0.0");
}

bootstrap();
