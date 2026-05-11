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
      // When SDK is absent, alias /web and bare import to the stub so build succeeds.
      // When SDK is present, no alias — Vite resolves via package.json "exports".
      ...(zamaInstalled
        ? {}
        : {
            "@zama-fhe/relayer-sdk/web": path.resolve(__dirname, "./src/lib/zamaStub.ts"),
            "@zama-fhe/relayer-sdk": path.resolve(__dirname, "./src/lib/zamaStub.ts"),
          }),
    },
  },
  optimizeDeps: {
    // Exclude from esbuild pre-bundling.
    // web.js uses new URL('./workerHelpers.js', import.meta.url) and
    // new URL('tfhe_bg.wasm', import.meta.url) — these must stay relative to
    // lib/web.js, not to a pre-bundled chunk at .vite/deps/.
    exclude: zamaInstalled ? ["@zama-fhe/relayer-sdk/web"] : [],
  },
  server: {
    port: 5173,
    headers: {
      // Required for SharedArrayBuffer (WASM threads). Without these,
      // initSDK() gracefully degrades to single-thread mode — encryption
      // still works, just slower.
      "Cross-Origin-Opener-Policy": "same-origin",
      "Cross-Origin-Embedder-Policy": "credentialless",
    },
  },
  define: {
    global: "globalThis",
  },
  build: {
    rollupOptions: {
      external: [],
    },
  },
});
