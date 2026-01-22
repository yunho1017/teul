import type { ReactNode } from "react";
import type { PathSpec } from "../../../utils/path.js";

export type SlotId = string;

export type RouterConfig = {
  type: "route";
  path: PathSpec;
  isStatic: boolean;
  pathPattern?: PathSpec;
  rootElement: { isStatic?: boolean };
  routeElement: { isStatic?: boolean };
  elements: Record<SlotId, { isStatic?: boolean }>;
  noSsr?: boolean;
};

export type MyConfig = {
  type: "route";
  pathSpec: PathSpec;
  pathname: string | undefined;
  pattern: string;
  specs: {
    rootElementIsStatic: boolean;
    routeElementIsStatic: boolean;
    staticElementIds: SlotId[];
    isStatic: boolean;
    noSsr: boolean;
    is404: boolean;
  };
}[];

export type RouteHandlerResult = {
  rootElement: ReactNode;
  routeElement: ReactNode;
  elements: Record<SlotId, unknown>;
};

export type DefineRouterFunctions = {
  getConfig: () => Promise<Iterable<RouterConfig>>;
  handleRoute: (
    path: string,
    options: {
      query?: string;
    },
  ) => Promise<RouteHandlerResult>;
};
