import type { FetchCache, Elements } from "../types.js";

const defaultFetchCache: FetchCache = {};

export const fetchRsc = (
  rscPath: string,
  rscParams?: unknown,
  fetchCache: FetchCache = defaultFetchCache,
): Promise<Elements> => {
  const fetchRscInternal = fetchCache.fetchInternal!;
  const entry = fetchCache.entry;
  if (entry && entry.rscPath === rscPath && entry.rscParams === rscParams) {
    return entry.elementsPromise;
  }
  const data = fetchRscInternal(rscPath, rscParams);
  fetchCache.entry = { rscPath, rscParams, elementsPromise: data };
  return data;
};
