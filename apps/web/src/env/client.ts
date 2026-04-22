import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_GRAPHQL_URL: z.url().optional(),
  NEXT_PUBLIC_API_URL: z.url().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.url().optional(),
});

const validated = clientEnvSchema.parse(process.env);

export const {
  NEXT_PUBLIC_API_GRAPHQL_URL,
  NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SENTRY_DSN,
} = validated;
