import type { Metadata } from "next";
import { cookies } from "next/headers";

import { staticPageMetadata } from "@/app/metadata";
import { serverEnv } from "@/env/server";

const GRAPHQL_URL =
  serverEnv.NEXT_PUBLIC_API_GRAPHQL_URL ?? "http://localhost:3101/graphql";

async function getApplicationTitle(id: string) {
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
          query ApplicationMeta($id: ID!) {
            application(id: $id) {
              id
              title
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
      data?: { application?: { title?: string | null } | null };
    };
    return payload.data?.application?.title ?? null;
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
  const title = await getApplicationTitle(id);

  return staticPageMetadata(title ? `${title} — Notes` : "Application notes");
}

export { default } from "@/modules/applications/details/page/ApplicationNotesPage";
