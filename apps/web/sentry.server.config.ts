import * as Sentry from "@sentry/nextjs";

import { NEXT_PUBLIC_SENTRY_DSN } from "./src/env/client";

Sentry.init({
  dsn: NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV !== "development",
  tracesSampleRate: 1.0,
});
