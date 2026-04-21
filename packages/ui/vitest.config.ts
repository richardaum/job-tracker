import path from "path";
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
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
        lines: 70,
      },
    },
  },
});
