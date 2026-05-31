import "server-only";

import { HttpLink } from "@apollo/client";
import { ApolloClient, InMemoryCache, registerApolloClient } from "@apollo/client-integration-nextjs";
import { cookies } from "next/headers";

import { getServerApiGraphqlUrl } from "@/lib/server-api-endpoints";

export const { getClient, query, PreloadQuery } = registerApolloClient(async () => {
  const cookieStore = await cookies();

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      uri: getServerApiGraphqlUrl(),
      fetch: (uri, options) =>
        fetch(uri, { ...options, headers: { ...options?.headers, cookie: cookieStore.toString() } }),
    }),
  });
});
