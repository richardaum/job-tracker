import type { CodegenConfig } from "@graphql-codegen/cli";

const API_GRAPHQL_URL =
  process.env.API_GRAPHQL_URL ?? "http://localhost:3101/graphql";

const config: CodegenConfig = {
  schema: API_GRAPHQL_URL,
  documents: ["src/graphql/**/*.graphql"],
  generates: {
    "src/gql/": {
      preset: "client",
    },
    "src/gql/hooks.ts": {
      plugins: [
        "typescript",
        "typescript-operations",
        "typescript-react-apollo",
      ],
      config: {
        withHooks: true,
        withHOC: false,
        withComponent: false,
        withSuspense: false,
        apolloReactHooksImportFrom: "@apollo/client/react",
        gqlImport: "@apollo/client#gql",
        useTypeImports: true,
      },
    },
  },
  ignoreNoDocuments: false,
};

export default config;
