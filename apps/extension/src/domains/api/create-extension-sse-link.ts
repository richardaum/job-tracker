import { ApolloLink, Observable } from "@apollo/client/core";
import { print } from "graphql";
import type { Client, ClientOptions } from "graphql-sse";
import { createClient } from "graphql-sse";

export class ExtensionSSELink extends ApolloLink {
  private readonly client: Client;

  constructor(options: ClientOptions) {
    super();
    this.client = createClient(options);
  }

  request(operation: ApolloLink.Operation): Observable<ApolloLink.Result> {
    return new Observable((sink) => {
      return this.client.subscribe(
        { ...operation, query: print(operation.query) },
        {
          next: (value) => sink.next(value as ApolloLink.Result),
          complete: () => sink.complete(),
          error: (error) => sink.error(error),
        },
      );
    });
  }

  dispose(): void {
    this.client.dispose();
  }
}

import { getAccessTokenFromCookie } from "@/domains/api/get-access-token-from-cookie";

export function createExtensionSSELink(
  graphqlSseUrl: string,
): ExtensionSSELink {
  const cookieUrl = new URL(graphqlSseUrl).origin;

  return new ExtensionSSELink({
    url: graphqlSseUrl,
    credentials: "include",
    headers: async (): Promise<Record<string, string>> => {
      const token = await getAccessTokenFromCookie(cookieUrl);
      if (!token) {
        return {};
      }
      return { Authorization: `Bearer ${token}` };
    },
  });
}
