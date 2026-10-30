import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Bundle the shared contract from source; no prebuild needed.
    alias: { shared: fileURLToPath(new URL("../../packages/shared/src/index.ts", import.meta.url)) },
  },
  test: {
    environment: "jsdom",
  },
});
