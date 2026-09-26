import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

/**
 * Must be named `getRouter` — TanStack Start's hydration entry imports that
 * exact symbol from this file. Exporting `createRouter` instead fails the build
 * with a MISSING_EXPORT pointing at hydrateStart.js, which is a confusing place
 * to be told about a naming convention.
 */
export const getRouter = () =>
  createRouter({
    routeTree,
    defaultPreload: "intent",
    scrollRestoration: true,
  });

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
