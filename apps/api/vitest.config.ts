import path from "path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Keep SWC in Vitest to preserve NestJS decorator metadata during test transforms.
  plugins: [swc.vite({ module: { type: "es6" } })],
  // SWC handles source transforms, so disable Vite's default transforms together.
  oxc: false,
  resolve: { alias: { "@api": path.resolve(__dirname, "src") } },
  test: {
    environment: "node",
    include: ["src/**/*.spec.ts", "src/**/*.integration.ts"],
    setupFiles: ["./vitest.setup.ts"],
    fileParallelism: false,
  },
});
