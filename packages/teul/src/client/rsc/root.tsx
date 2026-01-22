"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import type { ReactNode } from "react";
import { ElementsContext } from "./contexts/elements-context.js";
import { RefetchContext } from "./contexts/refetch-context.js";
import { EnhanceContext } from "./contexts/enhance-context.js";
import type { EnhanceFetchRscInternal } from "./contexts/enhance-context.js";
import type { FetchCache } from "./types.js";
import { fetchRsc } from "./utils/fetch-rsc.js";
import { mergeElementsPromise } from "./utils/merge-elements.js";
import { createFetchRscInternal } from "./utils/create-fetch-internal.js";

const DEFAULT_HTML_HEAD = [
  <meta key="charset" charSet="utf-8" />,
  <meta
    key="viewport"
    name="viewport"
    content="width=device-width, initial-scale=1"
  />,
];

const defaultFetchCache: FetchCache = {};

export interface RootProps {
  initialRscPath?: string;
  initialRscParams?: unknown;
  fetchCache?: FetchCache;
  children: ReactNode;
}

export function Root({
  initialRscPath,
  initialRscParams,
  fetchCache = defaultFetchCache,
  children,
}: RootProps) {
  fetchCache.fetchInternal ||= createFetchRscInternal(fetchCache);

  const enhanceFetchRscInternal: EnhanceFetchRscInternal = useMemo(() => {
    const enhancers = new Set<Parameters<EnhanceFetchRscInternal>[0]>();
    const enhance = () => {
      let fetchRscInternal = createFetchRscInternal(fetchCache);
      for (const fn of enhancers) {
        fetchRscInternal = fn(fetchRscInternal);
      }
      fetchCache.fetchInternal = fetchRscInternal;
    };
    return (fn) => {
      enhancers.add(fn);
      enhance();
      return () => {
        enhancers.delete(fn);
        enhance();
      };
    };
  }, [fetchCache]);

  const [elements, setElements] = useState(() =>
    fetchRsc(initialRscPath || "", initialRscParams, fetchCache),
  );

  useEffect(() => {
    fetchCache.setElements = setElements;
  }, [fetchCache]);

  const refetch = useCallback(
    async (rscPath: string, rscParams?: unknown) => {
      delete fetchCache.entry;
      const data = fetchRsc(rscPath, rscParams, fetchCache);
      const dataWithoutErrors = Promise.resolve(data).catch(() => ({}));
      setElements((prev) => mergeElementsPromise(prev, dataWithoutErrors));
      await data;
    },
    [fetchCache],
  );

  return (
    <EnhanceContext.Provider value={enhanceFetchRscInternal}>
      <RefetchContext.Provider value={refetch}>
        <ElementsContext.Provider value={elements}>
          {DEFAULT_HTML_HEAD}
          {children}
        </ElementsContext.Provider>
      </RefetchContext.Provider>
    </EnhanceContext.Provider>
  );
}
