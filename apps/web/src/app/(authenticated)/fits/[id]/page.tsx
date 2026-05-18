import { tryRun } from "@job-tracker/try-run";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { staticPageMetadata } from "@/app/metadata";
import { getServerApiGraphqlUrl } from "@/lib/server-api-endpoints";
import { createServerSdk } from "@/lib/server-graphql";

const GRAPHQL_URL = getServerApiGraphqlUrl();

async function getFitMeta(id: string) {
  const [cookieErr, cookieStore] = await tryRun(cookies());
  if (cookieErr) return null;

  const sdk = createServerSdk(GRAPHQL_URL, cookieStore.toString());
  const [err, data] = await tryRun(sdk.Fit({ id }));
  if (err) return null;

  return data.fit ?? null;
}

function formatTitle(
  fit: {
    application?: {
      title?: string | null;
      company?: { name?: string | null } | null;
    } | null;
    draftApplication?: { title?: string | null } | null;
  } | null,
): string | null {
  if (fit?.application?.title) {
    const company = fit.application.company?.name;
    return company
      ? `${fit.application.title} @ ${company}`
      : fit.application.title;
  }
  if (fit?.draftApplication?.title) {
    return fit.draftApplication.title;
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const fit = await getFitMeta(id);
  const base = formatTitle(fit);
  return staticPageMetadata(base ? `${base} — Fit Analysis` : "Fit Analysis");
}

export { default } from "@/modules/fit-analyses/details/page/FitAnalysisPage";
