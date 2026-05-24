import { tryRun } from "@job-tracker/try-run";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { staticPageMetadata } from "@/app/metadata";
import { getServerApiGraphqlUrl } from "@/lib/server-api-endpoints";
import { createServerSdk } from "@/lib/server-graphql";

const GRAPHQL_URL = getServerApiGraphqlUrl();

async function getJobMeta(id: string) {
  const [cookieErr, cookieStore] = await tryRun(cookies());
  if (cookieErr) {
    return null;
  }

  const sdk = createServerSdk(GRAPHQL_URL, cookieStore.toString());
  const [err, data] = await tryRun(sdk.Job({ id }));
  if (err) {
    return null;
  }

  return data.job ?? null;
}

function formatAppTitle(
  meta: {
    title?: string | null;
    company?: { name?: string | null } | null;
  } | null,
  fallback: string,
): string {
  if (!meta?.title) return fallback;
  if (meta.company?.name) return `${meta.title} @ ${meta.company.name}`;
  return meta.title;
}

export async function generateJobDetailMetadata(
  id: string,
  tabSuffix?: string,
): Promise<Metadata> {
  const meta = await getJobMeta(id);
  const base = formatAppTitle(meta, "Job details");
  const title = tabSuffix ? `${base} — ${tabSuffix}` : base;
  return staticPageMetadata(title);
}
