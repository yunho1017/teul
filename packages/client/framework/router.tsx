"use client";
import {
  startTransition,
  useCallback,
  useEffect,
  useInsertionEffect,
  useMemo,
  ReactNode,
} from "react";
import { RouterContext } from "./router/context";
import {
  ACTION_NAVIGATE,
  ACTION_REFRESH,
  ACTION_RESTORE,
  routerReducer,
} from "./router/reducer";
import { useReducer, useUnwrapState } from "./utils/useReducer";
import { createHrefFromUrl } from "./utils/createHrefFromUrl";
import {
  RouterState,
  RouterInstance,
  RouterAction,
  ReducerState,
} from "./router/types";

const { createFromReadableStream } = require("react-server-dom-webpack/client");

const initialState: Promise<RouterState> = new Promise(async (resolve) => {
  const response = await fetch(`/rsc?pathname=${window.location.pathname}`);
  const rscTree = createFromReadableStream(response.body);
  resolve({
    tree: rscTree,
    pushRef: {},
    canonicalUrl: createHrefFromUrl(new URL(window.location.href)),
  });
});

const cache = new Map<string, ReactNode>();

interface HistoryUpdaterProps {
  appRouterState: RouterState;
}

function HistoryUpdater({ appRouterState: routerState }: HistoryUpdaterProps) {
  useInsertionEffect(() => {
    const { pushRef, canonicalUrl, tree } = routerState;
    const historyState = {
      ...(pushRef.preserveCustomHistoryState ? window.history.state : {}),
    };

    if (!cache.get(canonicalUrl)) {
      cache.set(canonicalUrl, tree);
    }

    if (
      pushRef.pendingPush &&
      createHrefFromUrl(new URL(window.location.href)) !== canonicalUrl
    ) {
      pushRef.pendingPush = false;
      window.history.pushState(historyState, "", canonicalUrl);
    } else {
      window.history.replaceState(historyState, "", canonicalUrl);
    }
  }, [routerState]);
  return null;
}

export function Router() {
  const [state, dispatch] = useReducer(routerReducer, initialState);

  const navigate = useCallback(
    async (href: string, navigateType: "push" | "replace") => {
      try {
        const url = new URL(href, location.href);
        await dispatch({
          type: ACTION_NAVIGATE,
          navigateType,
          url: createHrefFromUrl(url),
        });
      } catch (error) {}
    },
    [dispatch]
  );

  const router: RouterInstance = useMemo(() => {
    return {
      back: () => window.history.back(),
      forward: () => window.history.forward(),
      replace: (href) => {
        startTransition(() => {
          navigate(href, "replace");
        });
      },
      push: (href) => {
        startTransition(() => {
          navigate(href, "push");
        });
      },
      refresh: () => {
        startTransition(() => {
          dispatch({
            type: ACTION_REFRESH,
            origin: window.location.origin,
          });
        });
      },
    };
  }, [dispatch, navigate]);

  useEffect(() => {
    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(
      window.history
    );

    window.history.pushState = function pushState(data, _unused, url) {
      return originalPushState(data, _unused, url);
    };

    window.history.replaceState = function replaceState(data, _unused, url) {
      return originalReplaceState(data, _unused, url);
    };

    const onPopState = () => {
      startTransition(() => {
        const url = createHrefFromUrl(new URL(window.location.href));
        dispatch({
          type: ACTION_RESTORE,
          url,
          tree: cache.get(url),
        });
      });
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
      window.removeEventListener("popstate", onPopState);
    };
  }, [dispatch]);

  const { tree } = useUnwrapState(state);

  return (
    <>
      <HistoryUpdater appRouterState={useUnwrapState(state)} />
      <RouterContext.Provider value={router}>{tree}</RouterContext.Provider>
    </>
  );
}
