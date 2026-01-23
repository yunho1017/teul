"use client";

import { useState, useCallback } from "react";
import type { RouteProps } from "../../server/router/common.js";
import { encodeRoutePath } from "../../server/router/common.js";
import { RouterContext } from "./contexts/router-context.js";
import type { ChangeRoute } from "./contexts/router-context.js";
import { Slot } from "../rsc/slot.js";
import { useRefetch } from "../rsc/hooks/use-refetch.js";
import { useRouteCache } from "./hooks/use-route-cache.js";
import { useFetchEnhancer } from "./hooks/use-fetch-enhancer.js";
import { useHashSync } from "./hooks/use-hash-sync.js";
import { usePopstate } from "./hooks/use-popstate.js";
import { handleScroll } from "./utils/handle-scroll.js";
import { getRouteSlotId } from "./utils/helpers.js";
import { createRscParams } from "./utils/create-rsc-params.js";
import type { TransitionFunction } from "react";

export interface InnerRouterProps {
  initialRoute: RouteProps;
}

export function InnerRouter({ initialRoute }: InnerRouterProps) {
  const { staticPaths, cachedIds } = useRouteCache();
  const refetch = useRefetch();

  const [route, setRoute] = useState(() => ({
    ...initialRoute,
    hash: "",
  }));

  const [err, setErr] = useState<unknown>(null);

  useFetchEnhancer(cachedIds);
  useHashSync(initialRoute, setRoute);

  const changeRoute: ChangeRoute = useCallback(
    async (route, options) => {
      const startTransitionFn = (fn: TransitionFunction) => fn();
      setErr(null);

      const { skipRefetch } = options || {};
      if (!staticPaths.has(route.path) && !skipRefetch) {
        const rscPath = encodeRoutePath(route.path);
        const rscParams = createRscParams(route.query);
        try {
          await refetch(rscPath, rscParams);
        } catch (e) {
          setErr(e);
          throw e;
        }
      }

      startTransitionFn(() => {
        if (options.shouldScroll) {
          handleScroll();
        }
        setRoute(route);
      });
    },
    [staticPaths, refetch],
  );

  usePopstate(changeRoute);

  const routeElement =
    err !== null ? (
      <h1>Error: {String(err)}</h1>
    ) : (
      <Slot id={getRouteSlotId(route.path)} />
    );

  return (
    <RouterContext.Provider value={{ route, changeRoute }}>
      <Slot id="root">{routeElement}</Slot>
    </RouterContext.Provider>
  );
}
