"use client";

import { createContext } from "react";
import type { RouteProps } from "../../../server/router/utils.js";

export type ChangeRoute = (
  route: RouteProps,
  options: {
    shouldScroll: boolean;
    skipRefetch?: boolean;
  },
) => Promise<void>;

export const RouterContext = createContext<{
  route: RouteProps;
  changeRoute: ChangeRoute;
} | null>(null);
