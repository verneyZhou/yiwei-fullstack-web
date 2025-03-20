import React from "react";
import { RouteObject, Navigate } from "react-router-dom";
import { lazyLoad } from "@/components/LazyLoad";
import Layout from "../components/layout";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "index",
        element: lazyLoad(React.lazy(() => import("../views/game"))),
      },
      {
        path: "leaderboard",
        element: lazyLoad(React.lazy(() => import("../views/leaderboard"))),
      },
      {
        path: "settings",
        element: lazyLoad(React.lazy(() => import("../views/settings"))),
      },
      {
        path: "*",
        element: <Navigate to="/404?type=project" />,
      },
    ],
  },
  {
    path: "/404",
    element: lazyLoad(React.lazy(() => import("../views/404"))),
  },
];

export default routes;