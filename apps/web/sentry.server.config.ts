import { NEXT_PUBLIC_SENTRY_DSN } from "./src/env/client";

if (process.env.NODE_ENV !== "development") {
  import("@sentry/nextjs").then((Sentry) => {
    Sentry.init({
      dsn: NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: 1.0,
    });
  });
}
