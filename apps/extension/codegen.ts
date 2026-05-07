import { join } from "node:path";
import { fileURLToPath } from "node:url";

import type { CodegenConfig } from "@graphql-codegen/cli";

const here = fileURLToPath(new URL(".", import.meta.url));

const config: CodegenConfig = {
  schema: join(here, "../api/src/schema.gql"),
  documents: ["src/graphql/**/*.graphql"],
  generates: { "src/gql/": { preset: "client" } },
  ignoreNoDocuments: false,
};

export default config;
