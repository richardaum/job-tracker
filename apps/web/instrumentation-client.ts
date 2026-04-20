import * as Sentry from "@sentry/nextjs";
import { NEXT_PUBLIC_SENTRY_DSN } from "./src/env/client";

Sentry.init({
  dsn: NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
});

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
