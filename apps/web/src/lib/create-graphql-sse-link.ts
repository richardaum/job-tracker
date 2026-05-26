import { ApolloLink, Observable } from "@apollo/client";
import { print } from "graphql";
import { type ClientOptions, createClient } from "graphql-sse";

export class GraphqlSseLink extends ApolloLink {
  private readonly client: ReturnType<typeof createClient>;

  constructor(options: ClientOptions) {
    super();
    this.client = createClient(options);
  }

  request(operation: ApolloLink.Operation): Observable<ApolloLink.Result> {
    return new Observable((sink) =>
      this.client.subscribe(
        { ...operation, query: print(operation.query) },
        {
          next: (value) => sink.next(value as ApolloLink.Result),
          complete: () => sink.complete(),
          error: (error) => sink.error(error),
        },
      ),
    );
  }
}

export function createGraphqlSseLink(graphqlSseUrl: string): GraphqlSseLink {
  return new GraphqlSseLink({ url: graphqlSseUrl, credentials: "include" });
}
