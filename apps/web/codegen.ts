import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { CodegenConfig } from "@graphql-codegen/cli";

const here = fileURLToPath(new URL(".", import.meta.url));

const config: CodegenConfig = {
  schema: join(here, "../api/src/schema.gql"),
  documents: ["src/graphql/**/*.graphql"],
  generates: {
    "src/gql/": { preset: "client" },
    // TODO: Legacy hooks.ts generation via typescript-react-apollo plugin.
    // Migrate to the client preset (see src/gql/) and delete the hooks.ts
    // output + the postprocess-codegen-hooks.mjs workaround script.
    "src/gql/hooks.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-react-apollo"],
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
    "src/gql/sdk.ts": {
      plugins: ["typescript", "typescript-operations", "typescript-graphql-request"],
      config: { useTypeImports: true, rawRequest: false },
    },
  },
  ignoreNoDocuments: false,
};

export default config;
