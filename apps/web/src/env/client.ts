import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_API_GRAPHQL_URL: z.string().optional(),
  NEXT_PUBLIC_API_URL: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

const validated = clientEnvSchema.parse(process.env);

export const {
  NEXT_PUBLIC_API_GRAPHQL_URL,
  NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SENTRY_DSN,
} = validated;
