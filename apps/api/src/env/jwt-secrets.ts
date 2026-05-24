import { z } from "zod";

export type JwtSecretPair = { current: string; previous?: string };

const jwtSecretsJsonSchema = z.object({
  current: z.string().min(1),
  previous: z.string().min(1).optional(),
});

export function parseJwtSecretPair(
  jsonSecrets: string | undefined,
  singleSecret: string | undefined,
): JwtSecretPair {
  if (jsonSecrets !== undefined) {
    return jwtSecretsJsonSchema.parse(JSON.parse(jsonSecrets));
  }

  if (singleSecret !== undefined) {
    return { current: singleSecret };
  }

  throw new Error("JWT secret configuration is missing");
}
