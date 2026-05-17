import "tsconfig-paths/register";
import "reflect-metadata";

import { setupFileLogger } from "@job-tracker/logger";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import * as Sentry from "@sentry/node";
import cookieParser from "cookie-parser";
import passport from "passport";

import { AppModule } from "./app.module";
import { PORT, SENTRY_DSN } from "./env/server";

setupFileLogger({ filename: "api.log" });

Sentry.init({ dsn: SENTRY_DSN, tracesSampleRate: 1.0 });

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.use(passport.initialize());
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen(PORT, "0.0.0.0");
}

bootstrap();
