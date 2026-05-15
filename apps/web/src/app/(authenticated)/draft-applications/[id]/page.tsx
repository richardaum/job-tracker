import { tryRun } from "@job-tracker/try-run";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { staticPageMetadata } from "@/app/metadata";
import { serverEnv } from "@/env/server";
import { getServerApiGraphqlUrl } from "@/lib/server-api-endpoints";

const GRAPHQL_URL = getServerApiGraphqlUrl(
  serverEnv.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:3101",
);

async function getDraftTitle(id: string) {
  const [cookieErr, cookieStore] = await tryRun(cookies());
  if (cookieErr) {
    return null;
  }

  const cookieHeader = cookieStore.toString();

  type DraftPayload = {
    data?: {
      draftApplication?: { url?: string | null; title?: string | null } | null;
    };
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
          query DraftApplicationMeta($id: ID!) {
            draftApplication(id: $id) {
              id
              url
              title
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
    response.json() as Promise<DraftPayload>,
  );
  if (jsonErr) {
    return null;
  }

  if (payload.errors) {
    return null;
  }

  const title = payload.data?.draftApplication?.title?.trim() ?? "";
  if (title.length > 0) {
    return title.slice(0, 80);
  }

  const url = payload.data?.draftApplication?.url ?? null;
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
  const title = await getDraftTitle(id);

  return staticPageMetadata(title ?? "Draft application");
}

export { default } from "@/modules/draft-applications/details/page/DraftApplicationDetailsPage";
