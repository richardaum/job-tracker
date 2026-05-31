import { fileURLToPath } from "node:url";

import { storybookTest } from "@storybook/addon-vitest/vitest-plugin";
import { playwright } from "@vitest/browser-playwright";
import path from "path";
import { defineConfig } from "vitest/config";
const dirname = typeof __dirname !== "undefined" ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  resolve: { alias: { "@ui": path.resolve(dirname, "src") } },
  test: {
    coverage: {
      reporter: ["text", "lcov"],
      include: ["src/components/**/*.{ts,tsx}"],
      exclude: ["src/components/**/*.test.{ts,tsx}", "src/components/**/*.stories.{ts,tsx}"],
      thresholds: { lines: 80 },
    },
    projects: [
      {
        extends: true,
        test: {
          name: "unit",
          environment: "jsdom",
          globals: true,
          setupFiles: ["./vitest.setup.ts"],
          include: ["src/**/*.test.{ts,tsx}"],
        },
      },
      {
        extends: true,
        plugins: [
          // The plugin will run tests for the stories defined in your Storybook config
          // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
          storybookTest({ configDir: path.join(dirname, ".storybook") }),
        ],
        test: {
          name: "storybook",
          browser: { enabled: true, headless: true, provider: playwright({}), instances: [{ browser: "chromium" }] },
        },
      },
    ],
  },
});
