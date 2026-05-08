import { to } from "@job-tracker/async";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { staticPageMetadata } from "@/app/metadata";
import { serverEnv } from "@/env/server";

const GRAPHQL_URL =
  serverEnv.NEXT_PUBLIC_API_GRAPHQL_URL ?? "http://localhost:3101/graphql";

async function getDraftTitle(id: string) {
  const [cookieErr, cookieStore] = await to(cookies());
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

  const [fetchErr, response] = await to(
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

  const [jsonErr, payload] = await to(response.json() as Promise<DraftPayload>);
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
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");
    const path = u.pathname === "/" ? "" : u.pathname;
    const combined = `${host}${path}`;
    return combined.length > 80 ? `${combined.slice(0, 77)}…` : combined;
  } catch {
    return url.slice(0, 80);
  }
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
