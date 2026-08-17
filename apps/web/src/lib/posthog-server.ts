import "server-only";

import { randomUUID } from "node:crypto";
import { cookies } from "next/headers";
import { PostHog } from "posthog-node";
import { tryRun } from "@job-tracker/try-run";

import { clientEnv } from "@/env/client";

let client: PostHog | undefined;

function getPostHogServerClient(): PostHog | undefined {
  if (!clientEnv.NEXT_PUBLIC_POSTHOG_KEY) return undefined;

  client ??= new PostHog(clientEnv.NEXT_PUBLIC_POSTHOG_KEY, {
    host: clientEnv.NEXT_PUBLIC_POSTHOG_HOST,
    flushAt: 1,
    flushInterval: 0,
  });
  return client;
}

/** Evaluates a flag server-side (RSC) so the first paint already reflects it — no client flicker. */
export async function getServerFeatureFlag(flagKey: string, distinctId: string): Promise<boolean> {
  const posthogClient = getPostHogServerClient();
  if (!posthogClient) return false;

  const [error, flags] = await tryRun(posthogClient.evaluateFlags(distinctId));
  if (error) return false;

  return flags.isEnabled(flagKey);
}

/**
 * Reads the distinct_id posthog-js persists in `ph_<key>_posthog` so server-side evaluation
 * buckets the same way the client will once it hydrates. Falls back to a fresh id when the
 * cookie isn't set yet (first visit) — the client's own anonymous id takes over from there.
 */
export async function getPostHogDistinctId(): Promise<string> {
  if (!clientEnv.NEXT_PUBLIC_POSTHOG_KEY) return randomUUID();

  const cookieStore = await cookies();
  const raw = cookieStore.get(`ph_${clientEnv.NEXT_PUBLIC_POSTHOG_KEY}_posthog`)?.value;
  const [error, parsed] = tryRun(() => {
    if (!raw) throw new Error("no posthog cookie");
    return JSON.parse(decodeURIComponent(raw)) as { distinct_id?: string };
  });

  return !error && parsed.distinct_id ? parsed.distinct_id : randomUUID();
}
