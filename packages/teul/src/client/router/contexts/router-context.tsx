"use client";

import { createContext } from "react";
import type { RouteProps } from "../../../server/router/common.js";
import type { TransitionFunction } from "react";

export type ChangeRoute = (
  route: RouteProps,
  options: {
    shouldScroll: boolean;
    skipRefetch?: boolean;
    unstable_startTransition?: ((fn: TransitionFunction) => void) | undefined;
  },
) => Promise<void>;

export const RouterContext = createContext<{
  route: RouteProps;
  changeRoute: ChangeRoute;
} | null>(null);
