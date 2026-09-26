import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

/**
 * Build configuration for the trip portal.
 *
 * Intentionally a near-copy of the marketing site's config rather than a shared
 * file. The two applications deploy to different domains on different
 * schedules, and a shared build config is the first thing that quietly couples
 * them back together — a plugin bump for the website should never be able to
 * break a customer's live itinerary.
 *
 * Port 5200 so both apps can run at once in development; the site uses 5199.
 */
export default defineConfig({
  plugins: [
    tsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart(),
    viteReact(),
    nitro(),
  ],
  resolve: {
    dedupe: ["react", "react-dom", "@tanstack/react-router", "@tanstack/react-store"],
  },
  server: { port: 5200 },
});
