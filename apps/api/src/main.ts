import "tsconfig-paths/register";
import "reflect-metadata";
import { SENTRY_DSN, PORT } from "./env/server";
import * as Sentry from "@sentry/node";
import { NestFactory } from "@nestjs/core";
import type { NestExpressApplication } from "@nestjs/platform-express";
import cookieParser from "cookie-parser";
import { AppModule } from "./app.module";
import { setupFileLogger } from "@job-tracker/logger";

setupFileLogger({ filename: "api.log" });

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
});

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: true,
    credentials: true,
  });
  await app.listen(PORT, "0.0.0.0");
}

bootstrap();
