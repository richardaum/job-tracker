import { ApolloServerPluginSchemaReporting } from "@apollo/server/plugin/schemaReporting";
import type { ApolloDriverConfig } from "@nestjs/apollo";

export function apolloGraphOsPlugins(): ApolloDriverConfig["plugins"] {
  const key = process.env.APOLLO_KEY;
  const graphRef = process.env.APOLLO_GRAPH_REF;
  if (!key?.trim() || !graphRef?.trim()) {
    return [];
  }
  return [ApolloServerPluginSchemaReporting()];
}
