import { tryRun } from "@job-tracker/try-run";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { staticPageMetadata } from "@/app/metadata";
import { getServerApiGraphqlUrl } from "@/lib/server-api-endpoints";
import { createServerSdk } from "@/lib/server-graphql";

const GRAPHQL_URL = getServerApiGraphqlUrl();

async function getMatchMeta(id: string) {
  const [cookieErr, cookieStore] = await tryRun(cookies());
  if (cookieErr) return null;

  const sdk = createServerSdk(GRAPHQL_URL, cookieStore.toString());
  const [err, data] = await tryRun(sdk.Match({ id }));
  if (err) return null;

  return data.match ?? null;
}

function formatTitle(
  matchAnalysis: {
    job?: {
      title?: string | null;
      company?: { name?: string | null } | null;
    } | null;
    draftJob?: { title?: string | null } | null;
  } | null,
): string | null {
  if (matchAnalysis?.job?.title) {
    const company = matchAnalysis.job.company?.name;
    return company
      ? `${matchAnalysis.job.title} @ ${company}`
      : matchAnalysis.job.title;
  }
  if (matchAnalysis?.draftJob?.title) {
    return matchAnalysis.draftJob.title;
  }
  return null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const matchAnalysis = await getMatchMeta(id);
  const base = formatTitle(matchAnalysis);
  return staticPageMetadata(
    base ? `${base} — Match Analysis` : "Match Analysis",
  );
}

export { default } from "@/modules/match-analyses/details/page/MatchAnalysisPage";
