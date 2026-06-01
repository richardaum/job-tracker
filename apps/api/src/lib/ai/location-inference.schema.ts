import { z } from "zod";

export const locationInferenceSchema = z.object({ value: z.string().nullable() });

export const workRegionInferenceSchema = z.object({ value: z.string().nullable() });
