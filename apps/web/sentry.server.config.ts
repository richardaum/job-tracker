import * as Sentry from "@sentry/nextjs";

import { clientEnv } from "./src/env/client";

Sentry.init({
  dsn: clientEnv.NEXT_PUBLIC_SENTRY_DSN,
  enabled: process.env.NODE_ENV !== "development",
  tracesSampleRate: 1.0,
});
