import { z } from "zod";

const clientEnvSchema = z.object({
  NEXT_PUBLIC_SENTRY_DSN: z.string().optional(),
});

const validated = clientEnvSchema.parse(process.env);

export const { NEXT_PUBLIC_SENTRY_DSN } = validated;
