import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { CodegenConfig } from "@graphql-codegen/cli";

const here = fileURLToPath(new URL(".", import.meta.url));

const config: CodegenConfig = {
  schema: join(here, "../api/src/schema.gql"),
  documents: ["src/graphql/**/*.graphql"],
  generates: {
    "src/gql/": { preset: "client" },
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
