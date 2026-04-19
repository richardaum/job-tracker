import "server-only";
import { z } from "zod";

/** Extend with required server-only variables (auth secrets, API keys, etc.). */
const serverEnvSchema = z.object({});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

const validated = serverEnvSchema.parse(process.env);
export const serverEnv = validated;
