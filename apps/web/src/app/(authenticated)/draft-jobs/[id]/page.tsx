import { tryRun } from "@job-tracker/try-run";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { staticPageMetadata } from "@/app/metadata";
import { getServerApiGraphqlUrl } from "@/lib/server-api-endpoints";

const GRAPHQL_URL = getServerApiGraphqlUrl();

function primaryListingUrl(
  urls: readonly string[] | null | undefined,
): string | null {
  const raw = urls?.[0]?.trim();
  return raw && raw.length > 0 ? raw : null;
}

async function getDraftCaptureMetaTitle(id: string) {
  const [cookieErr, cookieStore] = await tryRun(cookies());
  if (cookieErr) {
    return null;
  }

  const cookieHeader = cookieStore.toString();

  type JobMetaPayload = {
    data?: { job?: { title?: string | null; urls?: string[] } | null } | null;
    errors?: unknown;
  };

  const [fetchErr, response] = await tryRun(
    fetch(GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(cookieHeader ? { Cookie: cookieHeader } : {}),
      },
      body: JSON.stringify({
        query: `
          query JobDraftCaptureMeta($id: ID!) {
            job(id: $id) {
              id
              title
              urls
            }
          }
        `,
        variables: { id },
      }),
      cache: "no-store",
    }),
  );

  if (fetchErr || !response.ok) {
    return null;
  }

  const [jsonErr, payload] = await tryRun(
    response.json() as Promise<JobMetaPayload>,
  );
  if (jsonErr) {
    return null;
  }

  if (payload.errors) {
    return null;
  }

  const job = payload.data?.job ?? null;

  const title = job?.title?.trim() ?? "";
  if (title.length > 0) {
    return title.slice(0, 80);
  }

  const url = primaryListingUrl(job?.urls ?? null);
  if (!url) return null;
  const [urlErr, combined] = tryRun(() => {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname === "/" ? "" : u.pathname;
    const c = `${host}${path}`;
    return c.length > 80 ? `${c.slice(0, 77)}…` : c;
  });
  if (!urlErr) {
    return combined;
  }
  return url.slice(0, 80);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const title = await getDraftCaptureMetaTitle(id);

  return staticPageMetadata(title ?? "Draft job");
}

export { default } from "@/modules/draft-jobs/details/page/DraftJobDetailsPage";
