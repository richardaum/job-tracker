import "server-only";
import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.url().startsWith("postgresql://"),
});

const validated = serverEnvSchema.parse(process.env);

export const { DATABASE_URL } = validated;
