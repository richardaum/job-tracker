import { tryRun } from "@job-tracker/try-run";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { staticPageMetadata } from "@/app/metadata";
import { getServerApiGraphqlUrl } from "@/lib/server-api-endpoints";
import { createServerSdk } from "@/lib/server-graphql";
import { formatJobPageTabTitle } from "@/modules/jobs/details/utils/job-detail-title";

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

export async function generateJobDetailMetadata(id: string, tabSuffix?: string): Promise<Metadata> {
  const meta = await getJobMeta(id);
  const title = formatJobPageTabTitle(meta?.title, meta?.company?.name, {
    tabLabel: tabSuffix,
  });
  return staticPageMetadata(title);
}
