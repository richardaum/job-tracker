import { tryRun } from "@job-tracker/try-run";
import type { Metadata } from "next";
import { cookies } from "next/headers";

import { staticPageMetadata } from "@/app/metadata";
import { serverEnv } from "@/env/server";

const GRAPHQL_URL =
  serverEnv.NEXT_PUBLIC_API_GRAPHQL_URL ?? "http://localhost:3101/graphql";

async function getApplicationTitle(id: string) {
  const [cookieErr, cookieStore] = await tryRun(cookies());
  if (cookieErr) {
    return null;
  }

  const cookieHeader = cookieStore.toString();

  type ApplicationPayload = {
    data?: { application?: { title?: string | null } | null };
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
    }),
  );

  if (fetchErr || !response.ok) {
    return null;
  }

  const [jsonErr, payload] = await tryRun(
    response.json() as Promise<ApplicationPayload>,
  );
  if (jsonErr) {
    return null;
  }

  return payload.data?.application?.title ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const title = await getApplicationTitle(id);

  return staticPageMetadata(title ?? "Application details");
}

export { default } from "@/modules/applications/details/page/ApplicationDetailsPage";
