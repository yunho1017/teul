import { startTransition } from "react";
import type { FetchCache } from "../types.js";
import { mergeElementsPromise } from "./merge-elements.js";

const defaultFetchCache: FetchCache = {};

export const unstableCallServerRsc = async (
  funcId: string,
  args: unknown[],
  fetchCache: FetchCache = defaultFetchCache,
) => {
  const setElements = fetchCache.setElements!;
  const fetchRscInternal = fetchCache.fetchInternal!;
  const rscPath = funcId;
  const rscParams =
    args.length === 1 && args[0] instanceof URLSearchParams ? args[0] : args;
  const { _value: value, ...data } = await fetchRscInternal(rscPath, rscParams);
  if (Object.keys(data).length) {
    startTransition(() => {
      setElements((prev) => mergeElementsPromise(prev, data));
    });
  }
  return value;
};
