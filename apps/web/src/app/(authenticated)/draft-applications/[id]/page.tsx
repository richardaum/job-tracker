import type { Metadata } from "next";
import { cookies } from "next/headers";

import { staticPageMetadata } from "@/app/metadata";
import { serverEnv } from "@/env/server";

const GRAPHQL_URL =
  serverEnv.NEXT_PUBLIC_API_GRAPHQL_URL ?? "http://localhost:3101/graphql";

async function getDraftTitle(id: string) {
  try {
    const cookieStore = await cookies();
    const cookieHeader = cookieStore.toString();
    const response = await fetch(GRAPHQL_URL, {
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
            }
          }
        `,
        variables: { id },
      }),
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const payload = (await response.json()) as {
      data?: { draftApplication?: { url?: string | null } | null };
      errors?: unknown;
    };
    if (payload.errors) {
      return null;
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
  } catch {
    return null;
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
