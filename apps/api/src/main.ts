import "reflect-metadata";
import { SENTRY_DSN, PORT } from "./env/server";
import * as Sentry from "@sentry/node";
import { NestFactory } from "@nestjs/core";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";

Sentry.init({
  dsn: SENTRY_DSN,
  tracesSampleRate: 1.0,
});

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  app.enableCors();
  await app.listen(PORT, "0.0.0.0");
}

bootstrap();
