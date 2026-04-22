import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@ui": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: {
      reporter: ["text", "lcov"],
      include: ["src/components/**/*.{ts,tsx}"],
      exclude: [
        "src/components/**/*.test.{ts,tsx}",
        "src/components/**/*.stories.{ts,tsx}",
      ],
      thresholds: {
        lines: 80,
      },
    },
  },
});
