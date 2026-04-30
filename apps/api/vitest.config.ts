import path from "path";
import { defineConfig } from "vitest/config";
import swc from "unplugin-swc";

export default defineConfig({
  // Keep SWC in Vitest to preserve NestJS decorator metadata during test transforms.
  plugins: [swc.vite({ module: { type: "es6" } })],
  resolve: { alias: { "@api": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts"],
    setupFiles: ["./vitest.setup.ts"],
    fileParallelism: false,
  },
});
