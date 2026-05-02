type GraphqlResponse<T> = { data?: T; errors?: { message: string }[] };

/**
 * POST `/graphql` with session cookies (`credentials: "include"` · spec 023).
 */
export async function extensionGraphqlRequest<T>(
  apiBaseUrl: string,
  body: { query: string; variables?: Record<string, unknown> },
): Promise<GraphqlResponse<T>> {
  const base = apiBaseUrl.replace(/\/$/, "");
  const res = await fetch(`${base}/graphql`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  try {
    return (await res.json()) as GraphqlResponse<T>;
  } catch {
    return {};
  }
}
