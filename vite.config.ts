import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

/**
 * Build configuration.
 *
 * Every plugin is declared explicitly rather than pulled in through a wrapper
 * package, so the build has no dependency on a third-party scaffolding tool and
 * what runs is visible here.
 *
 * Plugin order matters: tsConfigPaths must resolve the `@/*` alias before
 * anything tries to follow an import, tanstackStart generates the route tree
 * that the React plugin then compiles, and nitro wraps the finished SSR bundle
 * for whichever deployment target is selected.
 *
 * The deployment target is chosen with NITRO_PRESET. It defaults to the Node
 * server; `vercel.json` sets `NITRO_PRESET=vercel` for production.
 */
export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    // Redirect the bundled server entry to src/server.ts, our SSR error wrapper.
    tanstackStart({ server: { entry: "server" } }),
    viteReact(),
    nitro(),
  ],
  // React and the TanStack packages must resolve to one copy each. Two copies
  // of React silently break hooks, and two routers break navigation.
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-store"],
  },
  server: {
    port: 5199,
  },
});
