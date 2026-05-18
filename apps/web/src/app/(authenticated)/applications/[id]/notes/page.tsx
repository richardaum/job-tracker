import { tryRun } from "@job-tracker/try-run";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { staticPageMetadata } from "@/app/metadata";
import { getServerApiGraphqlUrl } from "@/lib/server-api-endpoints";
import { createServerSdk } from "@/lib/server-graphql";

const GRAPHQL_URL = getServerApiGraphqlUrl();

async function getApplicationMeta(id: string) {
  const [cookieErr, cookieStore] = await tryRun(cookies());
  if (cookieErr) {
    return null;
  }

  const sdk = createServerSdk(GRAPHQL_URL, cookieStore.toString());
  const [err, data] = await tryRun(sdk.Application({ id }));
  if (err) {
    return null;
  }

  return data.application ?? null;
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const meta = await getApplicationMeta(id);
  const base = formatAppTitle(meta, "Application notes");

  return staticPageMetadata(`${base} — Notes`);
}

export { default } from "@/modules/applications/details/page/ApplicationNotesPage";
