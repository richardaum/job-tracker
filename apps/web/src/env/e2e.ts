import { z } from "zod";

const e2eEnvSchema = z.object({
  E2E_PORT: z.coerce.number().int().min(1).max(65535).default(3200),
  NEXT_PUBLIC_API_URL: z.url().optional(),
});

export const e2eEnv = e2eEnvSchema.parse({
  E2E_PORT: process.env.E2E_PORT,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
});
