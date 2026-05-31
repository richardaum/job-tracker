import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "config/**/*.test.{ts,tsx}"],
    coverage: {
      reporter: ["text", "lcov"],
      include: [
        "src/app/page.tsx",
        "src/hooks/**/*.{ts,tsx}",
        "src/env/client.ts",
        "src/lib/make-apollo-client.ts",
      ],
      exclude: ["**/*.test.{ts,tsx}"],
      thresholds: { lines: 80 },
    },
  },
  resolve: {
    alias: [
      {
        find: "@/app/icon.svg",
        replacement: path.resolve(
          __dirname,
          "./src/test/stubs/jobTrackerAppIcon.stub.ts",
        ),
      },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      {
        find: "@ui",
        replacement: path.resolve(__dirname, "../../packages/ui/src"),
      },
    ],
  },
});
