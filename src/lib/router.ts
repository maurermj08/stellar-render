import { createBrowserRouter, RouteObject } from "react-router-dom";

export const routes: RouteObject[] = [
  {
    path: "/",
    async lazy() {
      const { Home } = await import("@/pages/Home");
      return { Component: Home };
    },
  },
  {
    path: "/preview/:id",
    async lazy() {
      const { Preview } = await import("@/pages/Preview");
      return { Component: Preview };
    },
  },
  {
    path: "/customize/:id",
    async lazy() {
      const { Customize } = await import("@/pages/Customize");
      return { Component: Customize };
    },
  },
];

export const router = createBrowserRouter(routes);