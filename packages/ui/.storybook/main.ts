import { createRequire } from "node:module";

import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import mdxMermaid from "mdx-mermaid";
import path from "path";
import remarkGfm from "remark-gfm";
import { fileURLToPath } from "url";
import { mergeConfig } from "vite";

import { storybookDocsRewritePlugin } from "./vite-plugin-storybook-docs-rewrite.ts";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(dirname, "../../..");
const require = createRequire(import.meta.url);
const addonDocsBlocks = require.resolve("@storybook/addon-docs/blocks");

const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../../docs/**/*.mdx",
  ],
  addons: [
    {
      name: "@storybook/addon-docs",
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: { remarkPlugins: [remarkGfm, mdxMermaid] },
        },
      },
    },
    "@storybook/addon-vitest",
  ],
  framework: { name: "@storybook/react-vite", options: {} },
  async viteFinal(baseConfig) {
    return mergeConfig(
      {
        ...baseConfig,
        plugins: [
          storybookDocsRewritePlugin(repoRoot),
          ...(baseConfig.plugins ?? []),
        ],
      },
      {
        plugins: [tailwindcss()],
        resolve: {
          alias: {
            "@ui": path.resolve(dirname, "../src"),
            // MDX under repo `docs/` must resolve UI devDependencies (pnpm layout).
            "@storybook/addon-docs/blocks": addonDocsBlocks,
          },
        },
      },
    );
  },
};

export default config;
