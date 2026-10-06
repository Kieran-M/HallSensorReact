import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = fileURLToPath(new URL(".", import.meta.url));

function norm(id: string): string {
  return id.replace(/\\/g, "/");
}

function isPkg(id: string, name: string): boolean {
  const n = norm(id);
  return (
    n.includes(`/node_modules/${name}/`) ||
    n.includes(`/node_modules/${name}?`) ||
    n.endsWith(`/node_modules/${name}`)
  );
}

/**
 * Portable ESM embed build (base: './').
 * View switching is Zustand-only — never browser history / path routing.
 *
 * Chunking rules (Rolldown-sensitive):
 * - Only force-split react-vendor. Do NOT force three/charts/zustand into
 *   shared named chunks: @react-three depends on zustand, and a shared
 *   three-vendor chunk previously absorbed zustand/vanilla so the presets
 *   shell modulepreload of zustand also downloaded ~900KB of Three.js.
 * - three + r3f + recharts stay behind DesignPage's dynamic import().
 */
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  server: {
    watch: {
      usePolling: true,
    },
  },
  build: {
    target: "es2022",
    cssCodeSplit: true,
    sourcemap: false,
    chunkSizeWarningLimit: 1200,
    modulePreload: {
      resolveDependencies(_filename, deps) {
        return deps.filter((dep) => {
          const d = dep.replace(/\\/g, "/");
          if (d.includes("DesignPage")) return false;
          if (d.includes("three")) return false;
          if (d.includes("recharts")) return false;
          if (d.includes("@react-three")) return false;
          return true;
        });
      },
    },
    rollupOptions: {
      input: {
        main: resolve(rootDir, "index.html"),
        /** Host-site mount API: import { mountHallSim } from './embed-….js' */
        embed: resolve(rootDir, "src/embed.tsx"),
      },
      output: {
        chunkFileNames: "assets/[name]-[hash].js",
        entryFileNames: (ctx) =>
          ctx.name === "embed" ? "assets/embed-[hash].js" : "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash][extname]",
        manualChunks(id) {
          const n = norm(id);
          if (!n.includes("/node_modules/")) return;

          // Keep React on its own — needed by the presets shell.
          if (
            isPkg(n, "react") ||
            isPkg(n, "react-dom") ||
            isPkg(n, "scheduler")
          ) {
            return "react-vendor";
          }

          // Everything else (three, r3f, recharts, zustand) is left to the
          // automatic splitter so heavy deps stay with DesignPage.
        },
      },
    },
  },
});
