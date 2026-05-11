import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { existsSync } from "fs";

// Check if the real Zama SDK is installed; if not, alias to the stub.
const zamaInstalled = existsSync(
  path.resolve(__dirname, "node_modules/@zama-fhe/relayer-sdk")
);

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // Alias @zama-fhe/relayer-sdk/bundle to the local stub when not installed.
      ...(zamaInstalled
        ? {}
        : {
            "@zama-fhe/relayer-sdk/bundle": path.resolve(__dirname, "./src/lib/zamaStub.ts"),
            "@zama-fhe/relayer-sdk": path.resolve(__dirname, "./src/lib/zamaStub.ts"),
          }),
    },
  },
  server: {
    port: 5173,
  },
  define: {
    global: "globalThis",
  },
  build: {
    rollupOptions: {
      // Do not make the Zama SDK external; it should be bundled.
      external: [],
    },
  },
});
