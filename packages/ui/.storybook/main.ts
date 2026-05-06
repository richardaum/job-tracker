// This file has been automatically migrated to valid ESM format by Storybook.
import { createRequire } from "node:module";

import type { StorybookConfig } from "@storybook/react-vite";
import tailwindcss from "@tailwindcss/vite";
import mdxMermaid from "mdx-mermaid";
import path from "path";
import remarkGfm from "remark-gfm";
import { fileURLToPath } from "url";
import { mergeConfig } from "vite";

import { storybookDocsRewritePlugin } from "./vite-plugin-storybook-docs-rewrite.ts";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, "../../..");
const require = createRequire(import.meta.url);
const addonDocsBlocks = require.resolve("@storybook/addon-docs/blocks");

const config: StorybookConfig = {
  stories: [
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    "../../../docs/**/*.mdx",
  ],
  addons: [
    {
      name: getAbsolutePath("@storybook/addon-docs"),
      options: {
        mdxPluginOptions: {
          mdxCompileOptions: { remarkPlugins: [remarkGfm, mdxMermaid] },
        },
      },
    },
    getAbsolutePath("@storybook/addon-vitest"),
  ],
  framework: { name: getAbsolutePath("@storybook/react-vite"), options: {} },
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
            "@ui": path.resolve(currentDir, "../src"),
            // MDX under repo `docs/` must resolve UI devDependencies (pnpm layout).
            "@storybook/addon-docs/blocks": addonDocsBlocks,
          },
        },
      },
    );
  },
};

export default config;

function getAbsolutePath(value: string): string {
  return path.dirname(
    fileURLToPath(import.meta.resolve(`${value}/package.json`)),
  );
}
