import { ReactNode } from "react";

export interface RouterState {
  tree: ReactNode;
  canonicalUrl: string;
  pushRef: {
    pendingPush?: boolean;
    preserveCustomHistoryState?: boolean;
  };
}

export type ReducerState = RouterState | Promise<RouterState>;

export interface RouterInstance {
  back: () => void;
  forward: () => void;
  replace: (href: string) => void;
  push: (href: string) => void;
  refresh: () => void;
}

export type NavigateType = "push" | "replace";

export interface NavigateAction {
  type: "navigate";
  navigateType: NavigateType;
  url: string;
}

export interface RestoreAction {
  type: "restore";
  url: string;
  tree: ReactNode;
}

export interface RefreshAction {
  type: "refresh";
  origin: string;
}

export type RouterAction = NavigateAction | RestoreAction | RefreshAction;
